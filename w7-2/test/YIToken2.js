const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
 
  describe("YIToken2", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployAll() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();

      var totalSupply = ethers.utils.parseUnits("1000", 18);

      const YIToken2 = await ethers.getContractFactory("YIToken2");
      const yiToken2 = await YIToken2.deploy(0, totalSupply);
      await yiToken2.deployed();
      
      return { yiToken2, owner, otherAccount};
    }

    function sleep(milliseconds) {  
      return new Promise(resolve => setTimeout(resolve, milliseconds));  
   } 

    describe("TestCase", function () {
      it("constructor", async function () {
        const { yiToken2, owner, otherAccount }= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        var totalSupplyBefore = await yiToken2.totalSupply();
        console.log("totalSupplyBefore:",totalSupplyBefore);

        var beforBlance = await yiToken2.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("yiToken2 beforBlance:",beforBlance);

        expect(totalSupplyBefore).to.be.equal(amount);
        expect(beforBlance).to.be.equal(amount);

      });

      it("rebase", async function () {
        const { yiToken2, owner, otherAccount }= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        var totalSupplyBefore = await yiToken2.totalSupply();
        console.log("totalSupplyBefore:",totalSupplyBefore);

        var beforBlance = await yiToken2.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("yiToken2 beforBlance:",beforBlance);

        expect(totalSupplyBefore).to.be.equal(amount);
        expect(beforBlance).to.be.equal(amount);

        await yiToken2.rebase();

        var amount2 = ethers.utils.parseUnits("990", 18);
        var totalSupplyAfter = await yiToken2.totalSupply();
        console.log("totalSupplyAfter:",totalSupplyAfter);

        var afterBlance = await yiToken2.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("yiToken2 afterBlance:",afterBlance);

        expect(totalSupplyAfter).to.be.equal(amount2);
        expect(afterBlance).to.be.equal(amount2);
      });

    });
  
  });
  