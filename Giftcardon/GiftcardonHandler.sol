// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.24;

import "./MerkleTreeWithHistory.sol";
import "./interfaces.sol";

contract GiftcardonHandler is MerkleTreeWithHistory {

    mapping(bytes32 => bool) public nullifiers;
    mapping(bytes32 => bool) public commitments;
    // mapping(address => uint256) public TTL;

    IVerifier public immutable verifier;
    ICredit public immutable creditContract;

    uint256 public GIFT_CARD_AMOUNT = 100;
    uint256 public FEES_AMOUNT = 2;

    event Commit(
        bytes32 indexed commitment,
        uint32 leafIndex,
        uint256 timestamp
    );

    event whosAddress(
        address theAddress
    );

    constructor(
        uint32 _levels,
        IHasher _hasher,
        IVerifier _verifier,
        ICredit _creditAddress
    ) 
        MerkleTreeWithHistory(
            _levels, 
            _hasher
        ) {
        verifier = _verifier;
        creditContract = _creditAddress;
    }

    function _createGiftcard(bytes32 _commitmentGiftcard) internal {

        require(!commitments[_commitmentGiftcard], "The commitment has been submitted");

        commitments[_commitmentGiftcard] = true;
        
        uint total_amount = GIFT_CARD_AMOUNT + FEES_AMOUNT;

        creditContract.fromToTransfer(
            msg.sender,
            address(this),
            total_amount * 10 ** 18
        ); // The cost for the giftcard ( the uesr that clicked the create is the one who pays! )

        // TTL[msg.sender] = block.timestamp;

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

        // uint secondsElapsed = (block.timestamp - TTL[msg.sender]) * 2;
        // string memory secondsPast = uintToString(secondsElapsed);
        // return string(abi.encodePacked(secondsPast, " seconds past from the deposit"));
    }

    function uintToString(uint v) internal pure returns (string memory) {
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j];
        }

        return string(s);
    }

}
 