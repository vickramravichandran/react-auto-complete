import React from 'react';
import AutoComplete from '@vickram/react-auto-complete';
import "@vickram/react-auto-complete/dist/AutoComplete.css";
import { getFormattedCode } from 'Helper';
import axios from 'axios';

export default class RemoteDataSource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="scenario">
        <div>
          <h3 className="config-title">Remote Data Source</h3>
          <AutoComplete
            data={this._getData}
            loading={() => this.loading = true}
            loadingComplete={() => this.loading = false}
          >
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                style={{ width: '300px' }}
                className="form-control"
                placeholder="USA State Name. Try 'a' or 'n'"
              />
              {this.loading && <span className="loading" />}
            </div>
          </AutoComplete>
          {this.state.selectedColor &&
            <div className="selected-json">
              <pre>{JSON.stringify(this.state.selectedColor, null, 2)}</pre>
            </div>
          }
        </div>
        {getFormattedCode(this._getCode)}
      </div>
    );
  }

  _getData(searchText) {
    searchText = searchText.toUpperCase();

    return axios
      .get('data-files/usa_states.json')
      .then(function (response) {
        if (!response || _.isEmpty(response.data)) {
          return [];
        }

        return response.data.filter(state =>
          state.name.startsWith(searchText)
        ).map(x => x.name);
      });
  }

  _getCode() {
    return (`import AutoComplete from '@vickram/react-auto-complete';
import axios from 'axios';

class App extends React.Component {

  render() {
    return (
      <AutoComplete
        data={this.getData}>
          <input type="text"
            placeholder="USA State Name. Try 'a' or 'n'" />
      </AutoComplete>
    );
  }
  
  getData(searchText) {
    searchText = searchText.toUpperCase();

    return axios
      .get('data-files/usa_states.json')
      .then(function (response) {

        if (!response || _.isEmpty(response.data)) {
          return [];
        }

        return response.data.filter(state =>
          state.name.startsWith(searchText)
        ).map(x => x.name);

      });
  }
}`
    );
  }
}
