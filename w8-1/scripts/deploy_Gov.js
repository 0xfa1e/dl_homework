// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed();

  console.log(
    `treasury deployed to ${treasury.address}`
  );
  
  const GovToken = await ethers.getContractFactory("GovToken");
  const govToken = await GovToken.deploy(treasury.address);
  await govToken.deployed();

  console.log(
    `govToken deployed to ${govToken.address}`
  );

  var votingDelay = 17280;// ~3 days in blocks
  var votingPeriod = 17280;// ~3 days in blocks

  const Gov = await ethers.getContractFactory("Gov");
  const gov = await Gov.deploy(govToken.address, treasury.address, votingDelay, votingPeriod);
  await gov.deployed();

  console.log(
    `gov deployed to ${gov.address}`
  );

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
