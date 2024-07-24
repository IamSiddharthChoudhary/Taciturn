// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./InewBasicNft.sol";

contract ConvertToERC721 is INewBasicNFT, ERC721URIStorage{

    uint256 public tokenCounter;

    constructor(string memory str1, string memory str2) ERC721(str1,str2){
        tokenCounter = 0;
    }

    function mintNft(address to, string memory uri) public override {
        _mint(to, tokenCounter);
        _setTokenURI(tokenCounter, uri);
        tokenCounter++;
    } 
}