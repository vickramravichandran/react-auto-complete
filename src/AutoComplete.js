import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './AutoComplete.css';

const WINDOW = global.window;
const helperService = new HelperService();

export default class AutoComplete extends React.Component {
  constructor(props) {
    super(props);

    this._instanceId = helperService.registerComponent(this);

    this._bindMethods();

    this._originalSearchText = null;
    this._queryCounter = 0;
    this._endOfPagedList = false;
    this._currentPageIndex = 0;
    this._elementComponent = null;

    this.state = {
      dataLoadInProgress: false,
      containerVisible: this.props.isInline,
      selectedIndex: -1,
      renderItems: []
    };
  }

  componentDidMount() {
    this._subscribeDOMEvents();
    this._safeCallback(this.props.ready);
  }

  componentDidUpdate() {
    if (this.state.positionDropdownUsingJQuery) {
      this._positionUsingJQuery();
    }
  }

  componentWillUnmount() {
    this._unsubscribeDOMEvents();

    if (this._container) {
      this._container = null;
    }
  }

  initialize(target) {
    this._target = target;
    this._subscribeTargetDOMEvents();
  }

  render() {
    if (this.props.isInline) {
      return this._getAutoCompleteList();
    }

    if (!_.isEmpty(this.props.children)) {

      const children = React.cloneElement(this.props.children, {
        ref: (element) => {
          if (!element || element === this._elementComponent) {
            return;
          }

          this._elementComponent = element;

          if (element.tagName.toUpperCase() === 'INPUT') {
            return this.initialize(element);
          }

          const inputElement = element.querySelector('input');
          if (inputElement) {
            return this.initialize(inputElement);
          }

          console.warn('No input element was found in props.children collection');
        }
      });

      return (
        <React.Fragment>
          {children}
          {this._getContainer()}
        </React.Fragment>
      );
    }

    return ReactDOM.createPortal(
      this._getContainer(),
      WINDOW.document.body,
    );
  }

  _bindMethods() {
    this._handleWindowResize = this._handleWindowResize.bind(this);
    this._handleDocumentKeyDown = this._handleDocumentKeyDown.bind(this);
    this._handleDocumentClick = this._handleDocumentClick.bind(this);

    this._handleTargetFocus = this._handleTargetFocus.bind(this);
    this._handleTargetInput = this._handleTargetInput.bind(this);
    this._handleTargetKeyDown = this._handleTargetKeyDown.bind(this);
    this._handleScroll = this._handleScroll.bind(this);

    this._safeCallback = this._safeCallback.bind(this);
    this._show = this._show.bind(this);
    this._queryAndRender = this._queryAndRender.bind(this);
    this._getSelectedCssClass = this._getSelectedCssClass.bind(this);
    this._selectItem = this._selectItem.bind(this);

    this.initialize = this.initialize.bind(this);
  }

  _getContainer() {
    const classNames = classnames(
      this.props.containerCssClass,
      'auto-complete-container unselectable',
      { 'auto-complete-absolute-container': !this.props.isInline }
    );

    return (
      <div
        className={classNames}
        data-instance-id={this._instanceId}
        style={this._getContainerInlineStyle()}
        ref={x => this._container = x}
      >
        {this._getAutoCompleteList()}
      </div >
    );
  }

  _getContainerInlineStyle() {
    return {
      display: (this.state.containerVisible ? 'block' : 'none'),
      width: this.state.dropdownWidth,
      ...this.state.containerPosition
    };
  }

  _getAutoCompleteList() {
    return (
      <AutoCompleteList
        ref={x => this._autoCompleteList = x}
        items={this.state.renderItems}
        selectedIndex={this.state.selectedIndex}
        dropdownHeight={this.state.dropdownHeight}
        getSelectedCssClass={this._getSelectedCssClass}
        onItemClick={this._selectItem}
        onScroll={this._handleScroll}
      />
    );
  }

