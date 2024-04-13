// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


interface IVerifier {

    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) external pure returns (bool r);

}

interface ICredit {

    function directTransfer(
        address recipient, 
        uint256 amount
    ) external;

    function directTransferFContract(
        address recipient, 
        uint256 amount
    ) external;

    function fromToTransfer(
        address from,
        address to,
        uint amount
    ) external;
    
}