async function main() {
  const accounts = await ethers.provider.listAccounts();
  console.log(accounts[0]);

  // Fetching the current gas price from the network
  const gasPrice = ethers.utils.parseUnits('10', 'gwei') * 1.25;
  console.log("Gas Price:", gasPrice.toString());

  // Fetch the nonce
  const nonce1 = await ethers.provider.getTransactionCount(accounts[0], 'latest');

  // Deploy the Storverse contract first
  const Storverse = await ethers.getContractFactory("Storverse");
  const storverse = await Storverse.deploy({
    gasPrice: gasPrice,
    nonce: nonce1,
  });

  console.log("Storverse contract:", storverse.address);

  // Increment the nonce for the next transaction
  const nonce2 = nonce1 + 1;

  // Deploy the StorverseNFT contracts with the Storverse contract address as the minter
  const StorverseNFT = await ethers.getContractFactory("StorverseNFT");
  const verseNFTContract = await StorverseNFT.deploy("VerseNFT", "vNFT", "https://demo.storverse.app/verse/item", storverse.address, {
    gasPrice: gasPrice,
    nonce: nonce2,
  });

  console.log("VerseNFT contract:", verseNFTContract.address);

  // Increment the nonce for the next transaction
  const nonce3 = nonce2 + 1;

  const profileNFTContract = await StorverseNFT.deploy("ProfileNFT", "pNFT", "https://demo.storverse.app/profile/item", storverse.address, {
    gasPrice: gasPrice,
    nonce: nonce3,
  });

  console.log("ProfileNFT contract:", profileNFTContract.address);

  // Increment the nonce for the next transaction
  const nonce4 = nonce3 + 1;

  // Set the NFT contracts in the Storverse contract
  await storverse.setVerseNFTContract(verseNFTContract.address, {
    nonce: nonce4,
  });

  // Increment the nonce for the next transaction
  const nonce5 = nonce4 + 1;

  await storverse.setProfileNFTContract(profileNFTContract.address, {
    nonce: nonce5,
  });

  console.log("Set NFT contracts in Storverse contract");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
