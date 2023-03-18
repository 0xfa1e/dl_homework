// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = hre.ethers.utils.parseEther("1");

  // const Lock = await hre.ethers.getContractFactory("Lock");
  // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  // await lock.deployed();

  // const TestStore = await hre.ethers.getContractFactory("TestStore");
  // const testStore = await TestStore.deploy();

  // await testStore.deployed();

  
  // const Counter = await hre.ethers.getContractFactory("Counter");
  // const counter = await Counter.deploy();

  // await counter.deployed();

  // console.log(
  //   `deployed to ${counter.address}`
  // );
  const Bank = await hre.ethers.getContractFactory("Bank");
  const bank = await Bank.deploy();

  await bank.deployed();

  console.log(
    `Bank deployed to ${bank.address}`
  );

  
  const Score = await hre.ethers.getContractFactory("Score");
  const score = await Score.deploy();

  await score.deployed();

  console.log(
    `Score deployed to ${score.address}`
  );

  
  const Teacher = await hre.ethers.getContractFactory("Teacher");
  const teacher = await Teacher.deploy();

  await teacher.deployed();

  console.log(
    `Teacher deployed to ${teacher.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});