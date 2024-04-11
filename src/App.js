// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Import Routes, Route, and Link
import './App.css';
import Dashboard from './Components/Dashboard';
import PaymentSuccess from './Components/PaymentSuccess';

function App() {
  return (
    <Router>
      <div className="App">
        <Link to="/">Dashboard</Link> {/* Add navigation links */}
        <Link to="/payment-success">Payment Success</Link> {/* Add navigation links */}

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
