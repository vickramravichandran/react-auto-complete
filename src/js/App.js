import React from "react";
import { render } from "react-dom";
/*---examples---*/
import SimpleList from "examples/SimpleList";
import CustomList from "examples/CustomList";
import RemoteDataSource from "examples/RemoteDataSource";
import RemoteDataWithPaging from "examples/RemoteDataWithPaging";
import ActivateOnFocus from "examples/ActivateOnFocus";
import ScrollableList from "examples/ScrollableList";
/*---examples---*/

import "css/main.css";
import "css/prism-oceanic-next.css";
import "css/app.css";

import "vendor/scale.fix";
import "prismjs";
import "prismjs/components/prism-jsx";

class App extends React.PureComponent {
  render() {
    
    return (
      <div className="container-fluid">
        <div className="row" id="simple-list">
          <SimpleList />
        </div>
        <div className="row" id="custom-list">
          <CustomList />
        </div>
        <div className="row" id="remote-data-source">
          <RemoteDataSource />
        </div>
        <div className="row" id="remote-data-source-with-paging">
          <RemoteDataWithPaging />
        </div>
        <div className="row" id="activate-on-focus">
          <ActivateOnFocus />
        </div>
        <div className="row" id="scrollable-list">
          <ScrollableList />
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("app"));
