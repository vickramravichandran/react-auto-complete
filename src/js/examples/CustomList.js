import React from 'react';
import AutoComplete from '@vickram/react-auto-complete';
import "@vickram/react-auto-complete/dist/AutoComplete.css";
import { getFormattedCode } from 'Helper';
import { COLORS } from 'examples/MockData';

export default class CustomList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this._itemSelected = this._itemSelected.bind(this);
  }

  render() {
    return (
      <div className="scenario">
        <div>
          <h3 className="config-title">Custom List</h3>
          <AutoComplete
            containerCssClass="color-codes"
            selectedTextAttr="name"
            data={this._getData}
            renderItem={this._renderItem}
            itemSelected={this._itemSelected}
          >
            <div>
              <input
                type="text"
                style={{ width: '300px' }}
                className="form-control"
                placeholder="Color Name. Try 'r' or 'b'"
              />
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

    return COLORS.filter(x => x.name.startsWith(searchText));
  }

  _renderItem(item, index) {
    return (
      {
        value: item.name,
        label: <table className='auto-complete'>
          <tbody>
            <tr>
              <td style={{ width: '60%' }}>{item.name}</td>
              <td style={{ width: '10%', backgroundColor: item.code }}></td>
              <td style={{ width: '30%', paddingLeft: '10px' }}>{item.code}</td>              
            </tr>
          </tbody>
        </table>
      }
    );
  }

  _itemSelected(e) {
    this.setState({ selectedColor: e.item });
  }

  _getCode() {
    return (`import AutoComplete from '@vickram/react-auto-complete';
import { COLORS } from 'examples/MockData';

class App extends React.Component {

  render() {
    return (
      <AutoComplete
        containerCssClass="color-codes"
        selectedTextAttr="name"
        data={this.getData}
        renderItem={this.renderItem}
        itemSelected={this.itemSelected} >
          <input type="text"
            placeholder="Color Name. Try 'r' or 'b'" />
      </AutoComplete>
    );
  }
  
  getData(searchText) {
    searchText = searchText.toUpperCase();

    return COLORS.filter(x => x.name.startsWith(searchText));
  }

  renderItem(item, index) {
    return (
    {
      value: item.name,
      label: <table className='auto-complete'>
        <tbody>
          <tr>
            <td style={{ width: '60%' }}>{item.name}</td>
            <td style={{ width: '30%' }}>{item.code}</td>
            <td style={{ width: '10%', backgroundColor: item.code }}></td>
          </tr>
        </tbody>
      </table>
    }
    );
  }

  itemSelected(e) {
    this.setState({ selectedColor: e.item });
  }
}`
    );
  }
}
