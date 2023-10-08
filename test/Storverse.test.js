const { ethers } = require("hardhat");
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
chai.use(solidity);
const { expect } = chai;

async function getLatestBlockTimestamp() {
    const latestBlock = await ethers.provider.getBlock("latest");
    return latestBlock.timestamp;
}

describe("Storverse", function () {
    let storverse, verseNFTContract, profileNFTContract, accounts;

    beforeEach(async function () {
        accounts = await ethers.getSigners();

        const Storverse = await ethers.getContractFactory("Storverse");
        storverse = await Storverse.deploy();
        console.log("Storverse contract address:", storverse.address);

        const StorverseNFT = await ethers.getContractFactory("StorverseNFT");
        verseNFTContract = await StorverseNFT.deploy("VerseNFT", "vNFT", "https://demo.storverse.app/item", storverse.address);
        profileNFTContract = await StorverseNFT.deploy("ProfileNFT", "pNFT", "https://demo.storverse.app/item", storverse.address);

        await storverse.setVerseNFTContract(verseNFTContract.address);
        await storverse.setProfileNFTContract(profileNFTContract.address);
    });

    it("Should be able to mint Verse NFT", async function () {
        await storverse.connect(accounts[0]).mint("test_data", 1000, 1, 0);
        const tokenId = await verseNFTContract.totalSupply();
        expect(await verseNFTContract.ownerOf(tokenId)).to.equal(accounts[0].address);
    });

    it("Should be able to mint Profile NFT", async function () {
        await storverse.connect(accounts[0]).mint("test_data", 1000, 2, 0);
        const tokenId = await profileNFTContract.totalSupply();
        expect(await profileNFTContract.ownerOf(tokenId)).to.equal(accounts[0].address);
    });

    it("Should be able to buy Verse NFT", async function () {
        await storverse.connect(accounts[0]).mint("test_data", 1000, 1, 0);
        const tokenId = await verseNFTContract.totalSupply();
    
        const tx = await storverse.connect(accounts[1]).buy(1, tokenId, { value: 1000 });
        const receipt = await tx.wait();
        const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;
    
        await expect(tx)
            .to.emit(storverse, 'Bought')
            .withArgs(tokenId, accounts[1].address, 0, 1000, blockTimestamp, 1, 0);
    });
    
    it("Should be able to buy Profile NFT", async function () {
        await storverse.connect(accounts[0]).mint("test_data", 1000, 2, 0);
        const tokenId = await profileNFTContract.totalSupply();
    
        const currentTime = (await ethers.provider.getBlock()).timestamp;
        const expectedExpiry = currentTime + 30 * 24 * 60 * 60;
    
        const receipt = await (await storverse.connect(accounts[1]).buy(2, tokenId, { value: 1000 })).wait();
        const event = receipt.events?.find((event) => event.event === 'Bought');
    
        expect(event.args[6]).to.be.closeTo(expectedExpiry, 1); // expect a small difference due to block time variations
    });

    it("Should not be able to mint directly from the NFT contract", async function () {
        await expect(verseNFTContract.connect(accounts[1]).mintNFT(accounts[1].address)).to.be.revertedWith("Caller is not a minter");
        await expect(profileNFTContract.connect(accounts[1]).mintNFT(accounts[1].address)).to.be.revertedWith("Caller is not a minter");
    });

    it("Should be able to withdraw", async function () {
        // Mint a Verse NFT and let account 1 buy it
        await storverse.connect(accounts[0]).mint("test_data", 1000, 1, 0);
        const tokenId = await verseNFTContract.totalSupply();
        await storverse.connect(accounts[1]).buy(1, tokenId, { value: 1000 });
    
        // Confirm that the balance of account 0 has increased
        expect(await storverse.getBalance({ from: accounts[0].address })).to.equal(990); // 1000 - 10 (fee)
    
        // Perform the withdrawal
        const beforeBalance = await ethers.provider.getBalance(accounts[0].address);
        const tx = await storverse.connect(accounts[0]).withdraw();
        const gasUsed = (await tx.wait()).gasUsed;
        const gasPrice = tx.gasPrice;
        const afterBalance = await ethers.provider.getBalance(accounts[0].address);
        console.log("Gas used:", gasUsed.toString());
        console.log("Gas price:", gasPrice.toString());
        console.log("Before balance:", beforeBalance.toString());
        console.log("After balance:", afterBalance.toString());
    
        // Check that the withdrawal worked
        expect(await storverse.getBalance({ from: accounts[0].address })).to.equal(0);
        expect(afterBalance).to.equal(beforeBalance.sub(gasUsed.mul(gasPrice)).add(990)); // 990 ethers were withdrawn
    });
    
    it("Should fail to withdraw with insufficient balance", async function () {
        // Try to withdraw from an account with 0 balance
        await expect(storverse.connect(accounts[1]).withdraw()).to.be.revertedWith("Insufficient balance");
    });
    
    it("Should revert if non-owner tries to set the fee", async function () {
        const newFee = 2;

        // accounts[1] tries to set the fee, should fail because they're not the owner
        await expect(storverse.connect(accounts[1]).setFee(newFee)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("Should correctly set and apply the new fee", async function () {
        const newFee = 5; // 5%
        await storverse.connect(accounts[0]).setFee(newFee);
        expect(await storverse.getFee()).to.equal(newFee);
    
        // Mint a Verse NFT and let account 1 buy it
        await storverse.connect(accounts[0]).mint("test_data", 1000, 1, 0);
        const tokenId = await verseNFTContract.totalSupply();
        await storverse.connect(accounts[1]).buy(1, tokenId, { value: 1000 });
    
        // Confirm that the balance of account 0 has increased by 950
        expect(await storverse.getBalance({ from: accounts[0].address })).to.equal(950); // 1000 - 50 (new fee)
    });
    

});
