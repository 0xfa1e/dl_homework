// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract Vault{
    mapping(address => mapping(address => uint)) public balanceOfCurrency;
    bool public lock;

    error LowBalance();
    error TransferFromError();

    event Deposited(address indexed depositor, address indexed currency, uint amount);
    event PermitDeposited(address indexed depositor, address indexed currency, uint amount);
    event Withdrewed(address indexed depositor, address indexed currency, uint amount);

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

    function deposit(address currency, uint amount) public {
        _deposit(currency,amount);
    }

    function _deposit(address currency, uint amount)internal {
        address depositor = msg.sender;
        ERC20 erc = ERC20(currency);
        // console.log(balanceOfCurrency[depositor][currency]);

        if(!erc.transferFrom(depositor,address(this),amount)) 
            revert TransferFromError();
        
        balanceOfCurrency[depositor][currency] += amount;

        emit Deposited(depositor,currency,amount);
        // console.log(balanceOfCurrency[depositor][currency]);
    }

    function permitDeposit(address currency, uint amount,uint256 deadline,
        uint8 v,bytes32 r,bytes32 s
    ) public {
        ERC20Permit(currency).permit(msg.sender,address(this),amount,deadline,v,r,s);
        _deposit(currency,amount);
        
        emit PermitDeposited(msg.sender,currency,amount);
    }

    function withdrew(address currency, uint amount) public reCallLock {
        address depositor = msg.sender;
        if(balanceOfCurrency[depositor][currency] < amount) revert LowBalance();

        ERC20 erc = ERC20(currency);
        balanceOfCurrency[depositor][currency] -= amount;
        erc.transfer(depositor,amount);
        
        emit Withdrewed(msg.sender,currency,amount);
    }
}