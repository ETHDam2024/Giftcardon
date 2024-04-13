
import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { buildMimcSponge } from 'https://cdn.jsdelivr.net/npm/circomlibjs@0.1.7/+esm'
import * as ethers from "https://cdn.jsdelivr.net/npm/ethers@6.11.1/dist/ethers.min.js"

function PaymentSuccess() {
  const [commitment, setCommitment] = useState(null);

  useEffect(() => {
    // Call the generateCommitment function when the component mounts
    const generateCommitmentAsync = async () => {
      try {
        // Generate the commitment
        const newCommitment = await generateCommitment();
        console.log(newCommitment);

        // // adding the commitment to the blockchain (the Merkletree is in the blockchain)
        await addCommitmentToContract(newCommitment.commitment)
        // console.log("Commitment has been added")
// 
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
      <p1>Important: Note down the Nullifier and Secret in a safe way - these inputs are required upon redeeming the Giftcard</p1>
      {commitment && (
        <div>
          <p>Commitment: {commitment.commitment}</p>
          <p>Nullifier: {commitment.nullifier}</p>
          <p>Secret: {commitment.secret}</p>
        </div>
      )}
      {/* Add additional content as needed */}
    </div>
  );
}

export default PaymentSuccess;

async function addCommitmentToContract(commitment){
  const SPcontractAddress = "0xFc0dd5bD2e980ae3b4E51E39ce74667fc97ED28e"
  const provider = new ethers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/5hmudZ-Nalv--bEN3KMKHtxZKzklAua1")
  const ABI = [
      {
          "inputs": [
              {
                  "internalType": "uint32",
                  "name": "_levels",
                  "type": "uint32"
              },
              {
                  "internalType": "contract IHasher",
                  "name": "_hasher",
                  "type": "address"
              },
              {
                  "internalType": "contract IVerifier",
                  "name": "_verifier",
                  "type": "address"
              },
              {
                  "internalType": "contract IMetadata",
                  "name": "_metadataContract",
                  "type": "address"
              },
              {
                  "internalType": "contract IServiceProviders",
                  "name": "_spsContract",
                  "type": "address"
              },
              {
                  "internalType": "contract IPalo",
                  "name": "_fundsContract",
                  "type": "address"
              },
              {
                  "internalType": "contract IAyala",
                  "name": "_ayalaContract",
                  "type": "address"
              },
              {
                  "internalType": "string",
                  "name": "_serviceProviderENS",
                  "type": "string"
              },
              {
                  "internalType": "string",
                  "name": "_metaData",
                  "type": "string"
              }
          ],
          "stateMutability": "payable",
          "type": "constructor"
      },
      {
          "inputs": [],
          "name": "INDEX_OF_METADATA",
          "outputs": [
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [],
          "name": "SERVICE_PROVIDER_ENS",
          "outputs": [
              {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256",
                  "name": "_productID",
                  "type": "uint256"
              },
              {
                  "internalType": "uint256",
                  "name": "_setupFee",
                  "type": "uint256"
              },
              {
                  "internalType": "uint256",
                  "name": "_monthlyFee",
                  "type": "uint256"
              },
              {
                  "internalType": "string",
                  "name": "_metaData",
                  "type": "string"
              },
              {
                  "internalType": "uint256",
                  "name": "_productType",
                  "type": "uint256"
              }
          ],
          "name": "addProduct",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256",
                  "name": "_commitmentDeposit",
                  "type": "uint256"
              }
          ],
          "name": "createCommitmentToRegisterENS",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256",
                  "name": "_commitmentDeposit",
                  "type": "uint256"
              }
          ],
          "name": "createSubscription",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256[2]",
                  "name": "_proof_a",
                  "type": "uint256[2]"
              },
              {
                  "internalType": "uint256[2][2]",
                  "name": "_proof_b",
                  "type": "uint256[2][2]"
              },
              {
                  "internalType": "uint256[2]",
                  "name": "_proof_c",
                  "type": "uint256[2]"
              },
              {
                  "internalType": "uint256",
                  "name": "_nullifierHash",
                  "type": "uint256"
              },
              {
                  "internalType": "uint256",
                  "name": "_root",
                  "type": "uint256"
              },
              {
                  "internalType": "uint256",
                  "name": "_productIDHash",
                  "type": "uint256"
              }
          ],
          "name": "endSubscription",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256",
                  "name": "_productID",
                  "type": "uint256"
              }
          ],
          "name": "getProductMetaData",
          "outputs": [
              {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "string",
                  "name": "ens",
                  "type": "string"
              }
          ],
          "name": "getRemainingSubscriptionUserTime",
          "outputs": [
              {
                  "internalType": "int256",
                  "name": "",
                  "type": "int256"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [],
          "name": "getServiceProviderMetadata",
          "outputs": [
              {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256[2]",
                  "name": "_proof_a",
                  "type": "uint256[2]"
              },
              {
                  "internalType": "uint256[2][2]",
                  "name": "_proof_b",
                  "type": "uint256[2][2]"
              },
              {
                  "internalType": "uint256[2]",
                  "name": "_proof_c",
                  "type": "uint256[2]"
              },
              {
                  "internalType": "uint256",
                  "name": "_nullifierHash",
                  "type": "uint256"
              },
              {
                  "internalType": "uint256",
                  "name": "_root",
                  "type": "uint256"
              },
              {
                  "internalType": "uint256",
                  "name": "_productIDHash",
                  "type": "uint256"
              },
              {
                  "internalType": "string",
                  "name": "ens",
                  "type": "string"
              }
          ],
          "name": "startSubscription",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256[2]",
                  "name": "_proof_a",
                  "type": "uint256[2]"
              },
              {
                  "internalType": "uint256[2][2]",
                  "name": "_proof_b",
                  "type": "uint256[2][2]"
              },
              {
                  "internalType": "uint256[2]",
                  "name": "_proof_c",
                  "type": "uint256[2]"
              },
              {
                  "internalType": "uint256",
                  "name": "_nullifierHash",
                  "type": "uint256"
              },
              {
                  "internalType": "uint256",
                  "name": "_root",
                  "type": "uint256"
              },
              {
                  "internalType": "string",
                  "name": "_userProduct",
                  "type": "string"
              }
          ],
          "name": "updateNewServiceProvider",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
      }
      ]
  const signer = new ethers.Wallet("0x0dbc2427bcc0c03b4d7568f0ac135b543633c237d06837e8ff6dabc8ca69b3ae", provider)
  const SPcontract = new ethers.Contract(SPcontractAddress, ABI, signer)
  const tx = await SPcontract.createCommitmentToRegisterENS(commitment)
  await tx.wait()
  return commitment
}