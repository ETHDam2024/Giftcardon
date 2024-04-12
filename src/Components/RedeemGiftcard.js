
// first need to get all the commitments from the tree
// create the whole commitment from the secret and nullifier 
// then send the commitment to generate proof


import React, { useState } from 'react';
import * as ethers from "https://cdn.jsdelivr.net/npm/ethers@6.11.1/dist/ethers.min.js"


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

async function getCommitmentsFromContract() {
    const SPcontractAddress = "0xa8dBc444C5e573e5cD3A3Bd004DC9B44bCf96F07"
    const AyalaAddress = "0xBaa107d8707966589254aDA3774c86a984958A3F"
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
    const abi = [
        "event Commit(bytes32 indexed commitment,uint32 leafIndex,uint256 timestamp)"
    ];
    console.log("added commitment")
    const Ayala = new ethers.Contract(AyalaAddress, abi, provider)
    const events = await Ayala.queryFilter(Ayala.filters.Commit())
    console.log(events)
    let commitments = []
    for (let event of events) {
        commitments.push(ethers.toBigInt(event.args.commitment).toString())
    }
    console.log(commitments)
    return commitments
    }