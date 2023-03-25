// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract NFTMarket is IERC721Receiver{
    // mapping(address => mapping(uint => address)) public owners;
    mapping(address => mapping(uint => address)) public upSells;
    mapping(address => mapping(address => mapping(uint => uint))) public prices;
    ERC20 public currency;

    error NotUpSelling();
    error LowPrice();

    event UpSelled(address indexed user,address indexed nft, uint indexed tokenId, uint price);
    event Buyed(address indexed user,address indexed nft, uint indexed tokenId, uint price);

    constructor(address ad){
        currency = ERC20(ad);
    }

    function upSelling(address nft, uint tokenId, uint price) public {
        ERC721(nft).safeTransferFrom(msg.sender,address(this),tokenId);
        prices[msg.sender][nft][tokenId] = price;
        // console.log(prices[msg.sender][nft][tokenId]);
        
        upSells[nft][tokenId] = msg.sender;

        // console.log(upSells[nft][tokenId]);

        emit UpSelled(msg.sender, nft, tokenId, price);
    }

    function buy(address nft, uint tokenId, uint quotedPrice) public {
        address owner = upSells[nft][tokenId];
        // console.log(owner);
        if(owner == address(0)) revert NotUpSelling();

        uint price = prices[owner][nft][tokenId];
        // console.log(price);
        // console.log(quotedPrice);

        if(quotedPrice < price) revert LowPrice();

        delete prices[msg.sender][nft][tokenId] ;
        delete upSells[nft][tokenId];

        currency.transferFrom(msg.sender, owner, quotedPrice);
        // console.log(currency.balanceOf(owner));
        // console.log(currency.balanceOf(msg.sender));
        ERC721(nft).safeTransferFrom(address(this),msg.sender,tokenId);
        
        emit Buyed(msg.sender, nft, tokenId, quotedPrice);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4){
        return this.onERC721Received.selector;
    }
}