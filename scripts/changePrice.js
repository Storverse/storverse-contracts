// Filename: changePrice.js

const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const contractAddress = "0x8121dfB70ed421D33Be9004AC25d88262d7da3Fb";

    // Load the ABI of the contract
    const abi = JSON.parse(fs.readFileSync("./scripts/abi.json", "utf-8"));

    // Get a signer to interact with the contract
    const [signer] = await ethers.getSigners();

    // Create a contract instance using the signer
    const contract = new ethers.Contract(contractAddress, abi, signer);

    console.log(`Caller's address: ${signer.address}`);

    const tokenId = 1; // Replace with the desired tokenId
    const newPrice = ethers.utils.parseEther('0.01'); // Set the new price in Ether, e.g. 0.01 ETH

    // Call the changePrice function with the tokenId and the new price
    const tx = await contract.changePrice(tokenId, newPrice, {
        gasLimit: 300000
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    console.log('Transaction mined:', receipt);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
