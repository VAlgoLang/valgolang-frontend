import React from "react";
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";
/* pages */
import Home from "./pages/Home/Home";
/* style */
import './theme/custom.scss';
import './theme/default.css';

function App() {
    return (
        <Router>
                <Switch>
                    <Route path="/" component={Home}/>
                </Switch>
        </Router>
    );
}

export default App;
