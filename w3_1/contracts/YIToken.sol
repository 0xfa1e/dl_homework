// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YIToken is ERC20 {
    constructor()  ERC20("YI", "YI"){
        super._mint(msg.sender,100000 * 1000000000000000000);
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