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
      searchText: null,
      dataLoadInProgress: false,
      containerVisible: this.props.isInline,
      selectedIndex: -1,
      renderItems: []
    };
  }

  componentDidMount() {
    this._subscribeDOMEvents();

    const publicApi = {
      positionDropdown: this._positionDropdownIfVisible.bind(this),
      hideDropdown: this._hideDropdown.bind(this)
    };

    this._safeCallback(this.props.ready, publicApi);
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

    if (_.isEmpty(this.props.children)) {
      return ReactDOM.createPortal(
        this._getContainer(),
        WINDOW.document.body,
      );
    }

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
        return null;
      }
    });

    return (
      <React.Fragment>
        {children}
        {this._getContainer()}
      </React.Fragment>
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
        searchText={this.state.searchText}
        items={this.state.renderItems}
        selectedIndex={this.state.selectedIndex}
        dropdownHeight={this.state.dropdownHeight}
        noMatchItemEnabled={this.props.noMatchItemEnabled}
        renderNoMatchItem={this.props.renderNoMatchItem}
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
        break;
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

  /**
   * @param {number} itemOffset 
   */
  _getItemIndexFromOffset(itemOffset) {
    const itemIndex = this.state.selectedIndex + itemOffset;
    if (itemIndex >= this.state.renderItems.length) {
      return -1;
    }

    return itemIndex;
  }

  /**
   * @param {number} itemIndex 
   */
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

  /**
   * @param {number} itemIndex 
   * @returns {string}
   */
  _getSelectedCssClass(itemIndex) {
    return (itemIndex === this.state.selectedIndex) ? this.props.selectedCssClass : '';
  }

  /**
   * @param {string} searchText
   */
  _tryQuery(searchText) {
    // query only if minimum number of chars are typed; else hide dropdown
    if ((this.props.minimumChars === 0)
      || (searchText && searchText.length >= this.props.minimumChars)) {
      this._waitAndQuery(searchText);
      return;
    }

    this._autoHide();
  }

  /**
   * @param {string} searchText
   * @param {number} delay
   */
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

  /**
   * @param {string} searchText
   * @param {number} pageIndex
   */
  _query(searchText, pageIndex) {
    /** @type {QueryArgs} */
    const queryArgs = {
      searchText: searchText,
      paging: {
        pageIndex: pageIndex,
        pageSize: this.props.pageSize
      },
      queryId: ++this._queryCounter
    };

    const renderListFn = (this.props.pagingEnabled ? this._renderPagedList : this._renderList);

    return this._queryAndRender(queryArgs, renderListFn.bind(this, queryArgs));
  }

  /**
   * @param {QueryArgs} queryArgs
   * @param {function(Array): Promise} renderListFn
   */
  _queryAndRender(queryArgs, renderListFn) {
    const options = this.props;

    // backup original search term in case we need to restore if user hits ESCAPE
    this._originalSearchText = queryArgs.searchText;
    this.setState({
      dataLoadInProgress: true,
      searchText: queryArgs.searchText
    });

    this._safeCallback(options.loading);

    return Promise
      .resolve(options.data(queryArgs.searchText, queryArgs.paging))
      .then(data => {
        // verify that the queryId did not change since the possibility exists that the
        // search text changed before the 'data' promise was resolved. Say, due to a lag
        // in getting data from a remote web service.
        if (this._didQueryIdChange(queryArgs)) {
          this._autoHide();
          return;
        }

        if (this._shouldHideDropdown(queryArgs, data)) {
          this._autoHide();
          return;
        }

        renderListFn(data).then(this._show);

        // callback
        this._safeCallback(options.loadingComplete);
      })
      .catch(error => {
        // callback
        this._safeCallback(options.loadingComplete, { error: error });
      })
      .finally(() => {
        this.setState({ dataLoadInProgress: false });
      });
  }

  /**
   * @param {function()} callback
   * @param {Object} callbackArgs
   */
  _safeCallback(callback, callbackArgs) {
    try {
      if (_.isFunction(callback)) {
        callback.call(this._target, callbackArgs);
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

    let width = null;
    if (options.dropdownWidth && options.dropdownWidth !== 'auto') {
      width = options.dropdownWidth;
    }
    else {
      // same as textbox width
      width = this._target.getBoundingClientRect().width + 'px';
    }

    let height = options.dropdownHeight ? (options.dropdownHeight + 'px') : null;

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

  /**
   * @param {QueryArgs} queryArgs
   * @param {Array} data
   * @returns {boolean}
   */
  _shouldHideDropdown(queryArgs, data) {
    // do not hide the dropdown if the no match item is enabled
    // because the no match item is rendered within the dropdown container
    if (this.props.noMatchItemEnabled) {
      return false;
    }

    // do we have data to render?
    if (!_.isEmpty(data)) {
      return false;
    }

    // if paging is enabled hide the dropdown only when rendering the first page
    if (this.props.pagingEnabled) {
      return (queryArgs.paging.pageIndex === 0);
    }

    return true;
  }

  /**
   * @param {QueryArgs} queryArgs
   * @returns {boolean}
   */
  _didQueryIdChange(queryArgs) {
    return (queryArgs.queryId !== this._queryCounter);
  }

  /**
   * @param {QueryArgs} queryArgs
   * @param {Array} data
   * @returns {Promise}
   */
  _renderList(queryArgs, data) {
    if (_.isEmpty(data)) {
      return Promise.resolve();
    }

    return this._getRenderItemFn().then(renderItemFn => {
      this.setState({
        renderItems: this._getRenderItems(renderItemFn, data, queryArgs)
      });
    });
  }

  /**
   * @param {QueryArgs} queryArgs 
   * @param {Array} data 
   * @returns {Promise}
   */
  _renderPagedList(queryArgs, data) {
    if (_.isEmpty(data)) {
      return Promise.resolve();
    }

    return this._getRenderItemFn().then(renderItemFn => {
      const items = this._getRenderItems(renderItemFn, data, queryArgs);

      this._currentPageIndex = queryArgs.paging.pageIndex;
      this._endOfPagedList = (items.length < this.props.pageSize);

      // in case of paged list we add to the array instead of replacing it
      this.setState({
        renderItems: [...this.state.renderItems, ...items]
      });
    });
  }

  /**
   * @param {function(RenderItemArgs): Item} renderItemFn 
   * @param {Array} data
   * @param {QueryArgs} queryArgs
   * @returns {Array.<Item>}
   */
  _getRenderItems(renderItemFn, data, queryArgs) {
    // limit number of items rendered in the dropdown
    const dataItemsToRender = _.slice(data, 0, this.props.maxItemsToRender);

    var itemsToRender = dataItemsToRender.map((data, index) => {
      // invoke render callback
      // this should return an object with 'label' and 'value' properties where
      // 'label' is for display and 'value' is the text for the textbox
      // If the object has an 'id' property, it will be used as the 'key' in the dropdown list

      /** @type {RenderItemArgs} */
      const renderItemArgs = {
        data: data,
        index: index,
        searchText: queryArgs.searchText
      };
      const item = renderItemFn(renderItemArgs);

      if (!item || !item.hasOwnProperty('label') || !item.hasOwnProperty('value')) {
        return null;
      }

      // store the data on the item itself
      item.data = data;
      // unique 'id' for use in the 'key' in the dropdown list
      item.id = item.hasOwnProperty('id') ? item.id : (item.value + item.label + index);

      return item;
    });

    return _.filter(itemsToRender, function (item) {
      return (item !== null);
    });
  }

  /**
   * @returns {Promise.<function(RenderItemArgs): Item>}
   */
  _getRenderItemFn() {
    // user provided function
    const renderItemFn = this.props.renderItem;
    if (_.isFunction(renderItemFn) && renderItemFn !== Fn.noop) {
      return Promise.resolve(renderItemFn.bind(null));
    }

    // default
    return Promise.resolve(this._renderItemFn.bind(null));
  }

  /**
   * @param {RenderItemArgs} args
   * @returns {Item}
   */
  _renderItemFn(args) {
    const data = args.data;
    const value = (_.isObject(data) && this.props.selectedTextAttr) ? data[this.props.selectedTextAttr] : data;

    return (
      {
        value: value,
        label: <div>{data}</div>
      }
    );
  }

  /**
   * @returns {boolean}
   */
  _shouldLoadNextPage() {
    return this.props.pagingEnabled
      && !this.state.dataLoadInProgress
      && !this._endOfPagedList;
  }

  /**
   * @param {number} itemIndex
   * @returns {boolean}
   */
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
   * Set to true to display a message when no items match the search text.
   * @default true
   */
  noMatchItemEnabled: true,
  /**
   * Callback for custom rendering of the message when no items match the search text. The callback receives an object
   * with a "searchText" property. This function must return a JSX.
   * If a callback is not provided, the default JSX used is <span>No results match '{searchText}'></span>
   * @default noop
   */
  renderNoMatchItem: Fn.noop,
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
   * This must return an object with "value" and "label" properties where "label" is the JSX
   * for display and "value" is the text for the textbox. If the object has an "id" property,
   * it will be used as the "key" when rendering the dropdown list.
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
  noMatchItemEnabled: PropTypes.bool.isRequired,
  renderNoMatchItem: PropTypes.func,
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

  /**
   * @param {Object} nextProps
   */
  componentWillReceiveProps(nextProps) {
    this._setNoMatchItemIfEmpty(nextProps);
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

  /**
   * @param {itemIndex} number
   */
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

  /**
   * @returns {JSX.Element}
   */
  _renderListItems() {
    if (!_.isEmpty(this.props.items)) {
      return this._createDataItems();
    }

    if (this.props.noMatchItemEnabled) {
      return this._createNoMatchItem();
    }

    return null;
  }

  /**
   * @returns {JSX.Element}
   */
  _createDataItems() {
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

  /**
   * @returns {JSX.Element}
   */
  _createNoMatchItem() {
    return (
      <li className="auto-complete-item auto-complete-no-match">
        {this.state.noMatchItem}
      </li>
    );
  }

  /**
   * @param {Object} nextProps
   */
  _setNoMatchItemIfEmpty(nextProps) {
    if (!_.isEmpty(nextProps.items) || !nextProps.noMatchItemEnabled) {
      return;
    }

    this._getRenderNoMatchItemFn().then(renderItemFn => {
      this.setState({
        noMatchItem: renderItemFn({ searchText: this.props.searchText })
      });
    });
  }

  /**
   * @returns {Promise}
   */
  _getRenderNoMatchItemFn() {
    // user provided function
    const renderNoMatchItem = this.props.renderNoMatchItem;
    if (_.isFunction(renderNoMatchItem) && renderNoMatchItem !== Fn.noop) {
      return Promise.resolve(renderNoMatchItem.bind(null));
    }

    // default
    return Promise.resolve(this._renderNoMatchItem.bind(null));
  }

  /**
   * @param {RenderNoMatchItemArgs} args
   * @returns {JSX.Element}
   */
  _renderNoMatchItem(args) {
    return (
      <span>No results match '{args.searchText}'</span>
    );
  }

  /**
   * @returns {string}
   */
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
  searchText: PropTypes.string,
  selectedIndex: PropTypes.number.isRequired,
  dropdownHeight: PropTypes.string,
  noMatchItemEnabled: PropTypes.bool.isRequired,
  renderNoMatchItem: PropTypes.func,
  getSelectedCssClass: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired
};

function HelperService() {
  var components = [];
  var instanceCount = 0;
  var activeInstanceId = 0;

  /**
   * @param {AutoComplete} component
   * @returns {number}
   */
  this.registerComponent = component => {
    if (component) {
      components.push(component);
      return ++instanceCount;
    }

    return -1;
  };

  /**
   * @param {number} instanceId
   */
  this.setActiveInstanceId = instanceId => {
    activeInstanceId = instanceId;
    this.hideAllInactive();
  };

  this.hideAllInactive = () => {
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

/**
 * @typedef {Object} Item
 * @property {string} value
 * @property {Object} label
 * @property {string} id
 */

/**
 * @typedef {Object} RenderItemArgs
 * @property {Object} data
 * @property {number} index
 * @property {string} searchText
 */

/**
 * @typedef {Object} RenderNoMatchItemArgs
 * @property {string} searchText
 */

/**
 * @typedef {Object} PagingArgs
 * @property {number} pageIndex
 * @property {number} pageSize
 */

/**
 * @typedef {Object} QueryArgs
 * @property {string} searchText
 * @property {PagingArgs} paging
 * @property {number} queryId
 */