  _subscribeDOMEvents() {
    WINDOW.addEventListener(DOM_EVENT.RESIZE, this._handleWindowResize);
    WINDOW.document.addEventListener(DOM_EVENT.KEYDOWN, this._handleDocumentKeyDown);
    WINDOW.document.addEventListener(DOM_EVENT.CLICK, this._handleDocumentClick);
  }

  _subscribeTargetDOMEvents() {
    if (this._target) {
      this._target.addEventListener(DOM_EVENT.FOCUS, this._handleTargetFocus);
      this._target.addEventListener(DOM_EVENT.INPUT, this._handleTargetInput);
      this._target.addEventListener(DOM_EVENT.KEYDOWN, this._handleTargetKeyDown);
    }
  }

  _unsubscribeDOMEvents() {
    WINDOW.removeEventListener(DOM_EVENT.RESIZE, this._handleWindowResize);
    WINDOW.document.removeEventListener(DOM_EVENT.KEYDOWN, this._handleDocumentKeyDown);
    WINDOW.document.removeEventListener(DOM_EVENT.CLICK, this._handleDocumentClick);

    if (this._target) {
      this._target.removeEventListener(DOM_EVENT.FOCUS, this._handleTargetFocus);
      this._target.removeEventListener(DOM_EVENT.INPUT, this._handleTargetInput);
      this._target.removeEventListener(DOM_EVENT.KEYDOWN, this._handleTargetKeyDown);
    }
  }

  _handleWindowResize(event) {
    if (this.props.hideDropdownOnWindowResize) {
      this._autoHide();
    }
  }

  _handleDocumentKeyDown() {
    // hide inactive dropdowns when multiple auto complete exist on a page
    helperService.hideAllInactive();
  }

  _handleDocumentClick(event) {
    // hide inactive dropdowns when multiple auto complete exist on a page
    helperService.hideAllInactive();

    // ignore inline
    if (this.props.isInline) {
      return;
    }

    // no container. probably unmounted
    if (!this._container) {
      return;
    }

    // ignore target click
    if (event.target === this._target) {
      event.stopPropagation();
      return;
    }

    if (this._containerContainsTarget(event.target)) {
      event.stopPropagation();
      return;
    }

    this._autoHide();
  }

  _containerContainsTarget(target) {
    // use native Node.contains
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    if (_.isFunction(this._container.contains) && this._container.contains(target)) {
      return true;
    }

    // otherwise use .has() if jQuery is available
    if (WINDOW.jQuery) {
      const $container = WINDOW.jQuery(this._container);
      if (_.isFunction($container.has) && $container.has(target).length > 0) {
        return true;
      }
    }

    // assume target is not in container
    return false;
  }

  _handleTargetFocus(event) {
    // when the target(textbox) gets focus activate the corresponding container
    this._activate();

    if (this.props.activateOnFocus) {
      this._waitAndQuery(event.target.value, 100);
    }
  }

  _handleTargetInput(event) {
    this._tryQuery(event.target.value);
  }

  _handleTargetKeyDown(event) {
    const keyCode = event.charCode || event.keyCode || 0;

    if (ignoreKeyCode(keyCode)) {
      return;
    }

    switch (keyCode) {
      case KEYCODE.UPARROW:
        this._scrollToPreviousItem();
        event.stopPropagation();
        event.preventDefault();

        break;

      case KEYCODE.DOWNARROW:
        this._scrollToNextItem();
        event.stopPropagation();
        event.preventDefault();

        break;

      case KEYCODE.ENTER:
        this._selectItem(this.state.selectedIndex, true);
        //prevent postback upon hitting enter
        event.preventDefault();
        event.stopPropagation();

        break;

      case KEYCODE.ESCAPE:
        this._restoreOriginalText();
        this._autoHide();
        event.preventDefault();
        event.stopPropagation();

        break;

      default:
    }
  }

  _handleScroll(event) {
    if (!this.props.pagingEnabled || !this.state.containerVisible) {
      return;
    }

    const scrollList = event.target;
    // scrolled to the bottom?
    if ((scrollList.offsetHeight + scrollList.scrollTop) >= scrollList.scrollHeight) {
      this._tryLoadNextPage();
    }
  }

