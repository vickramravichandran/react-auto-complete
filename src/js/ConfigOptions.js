import React from "react";
import axios from "axios";

export default class ConfigOptions extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      options: [],
      moreDocs: {
        ready: {
          docArray: [
            {
              'positionDropdown()': 'Positions the dropdown list'
            },
            {
              'hideDropdown()': 'Hides the dropdown list'
            }
          ]
        }
      }
    };
  }

  componentDidMount() {
    axios.get('docs.json').then(response => {
      this._processResponse(response);
    });
  }

  render() {
    return (
      <div className="config-options">
        <h2 id="config-options">Options</h2>
        <ul className="options">
          {this._renderOptionListItems()}
        </ul>
      </div>
    );
  }

  _renderOptionListItems() {
    return this.state.options.map(option =>
      <li key={option.name}>

        <h5>{option.name}</h5>

        {option.bindAsHtml ?
          <p dangerouslySetInnerHTML={{ __html: option.description }}></p> :
          <p>{option.description}</p>
        }

        {this._renderDocArray(option.docArray)}

        <div>
          <i>default: <span>{option.default}</span></i>
        </div>

      </li>
    );
  }

  _renderDocArray(docArray) {
    if (_.isEmpty(docArray)) {
      return null;
    }

    var listItems = docArray.map((arr, index) =>
      <li key={index}>
        {
          _.map(arr, (key, val) =>
            <span key={key}>
              <b>{key}:</b> {val}
            </span>
          )
        }
      </li>
    );

    return (
      <ul>
        {listItems}
      </ul>
    );
  }

  _processResponse(response) {
    if (!response) {
      return;
    }

    this.setState({ options: this._createOptions(response.data) || [] });
  }

  _createOptions(jsDocs) {
    if (_.isEmpty(jsDocs)) {
      return;
    }

    var defaultOptions = jsDocs.filter(jsDoc => {
      return jsDoc.memberof === 'AutoComplete.defaultProps';
    });
    if (_.isEmpty(defaultOptions)) {
      return;
    }

    return defaultOptions.map(jsDoc => {
      var optionName = jsDoc.name;

      var doc = {
        name: optionName,
        description: this._getDescription(jsDoc),
        default: this._getDescriptionFromTag(jsDoc, 'default'),
        bindAsHtml: (this._getDescriptionFromTag(jsDoc, 'bindAsHtml') === 'true'),
      };

      if (this.state.moreDocs[optionName]) {
        doc = _.merge({}, doc, this.state.moreDocs[optionName]);
      }

      return doc;
    });
  }

  _getDescription(jsDoc) {
    return this._getDescriptionFromTag(jsDoc, 'description') ||
      this._getDescriptionParagraph(jsDoc);
  }

  _getDescriptionParagraph(jsDoc) {
    if (!jsDoc || !jsDoc.description || _.isEmpty(jsDoc.description.children)) {
      return;
    }

    var paragraph = _.find(jsDoc.description.children, { type: 'paragraph' });
    if (!paragraph || _.isEmpty(paragraph.children)) {
      return;
    }

    return _.reduce(paragraph.children, function (memo, child) {
      return memo + child.value;
    }, '');
  }

  _getDescriptionFromTag(jsDoc, tagTitle) {
    if (!jsDoc || _.isEmpty(jsDoc.tags)) {
      return;
    }

    var tag = _.find(jsDoc.tags, { title: tagTitle });
    if (!tag) {
      return;
    }

    return tag.description;
  }
}
