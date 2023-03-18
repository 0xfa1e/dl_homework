const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
  
  describe("Score", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployScore() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const Score = await ethers.getContractFactory("Score");
      const score = await Score.deploy();

      const Teacher = await ethers.getContractFactory("Teacher");
      const teacher = await Teacher.deploy();
  
      return { score, teacher, owner, otherAccount };
    }
  
    describe("Deployment", function () {
      it("saveSuccess", async function () {
        const { score, teacher ,owner,otherAccount} = await loadFixture(deployScore);
        score.addTeacher(teacher.address);
        await teacher.saveScore(score.address, otherAccount.address, 100)
        // await bank.connect(otherAccount);
        expect(await score.scoreOf(teacher.address, otherAccount.address)).to.be.equal(100);
      });

      it("savefail", async function () {
        const { score, teacher ,owner,otherAccount} = await loadFixture(deployScore);
        score.addTeacher(teacher.address);
         
        await expect(teacher.saveScore(score.address, otherAccount.address, 101)).to.be.revertedWithCustomError(score,"ErrorScore");
      });

      it("OnlyOwner", async function () {
        const { score, teacher ,owner,otherAccount} = await loadFixture(deployScore);
        
        await expect(score.connect(otherAccount).addTeacher(teacher.address)).to.be.revertedWithCustomError(score,"OnlyOwner");
      });

      it("OnlyTeacher", async function () {
        const { score, teacher ,owner,otherAccount} = await loadFixture(deployScore);
        score.addTeacher(teacher.address);
         
        await expect(score.saveScore(otherAccount.address, 100)).to.be.revertedWithCustomError(score,"OnlyTeacher");
      });

    });
  
  
  
  });
  