  _activate() {
    helperService.setActiveInstanceId(this._instanceId);
    this._originalSearchText = null;
  }

  _resetAndQuery(searchText) {
    this._empty();
    this._reset();

    return this._query(searchText, 0);
  }

  _show() {
    // the show() method is called after the items are ready for display
    // the textbox position can change (ex: window resize) when it has focus
    // so reposition the dropdown before it's shown
    this._positionDropdown();

    // callback
    this._safeCallback(this.props.dropdownShown);
  }

  _autoHide() {
    if (this.props.autoHideDropdown) {
      this._hideDropdown();
    }
  }

  _empty() {
    this.setState({
      selectedIndex: -1,
      renderItems: []
    });
  }

  _restoreOriginalText() {
    if (!this._originalSearchText) {
      return;
    }

    this._target.value = this._originalSearchText;
  }

  _scrollToPreviousItem() {
    const itemIndex = this._getItemIndexFromOffset(-1);
    if (itemIndex === -1) {
      return;
    }

    this._scrollToItem(itemIndex);
  }

  _scrollToNextItem() {
    const itemIndex = this._getItemIndexFromOffset(1);
    if (itemIndex === -1) {
      return;
    }

    this._scrollToItem(itemIndex);

    if (this._shouldLoadNextPageAtItemIndex(itemIndex)) {
      this._loadNextPage();
    }
  }

  _getItemIndexFromOffset(itemOffset) {
    const itemIndex = this.state.selectedIndex + itemOffset;
    if (itemIndex >= this.state.renderItems.length) {
      return -1;
    }

    return itemIndex;
  }

  _scrollToItem(itemIndex) {
    if (!this.state.containerVisible) {
      return;
    }

    this._selectItem(itemIndex);
    this._autoCompleteList.scrollToItem(itemIndex);
  }

  _selectItem(itemIndex, closeDropdownAndRaiseCallback) {
    const item = this.state.renderItems[itemIndex];
    if (!item) {
      return;
    }

    this.setState({ selectedIndex: itemIndex });
    this._updateTarget(item);

    if (closeDropdownAndRaiseCallback) {
      this._autoHide();
      this._safeCallback(this.props.itemSelected, { item: item.data });
    }
  }

  _getSelectedCssClass(itemIndex) {
    return (itemIndex === this.state.selectedIndex) ? this.props.selectedCssClass : '';
  }

  _tryQuery(searchText) {
    // query only if minimum number of chars are typed; else hide dropdown
    if ((this.props.minimumChars === 0) || (searchText && searchText.length >= this.props.minimumChars)) {
      this._waitAndQuery(searchText);
      return;
    }

    this._autoHide();
  }

  _waitAndQuery(searchText, delay) {
    // wait few millisecs before calling query(); this to check if the user has stopped typing
    let timer = setTimeout(function () {
      // has searchText unchanged?
      if (searchText === this._target.value) {
        this._resetAndQuery(searchText);
      }

      //cancel the timeout
      clearTimeout(timer);

    }.bind(this), (delay || 300));
  }

  _tryLoadNextPage() {
    if (this._shouldLoadNextPage()) {
      this._loadNextPage();
    }
  }

  _loadNextPage() {
    return this._query(this._originalSearchText, (this._currentPageIndex + 1));
  }

  _query(searchText, pageIndex) {
    const params = {
      searchText: searchText,
      paging: {
        pageIndex: pageIndex,
        pageSize: this.props.pageSize
      },
      queryId: ++this._queryCounter
    };

    const renderListFn = (this.props.pagingEnabled ? this._renderPagedList : this._renderList);

    return this._queryAndRender(params, renderListFn.bind(this, params));
  }

