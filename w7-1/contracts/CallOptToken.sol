// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import './USDC.sol';

contract CallOptToken is ERC20, Ownable {
    using SafeERC20 for IERC20;

    address usdc;
    uint public price;
    uint public settlementTime;
    uint public mintTime;
    uint public duringSettlement;
    uint feeRate;

    error InvaliedInitParam(); 
    error MintTimeOut(); 
    error ErrorSettlementTime(); 
    error ErrorBurnAllTime(); 
    error ErrorTransEth(); 

    constructor(address _usdc, uint _price, uint _feeRate, uint _duringMint, uint _duringLock, uint _duringSettlement) ERC20("CallOptToken", "COPT") {
        if(_usdc == address(0) || _price == 0 || _feeRate == 0 )
            revert InvaliedInitParam();

        usdc = _usdc;
        price = _price;
        feeRate = _feeRate;
        mintTime = block.timestamp + _duringMint;
        settlementTime = mintTime + _duringLock;
        duringSettlement = _duringSettlement;
        console.log("constructor block.timestamp:",block.timestamp);
        console.log("constructor mintTime:",mintTime);
        console.log("constructor settlementTime:",settlementTime);
    }

    function mint() public payable {
        console.log("mint block.timestamp:",block.timestamp);
        console.log("mint mintTime:",mintTime);
        if (block.timestamp > mintTime)
            revert MintTimeOut();

        _mint(msg.sender, msg.value * feeRate);
    }

    function settlement(uint amount) public {
        console.log("settlement block.timestamp:",block.timestamp);
        console.log("settlement settlementTime:",settlementTime);
        console.log("settlement duringSettlement:",duringSettlement);
        console.log("settlement amount:",amount);
        if(block.timestamp < settlementTime || block.timestamp >= settlementTime + duringSettlement) 
            revert ErrorSettlementTime();

        _burn(msg.sender, amount);

        uint needUsdcAmount = amount * price;
        console.log("settlement needUsdcAmount:",needUsdcAmount);
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), needUsdcAmount);

        safeTransEth(msg.sender, amount);
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

    function burnAll() public onlyOwner{
        console.log("burnAll block.timestamp:",block.timestamp);
        console.log("burnAll settlementTime:",settlementTime);
        console.log("burnAll duringSettlement:",duringSettlement);
        if(block.timestamp < settlementTime + duringSettlement)
            revert ErrorBurnAllTime();
        
        uint amountUsdc = IERC20(usdc).balanceOf(address(this));
        console.log("burnAll amountUsdc:",amountUsdc);
        console.log("burnAll address(this).balance:",address(this).balance);
        IERC20(usdc).safeTransfer(msg.sender, amountUsdc);

        // safeTransEth(msg.sender, address(this).balance);

        selfdestruct(payable(msg.sender));
    }

    receive() external payable  {
        console.log("receive msg.sender:",msg.sender); 
        console.log("receive msg.value:",msg.value);
    }
}