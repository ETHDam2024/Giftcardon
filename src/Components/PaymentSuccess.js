
import React from 'react';

import { useRef, useState } from 'react';

// Import necessary dependencies for integrating the CommitmentUtils.js script
import { ethers } from 'ethers'; // Importing ethers library
import snarkjs from 'snarkjs'; // Importing snarkjs library
import randomBytes from 'random-bytes'; // Importing random-bytes library
import {WebView} from "react-native-webview"
import HTML from "./public/Commitment"
  const webViewRef = useRef(null);

function PaymentSuccess() {
  const [commitment, setCommitment] = useState(null);

  useEffect(() => {
    // Call the generateCommitment function when the component mounts
    const generateCommitmentAsync = async () => {
      try {
        // Generate the commitment
        const newCommitment = await generateCommitment();

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

  // Function to handle messages received from WebView
  const handleMessage = (event) => {
    console.log("data:", event.nativeEvent.data)
    if(event.nativeEvent.data === undefined || event.nativeEvent.data === "data received:"){
      return
    }
    // return
    if(JSON.parse(event.nativeEvent.data).nullifier){
      const commitment = JSON.parse(event.nativeEvent.data)
      console.log('Commitment added to chain:', commitment);
      setCmt(commitment)
    } 
    else{
      console.log('Proof from WebView:', event.nativeEvent.data);
      setProof(JSON.parse(event.nativeEvent.data))
    }
  }

  return (
    <div>
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase. Your payment has been successfully processed.</p>
      {commitment && (
        <div>
          <p>Commitment: {commitment.commitment}</p>
          {/* Display other commitment details if needed */}
          <WebView
      ref={webViewRef}
      source={HTML} // URL of the server serving the HTML file
      onMessage={handleMessage}
    />
        </div>
      )}
      {/* Add additional content as needed */}
    </div>
  );
}

export default PaymentSuccess;
