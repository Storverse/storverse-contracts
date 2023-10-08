const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Replace this with your contract's address
  const contractAddress = "0xA1a46074428F09EB1eEa3ee30565F56D61499fbA";

  // Load the ABI, which defines how to interact with the contract
  const abi = JSON.parse(fs.readFileSync("./scripts/abi.json", "utf-8"));

  // Get a signer to interact with the contract
  // const [signer] = await ethers.getSigners();

  const accounts = await ethers.getSigners();
  
  // Select the third account
  const signer = accounts[0];

  // Create a contract instance using the signer
  const myContract = new ethers.Contract(contractAddress, abi, signer);

  // Print the signer's address
  console.log(`Caller's address: ${signer.address}`);

  // Call the getBalance function
  const balance = await myContract.getBalance();

  // The balance will be a BigNumber instance. To convert it to a string, use toString()
  console.log(`Balance: ${balance.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
