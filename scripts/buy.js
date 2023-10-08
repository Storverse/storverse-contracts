const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Replace these values with your specific contract information
  const contractAddress = "0xA1a46074428F09EB1eEa3ee30565F56D61499fbA";

  const abi = JSON.parse(fs.readFileSync("./scripts/abi.json", "utf-8"));

  // Get a signer to interact with the contract
  const [signer] = await ethers.getSigners();

  // Create a contract instance using the signer
  const nft = new ethers.Contract(contractAddress, abi, signer);
  const tokenId = 3;
  const price = ethers.utils.parseEther('0.002'); // Set the price in Ether, e.g. 0.002 ETH

    // Print the signer's address
    console.log(`Caller's address: ${signer.address}`);

  // Call the buy function with the tokenId and the required price
  const tx = await nft.buy(tokenId, {
    value: price,
    gasLimit: 300000
  });

  // Wait for the transaction to be mined
  const receipt = await tx.wait();

  console.log('Transaction mined:', receipt);

  console.log(`buy tokenId: ${tokenId}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });