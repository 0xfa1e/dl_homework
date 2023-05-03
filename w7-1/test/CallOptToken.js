const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
 
  describe("CallOptToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployAll() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const USDC = await ethers.getContractFactory("USDC");
      const usdc = await USDC.deploy();
      await usdc.deployed();

      const CallOptToken = await ethers.getContractFactory("CallOptToken");
      const callOptToken = await CallOptToken.deploy(usdc.address, 3000, 100, 5, 0, 100000);//用于测试行权，故行权期间需要设置一定时长
      await callOptToken.deployed();

      
      const callOptToken2 = await CallOptToken.deploy(usdc.address, 3000, 100, 5, 0, 0);// 用于测试burnall，故行权期间设为0，以满足时间要求；
      await callOptToken2.deployed();
      
      return { usdc, callOptToken, callOptToken2, owner, otherAccount};
    }

    function sleep(milliseconds) {  
      return new Promise(resolve => setTimeout(resolve, milliseconds));  
   } 

    describe("TestCase", function () {
      it("mint", async function () {
        const { usdc, callOptToken, callOptToken2, owner, otherAccount}= await loadFixture(deployAll);

        // var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);
        console.log("ethAmount:",ethAmount);
        // 5000000000000000000
        // 9935985102777778787850
        var beforBlance = await callOptToken.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("callOptToken beforBlance:",beforBlance);
        // console.log("amount:",amount);
        console.log("eth beforBlance:",await owner.getBalance());

        await callOptToken.mint({value: ethAmount});
        
        console.log("eth afterBlance:",await owner.getBalance());

        var afterBlance = await callOptToken.balanceOf(owner.address);
        console.log("callOptToken afterBlance:",afterBlance);
        expect(afterBlance.sub(beforBlance)).to.be.equal(ethAmount.mul(100));

      });

      it("settlement", async function () {
        const { usdc, callOptToken, callOptToken2, owner, otherAccount}= await loadFixture(deployAll);

        // var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);
        console.log("ethAmount:",ethAmount);
        var beforBlance = await callOptToken.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("callOptToken beforBlance:",beforBlance);
        // console.log("amount:",amount);
        console.log("eth beforBlance:",await owner.getBalance());

        await callOptToken.mint({value: ethAmount});
        
        console.log("eth afterBlance:",await owner.getBalance());

        var afterBlance = await callOptToken.balanceOf(owner.address);
        console.log("callOptToken afterBlance:",afterBlance);
        expect(afterBlance.sub(beforBlance)).to.be.equal(ethAmount.mul(100));


        var ethAmount = ethers.utils.parseUnits("400", 18);
        var usdcAmount = ethers.utils.parseUnits("1200000", 18);
        await usdc.transfer(otherAccount.address,usdcAmount);
        await callOptToken.transfer(otherAccount.address,ethAmount);
        await usdc.connect(otherAccount).approve(callOptToken.address,usdcAmount);
        var ownerEthBeforBlance = await owner.getBalance();
        console.log("owner eth beforBlance:",ownerEthBeforBlance);
        console.log("ethAmount:",ethAmount);
        // 9905985102776645349218
        // 400000000000000000000
        const tx = {
          value: ethAmount,
          to: callOptToken.address,
        }
        const receipt = await owner.sendTransaction(tx);
        await receipt.wait(); // 等待链上确认交易
        // console.log(receipt);

        // var callOptEthBeforBlance = await callOptToken.getBalance();
        var ethBeforBlance = await otherAccount.getBalance();
        var usdcBeforBlance = await usdc.balanceOf(otherAccount.address);
        var callOptTokenBeforBlance = await callOptToken.balanceOf(otherAccount.address);
        console.log("eth beforBlance:",ethBeforBlance);
        console.log("usdc beforBlance:",usdcBeforBlance);
        console.log("callOptToken beforBlance:",callOptTokenBeforBlance);
        // console.log("callOptToken ETH beforBlance:",callOptEthBeforBlance);

        await callOptToken.connect(otherAccount).settlement(ethAmount);

        // var callOptEthAfterBlance = await callOptToken.getBalance();
        var ethAfterBlance = await otherAccount.getBalance();
        var usdcAfterBlance = await usdc.balanceOf(otherAccount.address);
        var callOptTokenAfterBlance = await callOptToken.balanceOf(otherAccount.address);
        console.log("eth afterBlance:",ethAfterBlance);
        expect(ethAfterBlance.sub(ethBeforBlance)).to.be.lt(ethAmount);//需支付gas ，故而小于

        console.log("usdc afterBlance:",usdcAfterBlance);
        expect(usdcBeforBlance.sub(usdcAfterBlance)).to.be.equal(usdcAmount);

        console.log("callOptToken afterBlance:",callOptTokenAfterBlance);
        // console.log("callOptToken ETH afterBlance:",callOptEthAfterBlance);

        expect(callOptTokenBeforBlance.sub(callOptTokenAfterBlance)).to.be.equal(ethAmount);
        // expect(callOptEthBeforBlance.sub(callOptEthAfterBlance)).to.be.equal(ethAmount);
      });

      it("burnAll", async function () {
        
        const { usdc, callOptToken, callOptToken2, owner, otherAccount}= await loadFixture(deployAll);

        // var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);
        console.log("ethAmount:",ethAmount);
        var beforBlance = await callOptToken2.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("callOptToken beforBlance:",beforBlance);
        // console.log("amount:",amount);
        console.log("eth befor mint Blance:",await owner.getBalance());

        await callOptToken2.mint({value: ethAmount});
        
        console.log("eth after mint Blance:",await owner.getBalance());

        var afterBlance = await callOptToken2.balanceOf(owner.address);
        console.log("callOptToken afterBlance:",afterBlance);
        expect(afterBlance.sub(beforBlance)).to.be.equal(ethAmount.mul(100));
        
        await sleep(5000);

        var ethBeforBlance = await owner.getBalance();
        console.log("eth beforBlance:",ethBeforBlance);

        await callOptToken2.burnAll();

        var ethAfterBlance = await owner.getBalance();
        console.log("eth afterBlance:",ethAfterBlance);
        expect(ethAfterBlance.sub(ethBeforBlance)).to.be.gt(0).and.lt(ethAmount);//需支付gas ，故而小于
      });

    });
  
  });
  