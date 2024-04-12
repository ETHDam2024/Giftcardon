
import React from 'react';
import { useRef, useState, useEffect } from 'react';
// import {generateCommitment} from "./CommitmentUtils"
import { buildMimcSponge } from 'https://cdn.jsdelivr.net/npm/circomlibjs@0.1.7/+esm'
import { ethers } from 'ethers'; // Importing ethers library
// import snarkjs from 'snarkjs'; // Importing snarkjs library


function PaymentSuccess() {
  const [commitment, setCommitment] = useState(null);

  useEffect(() => {
    // Call the generateCommitment function when the component mounts
    const generateCommitmentAsync = async () => {
      try {
        // Generate the commitment
        const newCommitment = await generateCommitment();
        console.log(newCommitment);

        // Handle the generated commitment
        setCommitment(newCommitment);
        
        // You can perform additional actions here, such as storing the commitment in your database
      } catch (error) {
        console.error('Error generating commitment:', error);
        // Handle error
      }
    };

    generateCommitmentAsync();
  }, []);

  let randomBytes;
  randomBytes = function(length) {
      const buffer = new Uint8Array(length);
      window.crypto.getRandomValues(buffer);
      return buffer;
  };

  async function generateCommitment() {
      const mimc = await buildMimcSponge();
      const nullifier = ethers.toBigInt(randomBytes(31)).toString();
      const secret = ethers.toBigInt(randomBytes(31)).toString();
      const commitment = mimc.F.toString(mimc.multiHash([nullifier, secret]));
      const nullifierHash = mimc.F.toString(mimc.multiHash([nullifier]));
      return {
          nullifier: nullifier,
          secret: secret,
          commitment: commitment,
          nullifierHash: nullifierHash
      };
  }

  return (
    <div>
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase. Your payment has been successfully processed.</p>
      {commitment && (
        <div>
          <p>Commitment: {commitment.commitment}</p>
          {/* Display other commitment details if needed */}
        </div>
      )}
      {/* Add additional content as needed */}
    </div>
  );
}

export default PaymentSuccess;
