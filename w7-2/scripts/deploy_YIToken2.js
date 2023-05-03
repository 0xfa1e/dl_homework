// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  var totalSupply = ethers.utils.parseUnits("1000", 18);
  var duringRebase = 365 * 24 * 60 * 60;

  const YIToken2 = await ethers.getContractFactory("YIToken2");
  const yiToken2 = await YIToken2.deploy(duringRebase, totalSupply);
  await yiToken2.deployed();

  console.log(
    `yiToken2 deployed to ${yiToken2.address}`
  );

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
