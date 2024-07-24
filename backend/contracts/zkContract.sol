//SPDX-License-Identifier:MIT

pragma solidity ^0.8.7;

import "./MIMCSponge.sol";

contract ZkContract{

    event Check(address to, uint256 nullifierHash);

    address verifier;
    Hasher hasher;
    mapping(string=>bool) private nullExists;
    mapping(uint256=>bool) private comExists;

    function minting(uint256 _commitment) public {
        require(!comExists[_commitment],"Duplicate commitment hash.");

        uint256 currentHash = _commitment;

        uint256[2] memory ins;
    

        comExists[_commitment] = true;
    }

    function null_exists(string memory str) view public returns(bool){
        return nullExists[str];
    }

    function registerNull(string memory str) public {
        nullExists[str] = true;
    }

    function com_exists(uint256 com) view public returns(bool){
        return comExists[com];
    }

    function regiterCom(uint256 com) public {
        comExists[com] = true;
    }
}