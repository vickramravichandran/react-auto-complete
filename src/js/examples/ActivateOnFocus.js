import React from 'react';
import AutoComplete from '@vickram/react-auto-complete';
import "@vickram/react-auto-complete/dist/AutoComplete.css";
import { getFormattedCode } from 'Helper';
import { BREAKFAST } from 'examples/MockData';

export default class ActivateOnFocus extends React.Component {

  render() {
    return (
      <div className="scenario">
        <div>
          <h3 className="config-title">Activate List on Focus</h3>
          <AutoComplete
            minimumChars={0}
            activateOnFocus={true}
            hideDropdownOnWindowResize={false}
            data={this._getData}
          >
            <div>
              <input
                type="text"
                style={{ width: '200px' }}
                className="form-control"
                placeholder="Breakfast"
              />
            </div>
          </AutoComplete>
        </div>
        {getFormattedCode(this._getCode)}
      </div >
    );
  }

  _getData(searchText) {
    searchText = searchText.toUpperCase();

    return BREAKFAST.filter(food => food.startsWith(searchText));
  }


  _getCode() {
    return (`import AutoComplete from '@vickram/react-auto-complete';
import { COLORS } from 'examples/MockData';

class App extends React.Component {

  render() {
    return (
      <AutoComplete
        minimumChars={0}
        activateOnFocus={true}
        data={this.getData}>
          <input type="text" placeholder="Breakfast" />
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
