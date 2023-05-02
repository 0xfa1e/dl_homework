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
  
  const SushiToken = await ethers.getContractFactory("SushiToken");
  const sushiToken = await SushiToken.deploy();
  await sushiToken.deployed();
  
  const MasterChef = await ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(sushiToken.address, ethers.utils.parseUnits("40", 18), 10);
  await masterChef.deployed();

  var tx = await sushiToken.transferOwnership(masterChef.address);
  await tx.wait();
  
  tx = await masterChef.add(100, yi.address, true);
  await tx.wait();

  const wethAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const routerAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

  const YITokenMarket = await ethers.getContractFactory("YITokenMarket");
  const yiTokenMarket = await YITokenMarket.deploy(routerAddress, wethAddress, yiToken.address, sushiToken.address, masterChef.address);
  await yiTokenMarket.deployed();
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