  _queryAndRender(params, renderListFn) {
    const self = this;
    const options = this.props;

    // backup original search term in case we need to restore if user hits ESCAPE
    this._originalSearchText = params.searchText;
    this.setState({ dataLoadInProgress: true });

    this._safeCallback(options.loading);

    return Promise
      .resolve(options.data(params.searchText, params.paging))
      .then((result) => {

        if (self._shouldHideDropdown(params, result)) {
          self._autoHide();
          return;
        }

        renderListFn(result).then(self._show);

        // callback
        self._safeCallback(options.loadingComplete);
      })
      .catch((error) => {
        self._autoHide();
        // callback
        self._safeCallback(options.loadingComplete, { error: error });
      })
      .then(() => {
        self.setState({ dataLoadInProgress: false });
      });
  }

  _safeCallback(fn, args) {
    try {
      if (_.isFunction(fn)) {
        fn.call(this._target, args);
      }
    } catch (ex) {
      //ignore
    }
  }

  _positionDropdownIfVisible() {
    if (this.state.containerVisible) {
      this._positionDropdown();
    }
  }

  _positionDropdown() {
    // no need to position if container is inline
    if (this.props.isInline) {
      return;
    }

    const options = this.props;
    const width = (options.dropdownWidth || this._target.getBoundingClientRect().width) + 'px';
    const height = options.dropdownHeight ? (options.dropdownHeight + 'px') : null;

    this.setState({
      dropdownWidth: width,
      dropdownHeight: height,
      containerVisible: true
    });

    // use the .position() function from jquery.ui if available (requires both jquery and jquery-ui)
    const hasJQueryUI = (WINDOW.jQuery && WINDOW.jQuery.ui);
    const positionDropdownUsingJQuery = options.positionUsingJQuery && hasJQueryUI;
    this.setState({ 'positionDropdownUsingJQuery': positionDropdownUsingJQuery });

    if (!positionDropdownUsingJQuery) {
      this._positionUsingDomAPI();
    }
  }

  _positionUsingJQuery() {
    const $ = WINDOW.jQuery;
    const options = this.props;
    const defaultPosition = {
      my: 'left top',
      at: 'left bottom',
      of: $(this._target),
      collision: 'none flip'
    };
    const position = _.extend({}, defaultPosition, options.positionUsing);

    $(this._container)
      .css('visibility', 'hidden') // jquery.ui position() requires the container to be visible to calculate its position.
      .position(position)
      .css('visibility', 'visible');
  }

  _positionUsingDomAPI() {
    const scrollTop = WINDOW.document.body.scrollTop || WINDOW.document.documentElement.scrollTop || WINDOW.pageYOffset;
    const scrollLeft = WINDOW.document.body.scrollLeft || WINDOW.document.documentElement.scrollLeft || WINDOW.pageXOffset;
    const rect = this._target.getBoundingClientRect();
    const position = {
      left: (rect.left + scrollLeft) + 'px',
      top: (rect.top + rect.height + scrollTop) + 'px'
    };

    this.setState({ containerPosition: position });
  }

  _updateTarget(item) {
    if (item) {
      this._target.value = item.value;
    }
  }

  _hideDropdown() {
    if (this.props.isInline || !this.state.containerVisible) {
      return;
    }

    this.setState({
      containerVisible: false,
      containerVisiblity: null
    });

    this._empty();
    this._reset();

    // callback
    this._safeCallback(this.props.dropdownHidden);
  }

  _shouldHideDropdown(params, result) {
    // verify the queryId since there might be some lag when getting data from a remote web service.
    if (params.queryId !== this._queryCounter) {
      return true;
    }

    // do we have results to render?
    const hasResult = (result && result.length !== 0);
    if (hasResult) {
      return false;
    }

    // if paging is enabled hide the dropdown only when rendering the first page
    if (this.props.pagingEnabled) {
      return (params.paging.pageIndex === 0);
    }

    return true;
  }

  _renderList(params, result) {
    if (_.isEmpty(result)) {
      return [];
    }

    const self = this;

    return this._getRenderFn().then(function (renderFn) {
      self.setState({
        renderItems: self._getRenderItems(renderFn, result)
      });
    });
  }

