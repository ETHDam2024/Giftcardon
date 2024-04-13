// first need to get all the commitments from the tree
// create the whole commitment from the secret and nullifier 
// then send the commitment to generate proof


import { useState, useEffect } from 'react';
import * as ethers from "https://cdn.jsdelivr.net/npm/ethers@6.11.1/dist/ethers.min.js"
import { generateAndVerifyProof } from './CommitmentUtils';
import { buildMimcSponge } from 'https://cdn.jsdelivr.net/npm/circomlibjs@0.1.7/+esm'


function RedeemGiftCard() {
    const [nullifier, setNullifier] = useState('');
    const [secret, setSecret] = useState('');
    const [commitments, setCommitments] = useState([]); // added usestate for the commitment

    // added the fetch commitments function
    useEffect(() => {
        const fetchCommitments = async () => {
            const retrievedCommitments = await getCommitmentsFromContract();
            setCommitments(retrievedCommitments);
            console.log("Commitments fetched:", retrievedCommitments);
        };
        
        fetchCommitments();
    }, []);


    const handleSubmit = async(event) => {
        event.preventDefault(); // Prevent form from submitting in the traditional way
        console.log('Nullifier:', nullifier);
        console.log('Secret:', secret);

        //added the below part until return
        // Here you would create the commitment from nullifier and secret
        // and compare it against retrieved commitments before proceeding to generate proof
        const generatedCommitment = await createCommitment(nullifier, secret); // Assuming you have a function to generate this

// here the generate and verify proof function needs to go (inside this function the commitment needs to go)


        // Check if generatedCommitment exists in commitments
        if (commitments.includes(generatedCommitment)) {
            console.log("Commitment validated:", generatedCommitment);
            // Code to generate and send proof
            await generateAndVerifyProof(commitments, generatedCommitment)
        } else {
            alert("Invalid nullifier or secret.");
        }
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
    const provider = new ethers.JsonRpcProvider("https://sapphire.oasis.io")
    const abi = [
        "event Commit(bytes32 indexed commitment,uint32 leafIndex,uint256 timestamp)"
    ];
    console.log("added commitment")
    const contract = new ethers.Contract("0x3542Cbdd6c0948A0f4f82F2a1ECb33FA4f55f242", abi, provider)
    const latest = await provider.getBlockNumber()
    const start = 3271451
    console.log(latest)
    let commitments = []
    for(let i=start;i<latest;i+=100){
        const events = await contract.queryFilter(contract.filters.Commit(), i, i+100)
        console.log(events)
        for (let event of events) {
            commitments.push(ethers.toBigInt(event.args.commitment).toString())
        }
        // console.log(commitments)
    }
    console.log(commitments)
    return commitments
}

    // create commitment function
    async function createCommitment (nullifier, secret) {
        const mimc = await buildMimcSponge();
        const commitment = mimc.F.toString(mimc.multiHash([nullifier, secret]));
        const nullifierHash = mimc.F.toString(mimc.multiHash([nullifier]));
        return {
            nullifier: nullifier,
            secret: secret,
            commitment: commitment,
            nullifierHash: nullifierHash
        };
    }