const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  require('dotenv').config();
  
  describe("YIToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployYIToken() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const YIToken = await ethers.getContractFactory("YIToken");
      const yi = await YIToken.deploy();
      // await yi.initialize();

      const Vault = await ethers.getContractFactory("Vault");
      const vault = await Vault.deploy();
  
      return { yi, vault, owner, otherAccount };
    }

    async function sig(otherAccount, yi, vault) {
      const deadline = Math.ceil(Date.now() / 1000) + parseInt(2000000 * 60);
      const nonce = await yi.nonces(otherAccount.address);
      const name = await yi.name();
      const chainId = await otherAccount.getChainId();
      // console.log(nonce);
      // console.log(deadline);
      const domain = {
          name: name,
          version: '1',
          chainId: chainId,
          verifyingContract: yi.address
      }
      const types = {
          Permit: [
            {name: "owner", type: "address"},
            {name: "spender", type: "address"},
            {name: "value", type: "uint256"},
            {name: "nonce", type: "uint256"},
            {name: "deadline", type: "uint256"}
          ]
      }
      const message = {
          owner: otherAccount.address,
          spender: vault.address,
          value: 1000,
          nonce: nonce,
          deadline: deadline
      }
      const signature = await otherAccount._signTypedData(domain, types, message);
      // console.log(signature);

      const {v, r, s} = ethers.utils.splitSignature(signature);
      // console.log(v, r, s);
  
      return  {v, r, s, deadline};
    }
  
    describe("Deployment", function () {
      it("name", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        
        expect(await yi.name()).to.be.equal("YI");
      });

      it("symbol", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        
        expect(await yi.symbol()).to.be.equal("YI");
      });

      it("totalSupply", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        
        expect(await yi.totalSupply()).to.be.equal(BigInt("100000000000000000000000"));
      });
      
      it("transfer", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);
        expect(await yi.balanceOf(otherAccount.address)).to.be.equal(1000);
      });

      it("approve", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);
        
        await yi.connect(otherAccount).approve(vault.address,1000);
        // console.log(`=============${a}`);
        expect(await yi.allowance(otherAccount.address, vault.address)).to.be.equal(1000);
      });

      it("deposit", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);
        
        await yi.connect(otherAccount).approve(vault.address,1000);

        await vault.connect(otherAccount).deposit(yi.address, 1000);

        expect(await vault.balanceOf(otherAccount.address,yi.address)).to.be.equal(1000);
      });

      
      it("withdrew success", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);
        
        await yi.connect(otherAccount).approve(vault.address,1000);
        
        await vault.connect(otherAccount).deposit(yi.address, 1000);
        
        await vault.connect(otherAccount).withdrew(yi.address, 1000);

        expect(await vault.balanceOf(otherAccount.address,yi.address)).to.be.equal(0);
      });

      
      it("withdrew fail", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);
        
        await yi.connect(otherAccount).approve(vault.address,1000);

        await vault.connect(otherAccount).deposit(yi.address, 1000);

        await expect(vault.connect(otherAccount).withdrew(yi.address, 1001)).to.be.revertedWithCustomError(vault,"LowBalance");
      });

      it("permitDeposit", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);

        const {v, r, s,deadline} = await sig(otherAccount,yi,vault);

        await vault.connect(otherAccount).permitDeposit(yi.address, 1000, deadline,v, r, s);

        expect(await vault.balanceOf(otherAccount.address,yi.address)).to.be.equal(1000);
      });


      it("withdrew success permitDeposit", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);
        
        const {v, r, s,deadline} = await sig(otherAccount,yi,vault);

        await vault.connect(otherAccount).permitDeposit(yi.address, 1000, deadline,v, r, s);

        await vault.connect(otherAccount).withdrew(yi.address, 1000);

        expect(await vault.balanceOf(otherAccount.address,yi.address)).to.be.equal(0);
      });

      
      it("withdrew fail permitDeposit", async function () {
        const { yi, vault,owner,otherAccount} = await loadFixture(deployYIToken);
        await yi.transfer(otherAccount.address,1000);
        
        const {v, r, s,deadline} = await sig(otherAccount,yi,vault);

        await vault.connect(otherAccount).permitDeposit(yi.address, 1000, deadline,v, r, s);

        await expect(vault.connect(otherAccount).withdrew(yi.address, 1001)).to.be.revertedWithCustomError(vault,"LowBalance");
      });

    //   it("withdrew success", async function () {
    //     const { bank,owner, otherAccount } = await loadFixture(deployBank);
    //     const amount = ethers.utils.parseEther("1");
    //     const tx = {
    //         value: amount,
    //         to: bank.address,
    //     }
    //     const receipt = await otherAccount.sendTransaction(tx)
    //     await receipt.wait() // 等待链上确认交易
        
    //     await bank.connect(otherAccount).withdrew();
    //     expect(await bank.balanceOfDepositor(otherAccount.address)).to.be.equal(0);
    //   });
      
    //   it("withdrew fail", async function () {
    //     const { bank,owner, otherAccount } = await loadFixture(deployBank);
    //     await expect(bank.withdrew()).to.be.revertedWithCustomError(bank,"LowBalance");
    //   });

    });
  
  
  
  });
  