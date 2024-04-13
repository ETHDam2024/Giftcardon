// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.24;

import "./GiftcardonHandler.sol";

contract Giftcardon is GiftcardonHandler{

    constructor(
        uint32 _levels,
        IHasher _hasher,
        IVerifier _verifier,
        ICredit _creditAddress
    ) GiftcardonHandler(
        _levels, 
        _hasher, 
        _verifier, 
        _creditAddress
    ) {}

    /**
    * @dev Creates a new gift card with the provided commitment.
    * 
    * @param _commitmentGiftcard The commitment for the new gift card
    */
    function createGiftcard(uint256 _commitmentGiftcard) external {
        _createGiftcard(bytes32(_commitmentGiftcard));

    }


    /**
    * @dev Redeems a gift card by providing the necessary proofs and parameters.
    * 
    * @param _proof_a Array containing the first half of the SNARK proof
    * @param _proof_b Array containing the second half of the SNARK proof
    * @param _proof_c Array containing the third half of the SNARK proof
    * @param _nullifierHash The hash of the nullifier for the gift card
    * @param _root The root of the Merkle tree
    */
    function redeemGiftcard(
        uint[2] memory _proof_a,
        uint[2][2] memory _proof_b,
        uint[2] memory _proof_c,
        uint256 _nullifierHash,
        uint256 _root
    ) external {
         return _redeemGiftcard(
            _proof_a,
            _proof_b,
            _proof_c,
            bytes32(_nullifierHash),
            bytes32(_root)
        );
    }
}

