// Dashboard.js

import React from 'react';

function Dashboard() {
  const paymentLink = 'https://buy.stripe.com/test_cN2cQy1qg1Ei5l6bIL';  // Payment Link URL from Stripe

  return (
    <div>
      <h1>Gift Card</h1>
      <div className="gift-card">
        <img className="gift-card-image" src="/Picture1.png" alt="Gift Card" />
        <a className="button" href={paymentLink} target="_blank" rel="noopener noreferrer">Buy your Gift Card</a>
        <a className= "button" href="redeem-giftcard">Redeem your Giftcard</a>
      </div>
    </div>
  );
}

export default Dashboard;
