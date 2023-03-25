// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Vault {
    mapping(address => mapping(address => uint)) public balanceOfCurrency;
    bool public lock;

    error LowBalance();
    error TransferFromError();

    modifier reCallLock(){
        if(!lock){
            lock = true;
            _;
            lock = false;
        }
    }

    function balanceOf(address depositor,address currency) public view returns (uint){
        return balanceOfCurrency[depositor][currency];
    }

    function depsote(address currency, uint amount) public {
        address depositor = msg.sender;
        ERC20 erc = ERC20(currency);
        // console.log(balanceOfCurrency[depositor][currency]);

        if(!erc.transferFrom(depositor,address(this),amount)) 
            revert TransferFromError();
        
        balanceOfCurrency[depositor][currency] += amount;

        // console.log(balanceOfCurrency[depositor][currency]);
    }

    function withdrew(address currency, uint amount) public reCallLock {
        address depositor = msg.sender;
        if(balanceOfCurrency[depositor][currency] < amount) revert LowBalance();

        ERC20 erc = ERC20(currency);
        erc.transfer(depositor,amount);
        balanceOfCurrency[depositor][currency] -= amount;
    }
}