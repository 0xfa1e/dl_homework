// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract Counter {
    uint public counter;
    address public owner;

    constructor (){
        counter = 0;
        owner = msg.sender;
    }

    function count() public {
        require(owner == msg.sender,"only onwer called");
        counter += 1;
    }

    function add (uint x) public {
        counter += x;
    }
}