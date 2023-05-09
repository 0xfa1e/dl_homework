// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface GovTokenInterface {
    function getVotes(address account, uint blockNumber) external view returns (uint96);
}
interface TreasuryInterface {
    function withdraw(address to) external;
}
contract Gov  is Ownable{
    GovTokenInterface public govToken;
    TreasuryInterface public treasury;
    uint public proposalCount;
    uint public votingDelay;
    uint public votingPeriod;

    struct Proposal {
        uint id;
        address proposer;
        uint startBlock;
        uint endBlock;
        uint yesVotes;
        uint noVotes;
        uint ended;
        mapping (address => Receipt) receipts;
    }

    struct Receipt {
        bool hasVoted;
        bool support;
        uint96 votes;
    }

    mapping (uint => Proposal) public proposals;

    error LowBalance();
    error HadVoted();
    error ErrorTimeVoted();
    error ErrorTimeEndingVoted();

    constructor(address _govToken, address _treasury, uint _votingDelay, uint _votingPeriod) {
        console.log("constructor _govToken:", _govToken);
        console.log("constructor _treasury:", _treasury);
        console.log("constructor _votingDelay:", _votingDelay);
        console.log("constructor _votingPeriod:", _votingPeriod);
        govToken = GovTokenInterface(_govToken);
        treasury = TreasuryInterface(_treasury);

        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
    }

    function propose() public returns (uint) {
        uint votes = govToken.getVotes(msg.sender, 0);
        console.log("propose votes:", votes);
        if ( votes == 0){
            revert LowBalance();
        }

        uint startBlock = block.number + votingDelay;
        uint endBlock = startBlock + votingPeriod;

        console.log("propose startBlock:", startBlock);
        console.log("propose endBlock:", endBlock);
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.proposer = msg.sender;
        newProposal.startBlock = startBlock;
        newProposal.endBlock = endBlock;
        newProposal.yesVotes = 0;
        newProposal.noVotes = 0;
        newProposal.ended = 0;

        console.log("propose proposalCount:", proposalCount);
        return proposalCount;
    }

    function castVote(uint proposalId, bool ifSupport) public {
        console.log("propose proposalId:", proposalId);
        console.log("propose ifSupport:", ifSupport);
        Proposal storage proposal = proposals[proposalId];
        if(block.number < proposal.startBlock || block.number > proposal.endBlock || proposal.ended == 1) {
            revert ErrorTimeVoted();
        }

        address voter = msg.sender;
        console.log("propose voter:", voter);
        Receipt storage receipt = proposal.receipts[voter];
        if(receipt.hasVoted) {
            revert HadVoted();
        }

        uint96 votes = govToken.getVotes(msg.sender, proposal.startBlock);
        console.log("propose votes:", votes);
        receipt.hasVoted = true;
        receipt.support = ifSupport;
        receipt.votes = votes;

        if (ifSupport) {
            proposal.yesVotes += votes;
        } else {
            proposal.noVotes += votes;
        }
        console.log("propose proposal.yesVotes:", proposal.yesVotes);
        console.log("propose proposal.noVotes:", proposal.noVotes);
    }

    function endVoting(uint proposalId) public onlyOwner{
        console.log("endVoting proposalId:", proposalId);
        Proposal storage proposal = proposals[proposalId];
        if(block.number <= proposal.endBlock) {
            revert ErrorTimeEndingVoted();
        }
        proposal.ended = 1;
        console.log("endVoting proposal.ended:", proposal.ended);

        if(proposal.yesVotes > proposal.noVotes){
            console.log("endVoting proposal.yesVotes:", proposal.yesVotes);
            console.log("endVoting proposal.noVotes:", proposal.noVotes);
            treasury.withdraw(owner());
        }
    }
}