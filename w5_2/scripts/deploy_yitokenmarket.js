// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const YIToken = await hre.ethers.getContractFactory("YIToken");
  const yiToken = await YIToken.deploy();
  await yiToken.deployed();
  console.log(
    `YIToken deployed to ${yiToken.address}`
  );

  const wethAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const routerAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

  const YITokenMarket = await ethers.getContractFactory("YITokenMarket");
  const yiTokenMarket = await YITokenMarket.deploy(routerAddress, wethAddress, yiToken.address);
  await yiTokenMarket.deployed();
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
