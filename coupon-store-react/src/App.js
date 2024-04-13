
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Import Routes, Route, and Link
import './App.css';
import Dashboard from './Components/Dashboard';
import PaymentSuccess from './Components/PaymentSuccess';
import RedeemGiftcard from './Components/RedeemGiftcard';

function App() {
  return (
    <Router>
      <div className="App">
        <ul>
        <li><a href="/">Dashboard</a></li>
        <li><a href="/redeem-giftcard">Redeem Giftcard</a></li>
        </ul>
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* Route for Dashboard */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/redeem-giftcard" element={<RedeemGiftcard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;