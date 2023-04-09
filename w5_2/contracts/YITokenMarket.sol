// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
}

contract YITokenMarket {
    IUniswapV2Router02 uniswapV2Router02;
    address wETHaddress;
    address yiToken;

    error InvaliedInitParam(); 

    constructor(address _uniswapV2Router02,address _WETH, address _yiToken) {
        if(_yiToken == address(0) || _WETH == address(0) || _uniswapV2Router02 == address(0)) 
            revert InvaliedInitParam();

        uniswapV2Router02 = IUniswapV2Router02(_uniswapV2Router02);
        wETHaddress = _WETH;
        yiToken = _yiToken;
    }

    function addLiquidityETH(
        uint amountToken
    ) external payable{
        ERC20 token = ERC20(yiToken);
        token.transferFrom(msg.sender, address(this), amountToken);
        token.approve(address(uniswapV2Router02), amountToken);

        uniswapV2Router02.addLiquidityETH{value: msg.value}(yiToken, amountToken, 0, 0, msg.sender, block.timestamp);
    }

    function byToken(uint amountOutMin) external payable returns (uint amountToken) {
        address[] path = new address[](2);
        path[0] = WETH;
        path[1] = yiToken;

        uint[] memory amounts = uniswapV2Router02.swapExactETHForTokens{value: msg.value}(amountOutMin, path, address(this), block.timestamp);
        amountToken = amounts[amounts.length-1];

        uint amount = ERC20(yiToken).balanceOf(address(this));
        ERC20(yiToken).transfer(msg.sender, amount);

    }
}