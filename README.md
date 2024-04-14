# Giftcardon

Our ethDAM2024 project is GiftCardon. We have created a way to use Tornado Cash technology to develop an app that allows small bussinesses to offer their own custom gift cards. 

The project is based on the source code of [Tornado Cash](https://github.com/tornadocash/tornado-core). The most essential component of tornado core is a Merkle tree where users can deposit ethers with a random `commitment`, that can be withdrawn with a `nullifier`. The nullifier is assigned to the commitment, but nobody knows which commitment is assigned to which nullifier, because the link between them is the zero-knowledge.

## Process
1. A user downloads *GiftCard app*, no registration required. 
2. The user sees a list of **giftcards** they can choose from. Each shop has different deals and offers.
3. The user chooses a giftcard and presses '**buy**'. Once this happens a commitment is entered into the **blockchain**. Every shop has their own *merkle tree contract* and when a product is bought, the commitment enters into the contract of that specific shop. The *secret* and *nullifier* are then saved to the storage of the device, to be used later for generating the proof.
4. The shop's wallet now receives our **ERC-20 tokens** in the amount of the giftcard price. This way the shop can see the balance of all the giftcards they have sold using the tokens.
5. The user can see a list of the **giftcards** that they posses and has the option to *redeem* one whenever. This should be done before the user wants to go to the shop to use the giftcard.
6. Once a giftcard is redeemed, the app uses the *nullifier* and *secret* of that certain giftcard to generate a proof still in the client.
7. The proof is then made into a **QR-Code** and shown on the app under redeemed giftcards.
8. The user can now let the shop scan the **QR-code** of the proof which is swiftly sent to the chain for verification. If the proof is correct, the user can now spend that amount in the shop.
9. Since the *nullifierhash* is now in the smart contract, the same giftcard can not be used twice.

## Technical

We start with our circuits. The main ZK circuit is giftcard.circom. The other is a merkle tree circuit taken directly from tornado cash and is used to generate merkle proof.

### Merkle Tree

- We generate a file named - merkleTree.circom (taken completely from tornado cash)

```java
pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/mimcsponge.circom";

// Computes MiMC([left, right])
template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    component hasher = MiMCSponge(2, 220, 1);
    hasher.ins[0] <== left;
    hasher.ins[1] <== right;
    hasher.k <== 0;
    hash <== hasher.outs[0];
}

template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output root;

    component selectors[levels];
    component hashers[levels];

    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf : hashers[i - 1].hash;
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = HashLeftRight();
        hashers[i].left <== selectors[i].out[0];
        hashers[i].right <== selectors[i].out[1];
    }

    root <== hashers[levels - 1].hash;
}

```
### Giftcard 
Our main circuit is used to generate the final proof for the redeeming process. 

```java
pragma circom 2.0.0;

template Giftcard(levels) {
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output nullifierHash;
    signal output root;

    component commitmentHasher = CommitmentHasher();
    component merkleTreeChecker = MerkleTreeChecker(levels);

    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;

    merkleTreeChecker.leaf <== commitmentHasher.commitment;
    for (var i = 0; i < levels; i++) {
        merkleTreeChecker.pathElements[i] <== pathElements[i];
        merkleTreeChecker.pathIndices[i] <== pathIndices[i];
    }

    nullifierHash <== commitmentHasher.nullifierHash;
    root <== merkleTreeChecker.root;
}
```
***

- This template represents the circuit for a withdrawal operation, requiring a nullifier, a secret, a series of path elements (pathElements), and their corresponding positions (pathIndices) in the Merkle tree as inputs. It uses the CommitmentHasher to hash the nullifier and secret to generate a commitment and a nullifierHash.

The commitment is then used as a leaf in the MerkleTreeChecker template to verify the correctness of the Merkle proof provided through pathElements and pathIndices. The MerkleTreeChecker outputs the root of the Merkle tree, which can be compared against a known root to verify the proof's validity.

The giftcard template thus encapsulates the entire process of verifying a withdrawal operation in a system where transactions are hidden for privacy but need to be verifiable for security. This is achieved by verifying that the commitment made during the deposit phase is part of the Merkle tree and that the nullifier has not been used before, preventing double-spending.

The component main is the entry point of the circuit.

***
### Contracts

#### Giftcardon.sol
Every shop has their own smart contract on chain. This is Giftcardon.sol. The 2 functions for this contract are createGiftcard and redeemGiftcard.
These functions are defined in another contract, GiftcardonHandler.sol, and defined as such:
```solidity
function _createGiftcard(bytes32 _commitmentGiftcard) internal {

        require(!commitments[_commitmentGiftcard], "The commitment has been submitted");

        commitments[_commitmentGiftcard] = true;
        
        uint total_amount = GIFT_CARD_AMOUNT + FEES_AMOUNT;

        creditContract.fromToTransfer(
            msg.sender,
            address(this),
            total_amount * 10 ** 18
        ); // The cost for the giftcard ( the uesr that clicked the create is the one who pays! )

        uint32 insertedIndex = _insert(_commitmentGiftcard);

        emit Commit(_commitmentGiftcard, insertedIndex, block.number);
    }

function _redeemGiftcard(
        uint[2] memory _proof_a,
        uint[2][2] memory _proof_b,
        uint[2] memory _proof_c,
        bytes32 _nullifierHash,
        bytes32 _root
    ) internal {
        require(!nullifiers[_nullifierHash], "The nullifier has been submitted");
        require(isKnownRoot(_root), "Cannot find your merkle root");
        require(
            verifier.verifyProof(
                _proof_a,
                _proof_b,
                _proof_c,
                [uint256(_nullifierHash), uint256(_root)]
            ),
            "Invalid proof"
        );

        creditContract.fromToTransfer(
            address(this),
            msg.sender,
            GIFT_CARD_AMOUNT * 10 ** 18
        ); // FEES for each giftcards stays in the contract.

        nullifiers[_nullifierHash] = true;
    }
```
- The createGiftcard function add the commitment to the merkle tree and transfers ERC-20 tokens from the token contract to the Giftcardon contract.
- The redeemGiftcard function verifies the proof and sends the ERC-20 tokens from the giftcardon contract to the msg.sender, which is the shop. The shop can now redeem their ERC-20 to real money whenever.

#### Other contracts
- The other contract include a verifier contract to verify proof, the ERC-20 tokens contract which we use for bookkeeping and the MerkleTreeWithHistory contract from tornado cash which we used in our main contract.


***
**** 
*****

### WARNING: This library is not audited, so use it at your own risk

### &copy; All right reserved to