  _renderPagedList(params, result) {
    if (_.isEmpty(result)) {
      return [];
    }

    const self = this;

    return this._getRenderFn().then(function (renderFn) {
      const items = self._getRenderItems(renderFn, result);

      self._currentPageIndex = params.paging.pageIndex;
      self._endOfPagedList = (items.length < self.props.pageSize);

      self.setState({
        renderItems: [...self.state.renderItems, ...items]
      });
    });
  }

  _getRenderItems(renderFn, dataItems) {
    // limit number of items rendered in the dropdown
    const maxItemsToRender = (dataItems.length < this.props.maxItemsToRender) ? dataItems.length : this.props.maxItemsToRender;
    const dataItemsToRender = dataItems.slice(0, maxItemsToRender);

    var itemsToRender = dataItemsToRender.map((data, index) => {
      // invoke render callback with the data as parameter
      // this should return an object with a 'label' and 'value' property where
      // 'label' is the safe html for display and 'value' is the text for the textbox
      const item = renderFn(data);

      if (!item || !item.hasOwnProperty('label') || !item.hasOwnProperty('value')) {
        return null;
      }

      // store the data on the item itself
      item.data = data;
      // unique 'id' for use in the 'key' in the dropdown list template
      if (!item.hasOwnProperty('id') || !_.isString(item.id)) {
        item.id = (item.value + item.label + index);
      }

      return item;
    });

    return itemsToRender.filter(function (item) {
      return (item !== null);
    });
  }

  _getRenderFn() {
    const renderItem = this.props.renderItem;

    // user provided function
    if (_.isFunction(renderItem) && renderItem !== Fn.noop) {
      return Promise.resolve(renderItem);
    }

    // default
    return Promise.resolve(this._renderItem);
  }

  _renderItem(data) {
    const value = (_.isObject(data) && this.props.selectedTextAttr) ? data[this.props.selectedTextAttr] : data;
    return (
      {
        value: value,
        label: <div>{data}</div>
      }
    );
  }

  _shouldLoadNextPage() {
    return this.props.pagingEnabled
      && !this.state.dataLoadInProgress
      && !this._endOfPagedList;
  }

  _shouldLoadNextPageAtItemIndex(itemIndex) {
    if (!this._shouldLoadNextPage()) {
      return false;
    }

    const triggerIndex = this.state.renderItems.length - this.props.invokePageLoadWhenItemsRemaining - 1;
    return itemIndex >= triggerIndex;
  }

  _reset() {
    this._originalSearchText = null;
    this._currentPageIndex = 0;
    this._endOfPagedList = false;
  }
}

function HelperService() {
  var self = this;
  var components = [];
  var instanceCount = 0;
  var activeInstanceId = 0;

  this.registerComponent = function (component) {
    if (component) {
      components.push(component);
      return ++instanceCount;
    }

    return -1;
  };

  this.setActiveInstanceId = function (instanceId) {
    activeInstanceId = instanceId;
    self.hideAllInactive();
  };

  this.hideAllInactive = function () {
    components.forEach(component => {
      // hide if this is not the active instance
      if (component._instanceId !== activeInstanceId) {
        component._autoHide();
      }
    });
  };
}

const DOM_EVENT = {
  RESIZE: 'resize',
  SCROLL: 'scroll',
  CLICK: 'click',
  KEYDOWN: 'keydown',
  FOCUS: 'focus',
  INPUT: 'input'
};

const KEYCODE = {
  TAB: 9,
  ENTER: 13,
  CTRL: 17,
  ALT: 18,
  ESCAPE: 27,
  LEFTARROW: 37,
  UPARROW: 38,
  RIGHTARROW: 39,
  DOWNARROW: 40,
  MAC_COMMAND_LEFT: 91,
  MAC_COMMAND_RIGHT: 93
};

