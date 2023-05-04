// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";
import './IUniswapV2Router01.sol';
import './IMasterChef.sol';
import './MasterChef.sol';



contract YITokenMarket {
    using SafeERC20 for IERC20;
    address router;
    address wETHaddress;
    address yiToken;
    address sushi;
    address masterChef;
    mapping(address => uint) public depositd;

    error InvaliedInitParam(); 

    constructor(address _router,address _WETH, address _yiToken, address _sushi, address _masterChef) {
        if(_yiToken == address(0) || _WETH == address(0) || _router == address(0) || _sushi == address(0) || _masterChef == address(0)) 
            revert InvaliedInitParam();

        router = _router;
        wETHaddress = _WETH;
        yiToken = _yiToken;
        sushi = _sushi;
        masterChef = _masterChef;
    }

    function addLiquidityETH(
        uint yiTokenAmount
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity) {
        // console.log("addLiquidityETH",yiTokenAmount,msg.value);
        IERC20 token = IERC20(yiToken);
        token.safeTransferFrom(msg.sender, address(this), yiTokenAmount);
        token.safeApprove(router, yiTokenAmount);
        
        address weth = IUniswapV2Router01(router).WETH();
        address factory = IUniswapV2Router01(router).factory();
        console.log("WETH:",weth);
        console.log("factory:",factory);

        console.log("line 40 router:",router);

        (amountToken, amountETH, liquidity) = IUniswapV2Router01(router).addLiquidityETH{value: msg.value}(yiToken, yiTokenAmount, 100, 100, msg.sender, block.timestamp);
        console.log("amountToken:",amountToken);
        console.log("amountETH:",amountETH);
        console.log("liquidit:",liquidity);
        // IUniswapV2Router01(router).addLiquidityETH{value: msg.value}(myToken, tokenAmount, 0, 0, msg.sender, block.timestamp);
    }

    function byToken(uint amountOutMin) external payable returns (uint amountToken){
        address[] memory path = new address[](2);
        path[0] = wETHaddress;
        path[1] = yiToken;
        
        uint[] memory amounts = IUniswapV2Router01(router).swapExactETHForTokens{value: msg.value}(amountOutMin, path, msg.sender, block.timestamp);
        amountToken = amounts[1];
        
        console.log("byToken return amount:",amountToken);
    }

    function byTokenAndDeposit(uint amountOutMin) external payable returns (uint amountToken){
        address[] memory path = new address[](2);
        path[0] = wETHaddress;
        path[1] = yiToken;
        
        uint[] memory amounts = IUniswapV2Router01(router).swapExactETHForTokens{value: msg.value}(amountOutMin, path, address(this), block.timestamp);
        amountToken = amounts[1];
        
        console.log("byTokenAndDeposit return amount:",amountToken);

        IERC20(yiToken).safeApprove(masterChef,amountToken);
        IMasterChef(masterChef).deposit(0, amountToken);
        depositd[msg.sender] += amountToken;
        console.log("byTokenAndDeposit masterChef depositd yiToken:",depositd[msg.sender]);
    }

    function withdraw() public {
        uint amountYiToken = depositd[msg.sender];
        console.log("depositd:", amountYiToken);
        if(amountYiToken > 0) {
            depositd[msg.sender] = 0;
            IMasterChef(masterChef).withdraw(0, amountYiToken);
            IERC20(yiToken).safeTransfer(msg.sender, amountYiToken);
            console.log("yiToken balanceOf msg.sender:",IERC20(yiToken).balanceOf(msg.sender));

            uint amountSushi = IERC20(sushi).balanceOf(address(this));
            IERC20(sushi).safeTransfer(msg.sender, amountSushi);
            console.log("sushi balanceOf msg.sender:",IERC20(sushi).balanceOf(msg.sender));
        }
        

    }
}