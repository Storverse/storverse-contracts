// Filename: setProfileNFTContract.js

const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const storverseAddress = "0x94F3BD3F7f484581BaaE02552FcB418444De48c1";
    const profileNFTContractAddress = "0xF710D205E67536c3dA42b7F353c103D011E69e97";

    // Load the ABI of the Storverse contract
    const abi = JSON.parse(fs.readFileSync("./scripts/abi.json", "utf-8"));

    // Get a signer to interact with the contract
    const [signer] = await ethers.getSigners();

    // Create a contract instance using the signer
    const storverse = new ethers.Contract(storverseAddress, abi, signer);

    console.log(`Caller's address: ${signer.address}`);

    // Call the setProfileNFTContract function
    const tx = await storverse.setProfileNFTContract(profileNFTContractAddress, {
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
