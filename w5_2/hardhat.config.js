const { ethers } = require("ethers");
const { task } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent('http://127.0.0.1:10809'); // change to yours
setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  etherscan: {
    apiKey: {
      goerli: process.env.ALCHEMY_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY
    },
    customChains: [
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: "http://api-goerli.etherscan.io/api",  // https => http
          browserURL: "https://goerli.etherscan.io"
        }
      }
    ]
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    dev: {
        url: "http://127.0.0.1:8545",
        chainId: 31337,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    mumbai: {
      // url: "https://endpoints.omniatech.io/v1/matic/mumbai/public",  
      url: "https://rpc-mumbai.maticvigil.com/",
      // url: "https://matic-mumbai.chainstacklabs.com/",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
    },
  },
};


task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});