const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
 
  const wethAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
  const routerAddress = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';

  describe("YITokenMarket", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployAll() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const YIToken = await ethers.getContractFactory("YIToken");
      const yi = await YIToken.deploy();
      await yi.deployed();

      const YITokenMarket = await ethers.getContractFactory("YITokenMarket");
      const yiTokenMarket = await YITokenMarket.deploy(routerAddress, wethAddress, yi.address);
      await yiTokenMarket.deployed();

      return { yi, yiTokenMarket, owner, otherAccount};
    }

    describe("TestCase", function () {
      it("addLiquidityETH", async function () {
        const { yi, yiTokenMarket, owner, otherAccount}= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("1", 18);
        var beforBlance = await yi.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("beforBlance:",beforBlance);
        console.log("amount:",amount);
        console.log("eth beforBlance:",await owner.getBalance());
        console.log("ethAmount:",ethAmount);
        await yi.approve(yiTokenMarket.address,amount);
        // 100000000000000000000000   beforBlance
        // 1000000000000000000000     amount

        // 9999995468650580498131     eth beforBlance
        // 1000000000000000000        ethAmount
        const {amountToken, amountETH, liquidit} = await yiTokenMarket.addLiquidityETH(amount, {value: ethAmount});
        

        var afterBlance = await yi.balanceOf(owner.address);
        console.log("afterBlance:",afterBlance);
        expect(beforBlance-afterBlance).to.be.equal(amount);
        expect(amountToken).to.be.lte(amount);
        expect(amountETH).to.be.lte(ethAmount);
        expect(liquidit).to.be.gte(0);
      });

      it("approve", async function () {
        const { yi, yiTokenMarket, owner, otherAccount  }= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        await yi.approve(yiTokenMarket.address,amount);
        const {amountToken} = await yiTokenMarket.byToken(amount, {value: amount});
        
        expect(amountToken).to.be.lte(amount);
      });

    });
  
  });
  