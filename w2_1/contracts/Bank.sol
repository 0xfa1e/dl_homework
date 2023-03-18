// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract Bank {
    mapping(address => uint) public balanceOf;
    mapping(address => bool) public lock;
    error LowBalance();
    error TransError();

    modifier reCallLock(){
        if(!lock[msg.sender]){
            lock[msg.sender] = true;
            _;
            lock[msg.sender] = false;
        }
    }

    function balanceOfDepositor(address depositor) public view returns (uint balance){
        return balanceOf[depositor];
    }

    receive() external payable  {
        balanceOf[msg.sender] += msg.value;
    }

    function withdrew() public reCallLock {
        uint balance = balanceOf[msg.sender];
        if(balance <= 0) 
            revert LowBalance();

        balanceOf[msg.sender]=0;
        (bool success,) = msg.sender.call{value:balance}(new bytes(0));
        if (!success) 
            revert TransError();
    }
}