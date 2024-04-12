
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
        <nav>
        <Link to="/">Dashboard</Link> {/* Add navigation links */}
        <Link to="/payment-success">Payment Success</Link> {/* navigation link */}
        <Link to="/redeem-giftcard">Redeem Giftcard</Link>
        </nav>
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