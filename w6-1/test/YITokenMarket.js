const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
 
  const wethAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const routerAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

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

      const YITokenMarket = await ethers.getContractFactory("YITokenMarket");
      const yiTokenMarket = await YITokenMarket.deploy(routerAddress, wethAddress, yi.address, sushiToken.address, masterChef.address);
      await yiTokenMarket.deployed();

      return { yi, yiTokenMarket, sushiToken, masterChef, owner, otherAccount};
    }

    describe("TestCase", function () {
      it("addLiquidityETH", async function () {
        const { yi, yiTokenMarket, sushiToken, masterChef, owner, otherAccount}= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);
        var beforBlance = await yi.balanceOf(owner.address);
        // console.log("owner address:",owner.address);
        // console.log("beforBlance:",beforBlance);
        console.log("amount:",amount);
        // console.log("eth beforBlance:",await owner.getBalance());
        // console.log("ethAmount:",ethAmount);
        await yi.approve(yiTokenMarket.address,amount);
        // 100000000000000000000000   beforBlance
        // 1000000000000000000000     amount

        // 9999995468650580498131     eth beforBlance
        // 1000000000000000000        ethAmount
        const {amountToken, amountETH, liquidit} = await yiTokenMarket.addLiquidityETH(amount, {value: ethAmount});
        console.log("amountToken:",amountToken);
        console.log("amountETH:",amountETH);
        console.log("liquidit:",liquidit);
        

        var afterBlance = await yi.balanceOf(owner.address);
        console.log("beforBlance:",beforBlance);
        console.log("afterBlance:",afterBlance);
        expect(beforBlance.sub(afterBlance)).to.be.equal(amount);
        // expect(amountToken).to.be.lte(amount);
        // expect(amountETH).to.be.lte(ethAmount);
        // expect(liquidit).to.be.gte(0);
      });

      it("byToken", async function () {
        const { yi, yiTokenMarket, sushiToken, masterChef, owner, otherAccount  }= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);

        await yi.approve(yiTokenMarket.address,amount);

        await yiTokenMarket.addLiquidityETH(amount, {value: ethAmount});

        var amount = ethers.utils.parseUnits("100", 18);
        var ethAmount = ethers.utils.parseUnits("1", 18);
        var beforBlance = await yi.balanceOf(owner.address);
        // await yi.approve(yiTokenMarket.address,amount);

        const {amountToken} = await yiTokenMarket.byToken(amount, {value: ethAmount});
        console.log("byToken return amount:",amountToken);

        var afterBlance = await yi.balanceOf(owner.address);
        console.log("beforBlance:",beforBlance);
        console.log("afterBlance:",afterBlance);

        expect(afterBlance.sub(beforBlance)).to.be.gte(amount);
      });

      it("byTokenAndDeposit", async function () {
        const { yi, yiTokenMarket, sushiToken, masterChef, owner, otherAccount  }= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);

        await yi.approve(yiTokenMarket.address,amount);

        await yiTokenMarket.addLiquidityETH(amount, {value: ethAmount});

        var amount = ethers.utils.parseUnits("100", 18);
        var ethAmount = ethers.utils.parseUnits("1", 18);
        var beforBlance = await yi.balanceOf(masterChef.address);
        console.log("beforBlance:",beforBlance);
        // await yi.approve(yiTokenMarket.address,amount);

        var tx = await yiTokenMarket.byTokenAndDeposit(amount, {value: ethAmount});
        await tx.wait();

        var amountToken = await yiTokenMarket.depositd();
        console.log("121 byTokenAndDeposit depositd amount:",amountToken);
        expect(amountToken).to.be.gte(amount);

        var afterBlance = await yi.balanceOf(masterChef.address);
        console.log("afterBlance:",afterBlance);

        expect(afterBlance.sub(beforBlance)).to.be.equal(amountToken);
      });

      it("withdraw", async function () {
        const { yi, yiTokenMarket, sushiToken, masterChef, owner, otherAccount  }= await loadFixture(deployAll);

        var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);

        await yi.approve(yiTokenMarket.address,amount);

        await yiTokenMarket.addLiquidityETH(amount, {value: ethAmount});

        var amount = ethers.utils.parseUnits("100", 18);
        var ethAmount = ethers.utils.parseUnits("1", 18);
        

        var beforBlance = await yi.balanceOf(masterChef.address);
        // await yi.approve(yiTokenMarket.address,amount);

        var tx = await yiTokenMarket.byTokenAndDeposit(amount, {value: ethAmount});
        await tx.wait();

        var amountToken = await yiTokenMarket.depositd();
        console.log("151 byTokenAndDeposit depositd amount:",amountToken);
        expect(amountToken).to.be.gte(amount);

        var afterBlance = await yi.balanceOf(masterChef.address);
        console.log("beforBlance:",beforBlance);
        console.log("afterBlance:",afterBlance);
        
        expect(afterBlance.sub(beforBlance)).to.be.equal(amountToken);

        var beforeYiBlance = await yi.balanceOf(owner.address);
        console.log("beforeYiBlance:",beforeYiBlance);

        await yiTokenMarket.withdraw();
        var afterYiBlance = await yi.balanceOf(owner.address);
        console.log("afterYiBlance:",afterYiBlance);
        expect(afterYiBlance.sub(beforeYiBlance)).to.be.equal(amountToken);

        var sushiBlance = await sushiToken.balanceOf(owner.address);
        console.log("sushiBlance:",sushiBlance);
        expect(sushiBlance).to.be.gte(0);
      });

    });
  
  });
  