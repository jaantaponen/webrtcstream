import React, {
  useState,
} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import Client from "./Client";
import Broadcast from "./Broadcast";
const App = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/broadcast">
            <Broadcast />
          </Route>
          <Route path="/">
            <Client />
          </Route>
          <Route path="/client">
            <Client />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;