import React from 'react';
import AutoComplete from '@vickram/react-auto-complete';
import "@vickram/react-auto-complete/dist/AutoComplete.css";
import { getFormattedCode } from 'Helper';
import axios from 'axios';

export default class RemoteDataWithPaging extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="scenario">
        <div>
          <h3 className="config-title">Remote Data Source with Paging</h3>
          <AutoComplete
            dropdownWidth={500}
            dropdownHeight={200}
            pagingEnabled={true}
            pageSize={5}
            data={this._getData}
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

        const airports = response.data.filter(airport =>
          airport.name.startsWith(searchText)
        ).map(x => x.name);

        return getPage(airports, pagingParams.pageIndex, pagingParams.pageSize);
      });
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
        pagingEnabled={true}
        pageSize={5}
        data={this.getData}>
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

        const airports = response.data.filter(airport =>
          airport.name.startsWith(searchText)
        ).map(x => x.name);

        // getPage() function not shown for brevity
        return getPage(airports, pagingParams.pageIndex, pagingParams.pageSize);
      });
  }

}`
    );
  }

}

function getPage(data, pageIndex, pageSize) {
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;

  return data.slice(startIndex, endIndex);
}
