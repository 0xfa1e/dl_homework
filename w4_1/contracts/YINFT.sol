// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract YINFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    uint public totalSupply = 1000;
    uint public totalMinted;
    Counters.Counter private tokenIdCounter;

    error InvalidTokenID();
    event Minted(address indexed to, uint indexed tokenId, string tokenURI);

    constructor() ERC721("YI-NFT","YFT"){
    }

    function mint(address to, string memory tokenURI) public  returns (uint) {
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();

        // console.log(tokenId);

        if (tokenId > totalSupply) revert InvalidTokenID();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        totalMinted += 1;

        emit Minted(to, tokenId, tokenURI);
        return tokenId;
    }
}

