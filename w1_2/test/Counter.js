const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Counter", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployCounter() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const Counter = await ethers.getContractFactory("Counter");
      const counter = await Counter.deploy();
  
      return { counter, owner, otherAccount };
    }
  
    describe("Deployment", function () {
      it("can call by owner", async function () {
        const { counter,owner } = await loadFixture(deployCounter);
        await counter.connect(owner).count();
        expect(await counter.counter()).to.equal(1);
      });

      it("can not call by otherAccount", async function () {
        const { counter,owner, otherAccount } = await loadFixture(deployCounter);
        await expect(counter.connect(otherAccount).count()).to.be.revertedWith("only onwer called");
      });
    });
  
  
  
  });
  