// Dashboard.js

import React from 'react';

function Dashboard() {
  const paymentLink = 'https://buy.stripe.com/test_6oEbMuc4U96K00MdQS';  // Payment Link URL from Stripe

  return (
    <div>
      <h1>Gift Card</h1>
      <div className="gift-card">
        <img className="gift-card-image" src="/Picture1.png" alt="Gift Card" />
        <a className="buy-button" href={paymentLink} target="_blank" rel="noopener noreferrer">Buy Gift Card</a>
        <a href="RedeemGiftcard.js">Redeem Giftcard</a>
      </div>
    </div>
  );
}

export default Dashboard;
