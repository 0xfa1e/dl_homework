合约部署环境：mumbai
合约地址：0x86E2a64DE99e1Fd79CBaf400f72faDB6544c8E15

合约验证：
![image](https://user-images.githubusercontent.com/125674197/224489006-a7377d29-e789-41b5-818c-b956bbf00a28.png)

注意：
合约验证报错：Error in plugin @nomiclabs/hardhat-etherscan: Failed to obtain list of solc versions. Reason: connect ECONNREFUSED 127.0.0.1:443
可通过配置代理解决（hardhat.config.js）：
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent('http://127.0.0.1:10809'); // change to yours
setGlobalDispatcher(proxyAgent);
