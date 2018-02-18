import React from 'react';
import AutoComplete from '@vickram/react-auto-complete';
import "@vickram/react-auto-complete/dist/AutoComplete.css";
import { getFormattedCode } from 'Helper';
import { COLORS } from 'examples/MockData';

export default class SimpleList extends React.Component {

  render() {
    return (
      <div>
        <div className="scenario">
          <div>
            <h3 className="config-title">Simple List</h3>
            <AutoComplete
              data={this._getData}
            >
              <div>
                <input
                  type="text"
                  style={{ width: '200px' }}
                  className="form-control"
                  placeholder="Color Name. Try 'r' or 'b'"
                />
              </div>
            </AutoComplete>
          </div>
          {getFormattedCode(this._getCode)}
        </div>
      </div>
    );
  }

  _getData(searchText) {
    searchText = searchText.toUpperCase();

    return COLORS
      .filter(x => x.name.startsWith(searchText))
      .map(x => x.name);
  }

  _getCode() {
    return (`import AutoComplete from '@vickram/react-auto-complete';
import { COLORS } from 'examples/MockData';

class App extends React.Component {

  render() {
    return (
      <AutoComplete
        data={this.getData}>
          <input type="text"
            placeholder="Color Name. Try 'r' or 'b'" />
      </AutoComplete>
    );
  }
  
  getData(searchText) {
    searchText = searchText.toUpperCase();

    return COLORS
      .filter(x => x.name.startsWith(searchText))
      .map(x => x.name);
  }
}`
    );
  }
}
