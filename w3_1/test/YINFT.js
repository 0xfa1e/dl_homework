const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
  
  describe("YINFT", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployYINFT() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const YINFT = await ethers.getContractFactory("YINFT");
      const yi = await YINFT.deploy();

      const YIToken = await ethers.getContractFactory("YIToken");
      const yiToken = await YIToken.deploy();
    //   await yiToken.initialize();

      const NFTMarket = await ethers.getContractFactory("NFTMarket");
      const nm = await NFTMarket.deploy(yiToken.address);
  
      return { yi, nm, yiToken , owner, otherAccount };
    }
  
    describe("Deployment", function () {
      it("name", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        expect(await yi.name()).to.be.equal("YI-NFT");
      });

      it("symbol", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        expect(await yi.symbol()).to.be.equal("YFT");
      });

      it("totalSupply", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        expect(await yi.totalSupply()).to.be.equal(1000);
      });
      
      it("user balance", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        await yi.mint(otherAccount.address,"https://xxxx"); 

        await yi.connect(otherAccount).approve(nm.address,1);

        await nm.connect(otherAccount).upSelling(yi.address, 1, 1000);

        // await yiToken.transfer(otherAccount.address,1000);

        await yiToken.approve(nm.address,1000);

        await nm.buy(yi.address, 1, 1000);

        expect(await yiToken.balanceOf(otherAccount.address)).to.be.equal(1000);
        expect(await yiToken.balanceOf(owner.address)).to.be.equal(BigInt("100000000000000000000000")-BigInt("1000"));
      });
    });

    describe("Events", function () {
      it("mint", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);

        await expect(await yi.mint(otherAccount.address,"https://xxxx")).to.emit(yi, "Minted")
        .withArgs(await otherAccount.address, 1, "https://xxxx"); 
      });

      it("upSelled", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        await yi.mint(owner.address,"https://xxxx"); 

        await yi.approve(nm.address,1);

        await expect(await nm.upSelling(yi.address, 1, 1000)).to.emit(nm, "UpSelled")
        .withArgs(await owner.address, yi.address, 1, 1000); 
      });

      it("Buyed", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        await yi.mint(owner.address,"https://xxxx"); 

        await yi.approve(nm.address,1);

        await nm.upSelling(yi.address, 1, 1000);

        await yiToken.transfer(otherAccount.address,1000);

        await yiToken.connect(otherAccount).approve(nm.address,1000);

        await expect(await nm.connect(otherAccount).buy(yi.address, 1, 1000)).to.emit(nm, "Buyed")
        .withArgs(await otherAccount.address, yi.address, 1, 1000); 
      });

      
      it("Buy fail:LowPrice", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        await yi.mint(owner.address,"https://xxxx"); 

        await yi.approve(nm.address,1);

        await nm.upSelling(yi.address, 1, 1000);

        await yiToken.transfer(otherAccount.address,1000);

        await yiToken.connect(otherAccount).approve(nm.address,1000);

        await expect(nm.connect(otherAccount).buy(yi.address, 1, 999)).to.be.revertedWithCustomError(nm,"LowPrice");
      });

      
      it("Buy fail:NotUpSelling", async function () {
        const { yi, nm, yiToken ,owner,otherAccount} = await loadFixture(deployYINFT);
        
        await yi.mint(owner.address,"https://xxxx"); 

        await yi.approve(nm.address,1);

        // await nm.upSelling(yi.address, 1, 1000);

        await yiToken.transfer(otherAccount.address,1000);

        await yiToken.connect(otherAccount).approve(nm.address,1000);

        await expect(nm.connect(otherAccount).buy(yi.address, 1, 1000)).to.be.revertedWithCustomError(nm,"NotUpSelling");
      });

    });
  });
  