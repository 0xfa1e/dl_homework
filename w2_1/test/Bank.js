const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
  
  describe("Bank", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployBank() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const Bank = await ethers.getContractFactory("Bank");
      const bank = await Bank.deploy();
  
      return { bank, owner, otherAccount };
    }
  
    describe("Deployment", function () {
      it("deposit", async function () {
        const { bank,owner,otherAccount} = await loadFixture(deployBank);
        // const provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${INFURA_ID}`)
        // const wallet = new ethers.Wallet(otherAccount);
        const amount = ethers.utils.parseEther("1");
        const tx = {
            value: amount,
            to: bank.address,
        }
        const receipt = await otherAccount.sendTransaction(tx)
        await receipt.wait() // 等待链上确认交易
        // console.log(receipt) // 打印交易详情

        // await bank.connect(otherAccount);
        expect(await bank.balanceOfDepositor(otherAccount.address)).to.be.equal(amount);
      });

      it("withdrew success", async function () {
        const { bank,owner, otherAccount } = await loadFixture(deployBank);
        const amount = ethers.utils.parseEther("1");
        const tx = {
            value: amount,
            to: bank.address,
        }
        const receipt = await otherAccount.sendTransaction(tx)
        await receipt.wait() // 等待链上确认交易
        
        await bank.connect(otherAccount).withdrew();
        expect(await bank.balanceOfDepositor(otherAccount.address)).to.be.equal(0);
      });
      
      it("withdrew fail", async function () {
        const { bank,owner, otherAccount } = await loadFixture(deployBank);
        await expect(bank.withdrew()).to.be.revertedWithCustomError(bank,"LowBalance");
      });

    });
  
  
  
  });
  