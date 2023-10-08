const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    // Replace these values with your specific contract information
    const contractAddress = "0x8121dfB70ed421D33Be9004AC25d88262d7da3Fb";

    const abi = JSON.parse(fs.readFileSync("./scripts/abi.json", "utf-8"));

    // Get a signer to interact with the contract
    const [signer] = await ethers.getSigners();

    // Create a contract instance using the signer
    const nft = new ethers.Contract(contractAddress, abi, signer);

    // Mint a new token
    const data_id = "fe2d71a0-e114-11ed-9997-25bb9aa0834d";
    const price = ethers.utils.parseEther('0.002'); // Set the price in Ether, e.g. 0.002 ETH

    const gasLimit = ethers.BigNumber.from("500000"); // You can adjust the value accordingly
    const mintTransaction = await nft.mint(data_id, price, 2, 0, { gasLimit });

    await mintTransaction.wait(); // Wait for the transaction to be mined

    console.log(`Minted token with data_id ${data_id} and price ${ethers.utils.formatEther(price)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });