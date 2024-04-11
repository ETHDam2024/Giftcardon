import React from 'react';
import './App.css';

function App() {
  const paymentLink = 'https://buy.stripe.com/test_7sI17Q6KA1Ei00M144'; // Payment Link URL from Stripe

  return (
    <div className="App">
      <h1>Gift Card</h1>
      <div className="gift-card">
        <img className="gift-card-image" src="/pexels-lil-artsy-1390433.jpg" alt="Gift Card" />
        <a className="buy-button" href={paymentLink} target="_blank" rel="noopener noreferrer">Buy Gift Card</a>
      </div>
    </div>
  );
}


function redirectToStripe() {
  // Redirect to Stripe payment page
  window.location.href = 'https://stripe.com'; // Replace with your Stripe payment URL
}


export default App;
