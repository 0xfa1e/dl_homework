// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract GovToken  is ERC20 , Ownable{
    address treasury;
    struct Checkpoint {
        uint32 fromBlock;
        uint96 votes;
    }
    mapping (address => mapping (uint32 => Checkpoint)) public checkpoints;
    mapping (address => uint32) public numCheckpoints;

    error NotYetDetermined();
    error ErrorTransEth(); 

    constructor(address _treasury)  ERC20("YI", "YI"){
        treasury = _treasury;
    }

    function mint() public payable{
        console.log("mint:", msg.sender, msg.value);
        console.log("owner():", owner());
        super._mint(msg.sender, msg.value);

        safeTransEth(treasury, msg.value);
    }

    function getVotes(address account, uint blockNumber) public view returns (uint96) {
        console.log("getVotes account:",account);
        console.log("getVotes blockNumber:",blockNumber);
        console.log("getVotes block.number:",block.number);
        uint32 nCheckpoint = numCheckpoints[account];
        console.log("getVotes nCheckpoint:",nCheckpoint);
        if (nCheckpoint == 0){
            return 0;
        }
        if ( blockNumber == 0){
            return nCheckpoint > 0 ? checkpoints[account][nCheckpoint -1].votes : 0;
        }

        if (blockNumber == block.number){
            revert NotYetDetermined();
        }

        console.log("getVotes nCheckpoint -1 fromBlock:",checkpoints[account][nCheckpoint -1].fromBlock);
        if (checkpoints[account][nCheckpoint -1].fromBlock <= blockNumber){
            return checkpoints[account][nCheckpoint -1].votes;
        }

        console.log("getVotes checkpoints[account][0].fromBlock :",checkpoints[account][0].fromBlock );
        if (checkpoints[account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoint - 1;
        while (upper > lower){
            uint32 center = upper - (upper-lower)/2;
            Checkpoint memory cp = checkpoints[account][center];

            console.log("getVotes lower:",lower);
            console.log("getVotes upper:",upper);
            console.log("getVotes center:",center);
            console.log("getVotes cp.fromBlock:",cp.fromBlock);
            console.log("getVotes cp.votes:",cp.votes);

            if (cp.fromBlock == blockNumber){
                return cp.votes;
            }else if (cp.fromBlock > blockNumber){
                upper = center - 1;
            }else{
                lower = center;
            }
        }
        return checkpoints[account][lower].votes;
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual override{
        _moveDelegates(from, to, amount);
    }

    // 该方法仅在余额发生变化时被调用，暂不考虑委托投票的场景；
    function _moveDelegates(address from, address to, uint256 amount) internal {
        if (from != to && amount > 0 ){
            if (from != address(0)){
                console.log("_moveDelegates from:", from);
                uint32 nCheckpoints = numCheckpoints[from];
                uint96 oldVotes = nCheckpoints > 0 ? checkpoints[from][nCheckpoints - 1].votes : 0;
                uint96 newVotes = oldVotes - uint96(amount);//TODO 处理uint96越界问题
                _writeCheckpoint(from, nCheckpoints, oldVotes, newVotes);
            }

            if (to != address(0)){
                console.log("_moveDelegates to:", to);
                uint32 nCheckpoints = numCheckpoints[to];
                uint96 oldVotes = nCheckpoints > 0 ? checkpoints[to][nCheckpoints - 1].votes : 0;
                uint96 newVotes = oldVotes + uint96(amount);
                _writeCheckpoint(to, nCheckpoints, oldVotes, newVotes);

            }
        }
    }

    function _writeCheckpoint(address delegatee, uint32 nCheckpoints, uint96 oldVotes, uint96 newVotes) internal {
        uint32 blockNumber = uint32(block.number);
        console.log("_writeCheckpoint blockNumber:", blockNumber);
        console.log("_writeCheckpoint delegatee:", delegatee);
        console.log("_writeCheckpoint nCheckpoints:", nCheckpoints);
        console.log("_writeCheckpoint oldVotes:", oldVotes);
        console.log("_writeCheckpoint newVotes:", newVotes);
        if(nCheckpoints > 0 && checkpoints[delegatee][nCheckpoints-1].fromBlock == blockNumber){//同一区块中多个交易
            checkpoints[delegatee][nCheckpoints-1].votes = newVotes;
        }else {
            checkpoints[delegatee][nCheckpoints] = Checkpoint(blockNumber, newVotes);
            numCheckpoints[delegatee] = nCheckpoints + 1;
            console.log("_writeCheckpoint numCheckpoints[delegatee]:", numCheckpoints[delegatee]);
      }
    }

    receive() external payable  {
        console.log("GovToken receive msg.sender:",msg.sender); 
        console.log("GovToken receive msg.value:",msg.value);
        // balances[msg.sender] += msg.value;
        safeTransEth(treasury, msg.value);
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
}