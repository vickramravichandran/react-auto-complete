import React from 'react';
import AutoComplete from '@vickram/react-auto-complete';
import "@vickram/react-auto-complete/dist/AutoComplete.css";
import { getFormattedCode } from 'Helper';
import axios from 'axios';

export default class ScrollableList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="scenario">
        <div>
          <h3 className="config-title">Scrollable List</h3>
          <AutoComplete
            dropdownWidth={500}
            dropdownHeight={200}
            data={this._getData}
            renderItem={this._renderItem}
            loading={() => this.loading = true}
            loadingComplete={() => this.loading = false}
          >
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                style={{ width: '300px' }}
                className="form-control"
                placeholder="Airport Name. Try 'p' or 'c'"
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

  _getData(searchText, pagingParams) {
    searchText = searchText.toUpperCase();

    return axios
      .get('data-files/airports.json')
      .then(function (response) {

        if (!response || _.isEmpty(response.data)) {
          return [];
        }

        return response.data.filter(airport =>
          airport.iata === searchText || airport.name.startsWith(searchText)
        );
      });
  }

  _renderItem(args) {
    const data = args.data;

    return (
      {
        value: data.name,
        label: <p className='auto-complete'>{data.name}</p>
      }
    );
  }

  _getCode() {
    return (`import AutoComplete from '@vickram/react-auto-complete';
import axios from 'axios';

class App extends React.Component {

  render() {
    return (
      <AutoComplete
        dropdownWidth={500}
        dropdownHeight={200}
        data={this.getData}
        renderItem={this.renderItem}>
          <input type="text"
            placeholder="Airport Name. Try 'p' or 'c'" />
      </AutoComplete>
    );
  }
  
  getData(searchText, pagingParams) {
    searchText = searchText.toUpperCase();

    return axios
      .get('data-files/airports.json')
      .then(function (response) {

        if (!response || _.isEmpty(response.data)) {
          return [];
        }

        return response.data.filter(airport =>
          airport.iata === searchText || airport.name.startsWith(searchText)
        );
      });
  }

  renderItem(args) {
    const data = args.data;

    return (
      {
        value: data.name,
        label: <p className='auto-complete'>{data.name}</p>
      }
    );
  }
}`
    );
  }

}
