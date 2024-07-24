// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface INewBasicNFT{
    function mintNft(address to,string memory uri) external;
}