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
  
      const Treasury = await ethers.getContractFactory("Treasury");
      const treasury = await Treasury.deploy();
      await treasury.deployed();

      
      const GovToken = await ethers.getContractFactory("GovToken");
      const govToken = await GovToken.deploy(treasury.address);
      await govToken.deployed();

      const Gov = await ethers.getContractFactory("Gov");
      const gov = await Gov.deploy(govToken.address, treasury.address, 1, 1);
      await gov.deployed();

            
      return { treasury, govToken, gov, owner, otherAccount };
    }

    function sleep(milliseconds) {  
      return new Promise(resolve => setTimeout(resolve, milliseconds));  
   } 

    describe("TestCase", function () {
       
      it("Gov propose castVote endVoting", async function () {
        const { treasury, govToken, gov, owner, otherAccount }= await loadFixture(deployAll);

        // var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);
        console.log("ethAmount:",ethAmount);
        // 5000000000000000000
        // 9935985102777778787850
        var beforBlance = await govToken.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("govToken beforBlance:",beforBlance);
        // console.log("amount:",amount);
        console.log("eth beforBlance:",await owner.getBalance());

        await govToken.mint({value: ethAmount});
        var blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log("mint blockNumber:",blockNumber);
        console.log("eth afterBlance:",await owner.getBalance());

        var afterBlance = await govToken.balanceOf(owner.address);
        console.log("govToken afterBlance:",afterBlance);
        expect(afterBlance.sub(beforBlance)).to.be.equal(ethAmount);

        console.log("treasury ethBlance:",await hre.ethers.provider.getBalance(treasury.address));
        
      });

      it("Gov propose castVote endVoting", async function () {
        const { treasury, govToken, gov, owner, otherAccount }= await loadFixture(deployAll);

        // var amount = ethers.utils.parseUnits("1000", 18);
        var ethAmount = ethers.utils.parseUnits("5", 18);
        console.log("ethAmount:",ethAmount);
        // 5000000000000000000
        // 9935985102777778787850
        var beforBlance = await govToken.balanceOf(owner.address);
        console.log("owner address:",owner.address);
        console.log("govToken beforBlance:",beforBlance);
        // console.log("amount:",amount);
        console.log("eth beforBlance:",await owner.getBalance());

        await govToken.mint({value: ethAmount});
        var blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log("mint blockNumber:",blockNumber);
        console.log("eth afterBlance:",await owner.getBalance());

        var afterBlance = await govToken.balanceOf(owner.address);
        console.log("govToken afterBlance:",afterBlance);
        expect(afterBlance.sub(beforBlance)).to.be.equal(ethAmount);

        console.log("treasury ethBlance:",await hre.ethers.provider.getBalance(treasury.address));
        
        await treasury.transferOwnership(gov.address);
        var ownership = await treasury.owner();
        console.log("treasury ownership:",ownership);

        await govToken.connect(otherAccount).mint({value: ethAmount});

        await govToken.connect(otherAccount).transfer(owner.address, ethers.utils.parseUnits("1", 18));
        var blockNumber2 = await hre.ethers.provider.getBlockNumber();
        console.log("mint blockNumber2:",blockNumber2);

        sleep(5);
        await govToken.connect(otherAccount).mint({value: ethAmount});//为了出一个新块，避免同一个区块交易后立即查询票数

        var votes = await govToken.getVotes(owner.address, blockNumber);
        var votes2 = await govToken.getVotes(owner.address, blockNumber2);
        console.log("votes:",votes, " at ", blockNumber);
        console.log("votes2:",votes2, " at ", blockNumber2);
        expect(votes).to.be.equal(ethAmount);
        expect(votes2).to.be.equal(ethers.utils.parseUnits("1", 18).add(ethAmount));


        var receipt = await gov.propose();
        await receipt.wait(); // 等待链上确认交易
        var proposalCount = await gov.proposalCount();
        console.log("proposalCount:", proposalCount);
        expect(proposalCount).to.be.equal(1);

        var proposals = await gov.proposals(proposalCount);
        console.log("proposals:", proposals);
        expect(proposals.proposer).to.be.equal(owner.address);

        await govToken.connect(otherAccount).mint({value: ethAmount});//为了出一个新块，避免同一个区块交易后立即查询票数

        var receipt = await gov.castVote(proposalCount, true);
        await receipt.wait(); // 等待链上确认交易

        var proposals = await gov.proposals(proposalCount);
        console.log("proposals:", proposals);
        expect(proposals.yesVotes).to.be.equal(await govToken.balanceOf(owner.address));

        await govToken.connect(otherAccount).mint({value: ethAmount});//为了出一个新块，避免同一个区块交易后立即查询票数

        console.log("treasury ethBlance before endVoting:",await hre.ethers.provider.getBalance(treasury.address));

        var receipt = await gov.endVoting(proposalCount);
        await receipt.wait(); // 等待链上确认交易
        var ethBlance2 = await hre.ethers.provider.getBalance(treasury.address);
        console.log("treasury ethBlance after endVoting:", ethBlance2);
        expect(ethBlance2).to.be.equal(0);
      });


      

    });
  
  });
  