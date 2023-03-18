// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract Score {
    mapping(address => mapping(address => uint)) public scoreOf;
    mapping(address => bool) public teachers;
    address public owner;

    error OnlyTeacher();
    error OnlyOwner();
    error ErrorScore();

    modifier onlyTeacher() {
        if(!teachers[msg.sender]) revert  OnlyTeacher();
        _;
    }

    modifier onlyOwner() {
        if(msg.sender != owner) revert  OnlyOwner();
        _;
    }
    constructor(){
        owner =msg.sender;
    }

    function saveScore(address stu, uint score) external onlyTeacher returns(bool){
        if(score > 100)  revert  ErrorScore();

        scoreOf[msg.sender][stu] = score;
        return true;
    }
    function addTeacher(address teacher) public onlyOwner returns(bool){
        teachers[teacher] = true;
        return true;
    }
}

interface IScore{
    function saveScore(address stu, uint score) external returns(bool);
}

contract Teacher {
    function saveScore(address scoreAddress, address stu, uint score) external returns(bool){
        return IScore(scoreAddress).saveScore(stu, score);
    }
}