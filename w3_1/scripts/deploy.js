// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const YINFT = await hre.ethers.getContractFactory("YINFT");
  const yi = await YINFT.deploy();

  await yi.deployed();
  console.log(
    `YINFT deployed to ${yi.address}`
  );

  const YIToken = await hre.ethers.getContractFactory("YIToken");
  const yiToken = await YIToken.deploy();
  // await yiToken.initialize();

  await yiToken.deployed();
  console.log(
    `YIToken deployed to ${yiToken.address}`
  );

  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nm = await NFTMarket.deploy(yiToken.address);

  await nm.deployed();
  console.log(
    `NFTMarket deployed to ${nm.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
