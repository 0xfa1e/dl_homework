// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract YIToken2 is ERC20 , Ownable{
    uint k = 100;
    uint laseRebaseTime;
    uint duringRebase;

    constructor(uint _duringRebase, uint _totalSupply)  ERC20("YI", "YI"){
        laseRebaseTime = block.timestamp;
        duringRebase = _duringRebase;
        console.log("===================================================================:",block.timestamp);
        super._mint(msg.sender, _totalSupply);
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        console.log("balanceOf k:",k);
        return (super.balanceOf(account) / 100) * k;
    }
    function totalSupply() public view virtual override returns (uint256) {
        console.log("totalSupply k:",k);
        return (super.totalSupply() / 100) * k;
    }

    function rebase() onlyOwner external {
        require(k>1,"can not to rebase");
        require(block.timestamp - laseRebaseTime >= duringRebase, "error time to rebase");

        console.log("before rebase k:",k);
        k -= 1;
        console.log("after rebase k:",k);
    }
}

// import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

// contract YIToken is ERC20Upgradeable {
//     constructor() {
//     }

//     function initialize() initializer public {
//         __ERC20_init("YI", "YI");
//         super._mint(msg.sender,100000 * 1000000000000000000);
//     }
// } 