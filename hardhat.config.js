/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require('@nomiclabs/hardhat-ethers');
 require("@nomiclabs/hardhat-etherscan");
 
 const { projectId, mnemonic } = require('./secret.json');
 
 module.exports = {
     solidity:{
        version: "0.8.19",
        settings: {          
             optimizer: {
               enabled: true,
               runs: 200
             }
        }
     },
     networks: {
         mainnet: {
           url: `https://mainnet.infura.io/v3/${projectId}`,
           gasPrice: 22000000000,
           accounts: {mnemonic: mnemonic},
           network_id: 1,
         },
         rinkeby: {
             url: `https://rinkeby.infura.io/v3/${projectId}`,
             accounts: {mnemonic: mnemonic},
             network_id: 4
         },
         testnet: {
             url: `https://bsc-testnet.publicnode.com`,
             accounts: {mnemonic: mnemonic},
             network_id: 97
         },
         bsc: {
             url: `https://bsc-dataseed.binance.org`,
             accounts: {mnemonic: mnemonic},
             network_id: 1
         },
         mumbai: {
           url: "https://rpc-mumbai.maticvigil.com",
           accounts: {mnemonic: mnemonic},
           network_id: 80001
         },
         polygon: {
           url: "https://",
           accounts: {mnemonic: mnemonic},
           network_id: 137
         }
   },
   etherscan: {
    apiKey: ""
   }
 };
 
