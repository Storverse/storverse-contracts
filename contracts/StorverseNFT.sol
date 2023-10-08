// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./interfaces/IStorverseNFT721Token.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StorverseNFT is ERC721, Ownable, IStorverseNFT721Token, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string private _base_uri;
    uint256 private _totalSupply;

    constructor(string memory name, string memory symbol, string memory _uri, address minterAddress) ERC721(name, symbol) {
        _base_uri = _uri;
        _totalSupply = 0;
        _setupRole(MINTER_ROLE, minterAddress);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _base_uri;
    }

    function setBaseURI(string memory _uri) external onlyOwner {
        _base_uri = _uri;
    }

    function grantMinterRole(address minterAddress) public onlyOwner {
        grantRole(MINTER_ROLE, minterAddress);
    }

    function revokeMinterRole(address minterAddress) public onlyOwner {
        revokeRole(MINTER_ROLE, minterAddress);
    }


    function ownerOf(uint256 tokenId) public view virtual override(ERC721, IStorverseNFT721Token) returns (address) {
        return super.ownerOf(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function mintNFT(address userAddress) public override returns (uint256) {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        _totalSupply += 1;
        _mint(userAddress, _totalSupply);
        return _totalSupply;
    }
}
