
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Dashboard from './Components/Dashboard'; // Import the Dashboard component
import PaymentSuccess from './Components/PaymentSuccess'; // Import the PaymentSuccess component

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/payment-success" component={PaymentSuccess} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
