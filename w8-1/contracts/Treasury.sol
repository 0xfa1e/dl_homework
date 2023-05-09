// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Treasury is Ownable{
    // mapping(address => uint) public balances;
    // bool public lock;
    error LowBalance();
    error ErrorTransEth(); 
    
    function withdraw(address to) public onlyOwner{
        console.log("withdraw to:",to);
        uint balance = address(this).balance;
        console.log("withdraw balance:",balance);
        if (balance > 0){
            safeTransEth(to, balance);
        }
        // balances[msg.sender] = 0;
    }
    
    
    function safeTransEth(address to, uint256 amount) internal{
        console.log("safeTransEth to:",to);
        console.log("safeTransEth amount:",amount);
        (bool result, ) = to.call{value: amount}(new bytes(0));
        console.log("safeTransEth result:",result);
        if(!result){
            revert ErrorTransEth();
        }
    }

    receive() external payable  {
        console.log("Treasury receive msg.sender:",msg.sender); 
        console.log("Treasury receive msg.value:",msg.value);
        // balances[msg.sender] += msg.value;
    }
}