function ignoreKeyCode(keyCode) {
  return [
    KEYCODE.TAB,
    KEYCODE.ALT,
    KEYCODE.CTRL,
    KEYCODE.LEFTARROW,
    KEYCODE.RIGHTARROW,
    KEYCODE.MAC_COMMAND_LEFT,
    KEYCODE.MAC_COMMAND_RIGHT
  ].indexOf(keyCode) !== -1;
}

const Fn = { noop: () => { } };
AutoComplete.defaultProps = {
  /**
   * CSS class applied to the dropdown container.
   * @default null
   */
  containerCssClass: null,
  /**
   * CSS class applied to the selected list element.
   * @default auto-complete-item-selected
   */
  selectedCssClass: 'auto-complete-item-selected',
  /**
   * Minimum number of characters required to display the dropdown.
   * @default 1
   */
  minimumChars: 1,
  /**
   * Maximum number of items to render in the list.
   * @default 20
   */
  maxItemsToRender: 20,
  /**
   * If true displays the dropdown list when the textbox gets focus.
   * @default false
   */
  activateOnFocus: false,
  /**
   * Width in "px" of the dropddown list. This can also be applied using CSS.
   * @default null
   */
  dropdownWidth: null,
  /**
   * Maximum height in "px" of the dropddown list. This can also be applied using CSS.
   * @default null
   */
  dropdownHeight: null,
  /**
   * Set to true to display the dropdown list inline.
   * @default false
   */
  isInline: false,
  /**
   * If the data for the dropdown is a collection of objects, this should be the name 
   * of a property on the object. The property value will be used to update the input textbox.
   * @default null
   */
  selectedTextAttr: null,
  /**
   * Set to true to enable server side paging. See "data" callback for more information.
   * @default false
   */
  pagingEnabled: false,
  /**
   * The number of items to display per page when paging is enabled.
   * @default 5
   */
  pageSize: 5,
  /**
   * When using the keyboard arrow key to scroll down the list, the "data" callback will
   * be invoked when at least this many items remain below the current focused item.
   * Note that dragging the vertical scrollbar to the bottom of the list might also invoke a "data" callback.
   * @default 1
   */
  invokePageLoadWhenItemsRemaining: 1,
  /**
   * Set to true to position the dropdown list using the position() method from the jQueryUI library.
   * See <a href="https://api.jqueryui.com/position/">jQueryUI.position() documentation</a>
   * @default true
   * @bindAsHtml true
   */
  positionUsingJQuery: true,
  /**
   * Options that will be passed to jQueryUI position() method.
   * @default null
   */
  positionUsing: null,
  /**
   * Set to true to let the plugin hide the dropdown list. If this option is set to false you can hide the dropdown list
   * with the hideDropdown() method available in the ready callback.
   * @default true
   */
  autoHideDropdown: true,
  /**
   * Set to true to hide the dropdown list when the window is resized. If this option is set to false you can hide
   * or re-position the dropdown list with the hideDropdown() or positionDropdown() methods available in the ready.
   * callback.
   * @default true
   */
  hideDropdownOnWindowResize: true,
  /**
   * Callback after the plugin is initialized and ready.
   * @default noop
   */
  ready: Fn.noop,
  /**
   * Callback before the "data" callback is invoked.
   * @default noop
   */
  loading: Fn.noop,
  /**
   * Callback to get the data for the dropdown. The callback receives the search text as the first parameter.
   * If paging is enabled the callback receives an object with "pageIndex" and "pageSize" properties as the second parameter.
   * This function must return a promise.
   * @default noop
   */
  data: Fn.noop,
  /**
   * Callback after the items are rendered in the dropdown
   * @default noop
   */
  loadingComplete: Fn.noop,
  /**
   * Callback for custom rendering a list item. This is called for each item in the dropdown.
   * This must return an object literal with "value" and "label" properties where
   * "label" is the template for display and "value" is the text for the textbox.
   * If the object has an "id" property, it will be used as the "key" when rendering the dropdown list.
   * @default noop
   */
  renderItem: Fn.noop,
  /**
   * Callback after an item is selected from the dropdown. The callback receives an object with an "item" property representing the selected item.
   * @default noop
   */
  itemSelected: Fn.noop,
  /**
   * Callback after the dropdown is shown.
   * @default noop
   */
  dropdownShown: Fn.noop,
  /**
   * Callback after the dropdown is hidden.
   * @default noop
   */
  dropdownHidden: Fn.noop
};

