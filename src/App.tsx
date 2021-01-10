import React from "react";
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";
/* pages */
import Home from "./pages/Home/Home";
/* style */
import './theme/custom.scss';
import './theme/default.css';
import ConnectionError from "./pages/ConnectionError/ConnectionError";

function App() {
    return (
        <Router>
                <Switch>
                    <Route path="/error" component={ConnectionError} exact={true}/>
                    <Route path="/" component={Home}/>
                </Switch>
        </Router>
    );
}

export default App;
