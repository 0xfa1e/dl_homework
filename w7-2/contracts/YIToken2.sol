// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract YIToken2 is ERC20 , Ownable{
    uint constant ONE = 10e18;
    uint k = ONE;
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
        return super.balanceOf(account) * k / ONE ;
    }
    function totalSupply() public view virtual override returns (uint256) {
        console.log("totalSupply k:",k);
        return super.totalSupply()  * k / ONE;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override{
        uint amount2 = amount * ONE / k;
        super._transfer(from, to, amount2);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual override{
        uint amount2 = amount * ONE / k;
        super._approve(owner, spender, amount2);
    }

    function _burn(address account, uint256 amount) internal virtual override{
        uint amount2 = amount * ONE / k;
        super._burn(account, amount2);
    }

    function _mint(address account, uint256 amount) internal virtual override{
        uint amount2 = amount * ONE / k;
        super._mint(account, amount2);
    }

    function rebase() onlyOwner external {
        require(block.timestamp - laseRebaseTime >= duringRebase, "error time to rebase");

        console.log("before rebase k:",k);
        k = k * 99 / 100;
        console.log("after rebase k:",k);
    }
}
