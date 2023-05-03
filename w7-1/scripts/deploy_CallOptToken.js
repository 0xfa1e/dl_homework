// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy();
  await usdc.deployed();

  console.log(
    `usdc deployed to ${usdc.address}`
  );

  const CallOptToken = await ethers.getContractFactory("CallOptToken");
  const callOptToken = await CallOptToken.deploy(usdc.address, 3000, 100, 5, 0, 100000);
  await callOptToken.deployed();

  console.log(
    `callOptToken deployed to ${callOptToken.address}`
  );
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
