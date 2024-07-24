// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface INftMarketPlace {
    function withdrawReward(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB, 
        uint[2] calldata _pC, 
        uint nullHash,
        uint256 com,
        uint256 price) external;
}