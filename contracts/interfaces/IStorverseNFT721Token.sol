// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

interface IStorverseNFT721Token {
    function mintNFT(address userAddress) external returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}