AutoComplete.propTypes = {
  containerCssClass: PropTypes.string,
  selectedCssClass: PropTypes.string,
  minimumChars: PropTypes.number,
  maxItemsToRender: PropTypes.number,
  activateOnFocus: PropTypes.bool,
  dropdownWidth: PropTypes.number,
  dropdownHeight: PropTypes.number,
  isInline: PropTypes.bool,
  selectedTextAttr: PropTypes.string,
  pagingEnabled: PropTypes.bool,
  pageSize: PropTypes.number,
  invokePageLoadWhenItemsRemaining: PropTypes.number,
  positionUsingJQuery: PropTypes.bool,
  positionUsing: PropTypes.shape({
    my: PropTypes.string,
    at: PropTypes.string,
    of: PropTypes.any,
    collision: PropTypes.string
  }),
  autoHideDropdown: PropTypes.bool,
  hideDropdownOnWindowResize: PropTypes.bool,
  ready: PropTypes.func,
  loading: PropTypes.func,
  data: PropTypes.func.isRequired,
  loadingComplete: PropTypes.func,
  renderItem: PropTypes.func,
  itemSelected: PropTypes.func,
  dropdownShown: PropTypes.func,
  dropdownHidden: PropTypes.func
};

// <ul> element
class AutoCompleteList extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.scrollToItem = this.scrollToItem.bind(this);
  }

  componentDidMount() {
    this._subscribeDOMEvents();
  }

  componentWillUnmount() {
    this._unsubscribeDOMEvents();
  }

  render() {
    var style = {
      maxHeight: this.props.dropdownHeight
    };

    return (
      <ul
        ref={x => this._elementUL = x}
        style={style}
        className="auto-complete-results"
      >
        {this._renderListItems()}
      </ul>
    );
  }

  scrollToItem(itemIndex) {
    var attrSelector = 'li[data-index="' + itemIndex + '"]';

    // use jquery.scrollTo plugin if available
    // http://flesler.blogspot.com/2007/10/jqueryscrollto.html
    if (WINDOW.jQuery && WINDOW.jQuery.scrollTo) {
      const $elementUL = WINDOW.jQuery(this._elementUL);
      $elementUL.scrollTo($elementUL.find(attrSelector));
      return;
    }

    var li = this._elementUL.querySelector(attrSelector);
    if (li) {
      // this was causing the page to jump/scroll
      //    li.scrollIntoView(true);
      this._elementUL.scrollTop = li.offsetTop;
    }
  }

  _renderListItems() {
    var selectedCssClass = this._getSelectedCssClass();

    return this.props.items.map((item, index) => {

      var classNames = classnames(
        'auto-complete-item',
        { [selectedCssClass]: (index === this.props.selectedIndex) }
      );

      return (
        <li key={item.id}
          onClick={() => this.props.onItemClick(index, true)}
          className={classNames}
          data-index={index}
        >
          {item.label}
        </li>
      );
    });
  }

  _getSelectedCssClass() {
    var selectedIndex = this.props.selectedIndex;
    if (selectedIndex === -1) {
      return '';
    }

    return this.props.getSelectedCssClass(selectedIndex);
  }

  _subscribeDOMEvents() {
    this._elementUL.addEventListener(DOM_EVENT.SCROLL, this.props.onScroll);
  }

  _unsubscribeDOMEvents() {
    this._elementUL.removeEventListener(DOM_EVENT.SCROLL, this.props.onScroll);
  }
}

AutoCompleteList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.any]),
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.any])
  })).isRequired,
  selectedIndex: PropTypes.number.isRequired,
  dropdownHeight: PropTypes.string,
  getSelectedCssClass: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired
};
