
// two inputs (nullifier, secret) and the button for redeem giftcard 
// need to show the user the secret and nullifier and tell them that they need to safe this information

import React, { useState } from 'react';

function RedeemGiftCard() {
    const [nullifier, setNullifier] = useState('');
    const [secret, setSecret] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent form from submitting in the traditional way
        console.log('Nullifier:', nullifier);
        console.log('Secret:', secret);

        // Here you can add any logic to handle the redemption process
        alert(`Gift Card Redeemed!\nNullifier: ${nullifier}\nSecret: ${secret}`);

        // Optionally reset the form fields after processing
        setNullifier('');
        setSecret('');
    };

    return (
        <div>
            <h1>Redeem Your Gift Card</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nullifier:
                    <input
                        type="text"
                        value={nullifier}
                        onChange={(e) => setNullifier(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label>
                    Secret:
                    <input
                        type="text"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        required
                    />
                </label>
                <br />
                <button type="submit">Redeem Giftcard</button>
            </form>
        </div>
    );
}

export default RedeemGiftCard;

