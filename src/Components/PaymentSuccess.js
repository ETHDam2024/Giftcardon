
import React, { useState, useEffect } from 'react';
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

        // // adding the commitment to the blockchain 
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
  const provider = new ethers.JsonRpcProvider("https://sapphire.oasis.io")
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
                                                    "internalType": "contract ICredit",
                                                    "name": "_creditAddress",
                                                    "type": "address"
                                    }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
    },
    {
                    "anonymous": false,
                    "inputs": [
                                    {
                                                    "indexed": true,
                                                    "internalType": "bytes32",
                                                    "name": "commitment",
                                                    "type": "bytes32"
                                    },
                                    {
                                                    "indexed": false,
                                                    "internalType": "uint32",
                                                    "name": "leafIndex",
                                                    "type": "uint32"
                                    },
                                    {
                                                    "indexed": false,
                                                    "internalType": "uint256",
                                                    "name": "timestamp",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "Commit",
                    "type": "event"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "uint256",
                                                    "name": "_commitmentGiftcard",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "createGiftcard",
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
                                    }
                    ],
                    "name": "redeemGiftcard",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
    },
    {
                    "anonymous": false,
                    "inputs": [
                                    {
                                                    "indexed": false,
                                                    "internalType": "address",
                                                    "name": "theAddress",
                                                    "type": "address"
                                    }
                    ],
                    "name": "whosAddress",
                    "type": "event"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "name": "commitments",
                    "outputs": [
                                    {
                                                    "internalType": "bool",
                                                    "name": "",
                                                    "type": "bool"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "creditContract",
                    "outputs": [
                                    {
                                                    "internalType": "contract ICredit",
                                                    "name": "",
                                                    "type": "address"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "currentRootIndex",
                    "outputs": [
                                    {
                                                    "internalType": "uint32",
                                                    "name": "",
                                                    "type": "uint32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "FEES_AMOUNT",
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
                    "name": "FIELD_SIZE",
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
                    "inputs": [
                                    {
                                                    "internalType": "uint256",
                                                    "name": "",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "filledSubtrees",
                    "outputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "getLastRoot",
                    "outputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "uint256",
                                                    "name": "level",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "getLevelHashes",
                    "outputs": [
                                    {
                                                    "internalType": "bytes32[]",
                                                    "name": "",
                                                    "type": "bytes32[]"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "GIFT_CARD_AMOUNT",
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
                    "name": "hasher",
                    "outputs": [
                                    {
                                                    "internalType": "contract IHasher",
                                                    "name": "",
                                                    "type": "address"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "uint256",
                                                    "name": "_left",
                                                    "type": "uint256"
                                    },
                                    {
                                                    "internalType": "uint256",
                                                    "name": "_right",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "hashLeftRight",
                    "outputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "_root",
                                                    "type": "bytes32"
                                    }
                    ],
                    "name": "isKnownRoot",
                    "outputs": [
                                    {
                                                    "internalType": "bool",
                                                    "name": "",
                                                    "type": "bool"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "uint256",
                                                    "name": "",
                                                    "type": "uint256"
                                    },
                                    {
                                                    "internalType": "uint256",
                                                    "name": "",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "levelHashes",
                    "outputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "levels",
                    "outputs": [
                                    {
                                                    "internalType": "uint32",
                                                    "name": "",
                                                    "type": "uint32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "nextIndex",
                    "outputs": [
                                    {
                                                    "internalType": "uint32",
                                                    "name": "",
                                                    "type": "uint32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "name": "nullifiers",
                    "outputs": [
                                    {
                                                    "internalType": "bool",
                                                    "name": "",
                                                    "type": "bool"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "ROOT_HISTORY_SIZE",
                    "outputs": [
                                    {
                                                    "internalType": "uint32",
                                                    "name": "",
                                                    "type": "uint32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [
                                    {
                                                    "internalType": "uint256",
                                                    "name": "",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "roots",
                    "outputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "verifier",
                    "outputs": [
                                    {
                                                    "internalType": "contract IVerifier",
                                                    "name": "",
                                                    "type": "address"
                                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
    },
    {
                    "inputs": [],
                    "name": "ZERO_VALUE",
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
                    "inputs": [
                                    {
                                                    "internalType": "uint256",
                                                    "name": "i",
                                                    "type": "uint256"
                                    }
                    ],
                    "name": "zeros",
                    "outputs": [
                                    {
                                                    "internalType": "bytes32",
                                                    "name": "",
                                                    "type": "bytes32"
                                    }
                    ],
                    "stateMutability": "pure",
                    "type": "function"
    }
]

  const signer = new ethers.Wallet("Put_Your_Private_Key_Here", provider)
  const SPcontract = new ethers.Contract(SPcontractAddress, ABI, signer)
  const tx = await SPcontract.createGiftcard(commitment)
  await tx.wait()
  return commitment
}