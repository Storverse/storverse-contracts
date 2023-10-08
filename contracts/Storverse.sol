// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IStorverseNFT721Token.sol";
import "./StorverseNFT.sol";

contract Storverse is Ownable, ReentrancyGuard {

    using SafeMath for uint256;
    using Address for address;

    IStorverseNFT721Token public verseNFTContract;
    IStorverseNFT721Token public profileNFTContract;
    uint256 public orderIdx= 0;
    uint256 public followIdx = 0;
    uint256 public fee = 1;
    uint256 public totalFee = 0;
    mapping(uint256 => ProfileListing) public profileListings;
    mapping(uint256 => VerseListing) public verseListings;
    mapping(address => mapping(uint256 => mapping(address => BuyerData))) public buyers;

    mapping(address => uint256) public balances;

    struct ProfileListing {
        uint256 price;
        uint256 duration;
        uint256 mintingTime;
        uint256 lastPriceChangeTime;
    }

    struct VerseListing {
        uint256 price;
        uint256 mintingTime;
    }

    struct BuyerData {
        bool bought;
        uint256 expireTime;
    }

    struct Order {
        uint256 tokenId;
        address buyer;
        address seller;
        uint256 price;
        uint256 status;
        uint256 fee;
        uint256 itemType;
        uint256 expireTime;
    }

    mapping(uint256 => Order) public orders;

    event BalanceUpdated(address indexed owner, uint256 balance);
    event Bought(uint256 indexed tokenId, address indexed buyer, uint256 indexed orderId, uint256 price, uint256 timestamp, uint256 itemType, uint256 expireTime);
    event ListingItem(uint256 indexed tokenId, string dataId, uint256 price, uint256 itemType, uint256 timestamp);
    event ChangePrice(uint256 indexed tokenId, uint256 price, uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount, uint256 timestamp);
    event Finish(uint256 indexed orderId, uint256 timestamp);

    function setVerseNFTContract(IStorverseNFT721Token _verseNFTContract) external onlyOwner {
        verseNFTContract = _verseNFTContract;
    }

    function setProfileNFTContract(IStorverseNFT721Token _profileNFTContract) external onlyOwner {
        profileNFTContract = _profileNFTContract;
    }

    function mint(string memory data_id, uint256 price, uint256 itemType, uint256 duration) external {
        require(price > 0, "Price must be larger than 0");

        if (itemType != 1 && itemType != 2) {
            itemType = 1;
        }
        if (duration == 0 || duration == 1) {
            duration = 30 days;
        } else {
            if (duration > 6) {
                duration = 180 days;
            } else {
                duration = 30 days * duration;
            }
        }
        uint256 newItemId;

        if (itemType == 1) {
            newItemId = verseNFTContract.mintNFT(msg.sender);
            verseListings[newItemId] = VerseListing(price, block.timestamp);
        } else if (itemType == 2) {
            newItemId = profileNFTContract.mintNFT(msg.sender);
            profileListings[newItemId] = ProfileListing(price, duration, block.timestamp, block.timestamp);
        }
        emit ListingItem(newItemId, data_id, price, itemType, block.timestamp);
    }
    
    function changePrice(uint256 tokenId, uint256 newPrice) external {
        require(profileNFTContract.ownerOf(tokenId) == msg.sender, "Not your NFT");
        require(block.timestamp > profileListings[tokenId].lastPriceChangeTime + 30 days, "Wait for 30 days after minting or the last price change to update the price");
        profileListings[tokenId].price = newPrice;
        profileListings[tokenId].lastPriceChangeTime = block.timestamp;
        emit ChangePrice(tokenId, newPrice, block.timestamp);
    }

    function buy(uint256 itemType, uint256 tokenId) external payable {
        require(itemType == 1 || itemType == 2, "Invalid itemType");
        IStorverseNFT721Token nftContract = itemType == 1 ? verseNFTContract : profileNFTContract;
        require(nftContract.ownerOf(tokenId) != address(0), "Token does not exist");

        uint256 price = itemType == 1 ? verseListings[tokenId].price : profileListings[tokenId].price;
        require(price > 0, "Not listed");
        require(msg.value >= price, "Payment error");

        if (itemType == 2) {
            require(block.timestamp > buyers[address(nftContract)][tokenId][msg.sender].expireTime, "Not expired");
        }
        require(buyers[address(nftContract)][tokenId][msg.sender].bought == false, "Already bought");
        
        uint256 saleFee = price.mul(fee).mul(100).div(10000);
        address owner = nftContract.ownerOf(tokenId);

        Order memory order;
        order.tokenId = tokenId;
        order.buyer = msg.sender;
        order.seller = owner;
        order.price = price;
        order.fee = saleFee;
        order.status = 1;
        order.itemType = itemType;

        if (itemType == 2) {
            order.expireTime = block.timestamp + profileListings[tokenId].duration;
            buyers[address(nftContract)][tokenId][msg.sender].expireTime = order.expireTime;
        }

        orders[orderIdx] = order;
        balances[owner] += order.price.sub(order.fee);

        emit BalanceUpdated(owner, balances[owner]);
        emit Bought(tokenId, msg.sender, orderIdx, msg.value, block.timestamp, itemType, order.expireTime);

        buyers[address(nftContract)][tokenId][msg.sender].bought = true;
        orderIdx++;
    }

    function finish(uint256 orderId) external onlyOwner {
        Order memory order = orders[orderId];
        require(order.status == 1, "error order status");

        totalFee += order.fee;
        delete orders[orderId];
        emit Finish(orderId, block.timestamp);
    }

    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    function withdraw() external nonReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "Insufficient balance");
        balances[msg.sender] = 0;
        Address.sendValue(payable(msg.sender), balance);
        emit Withdraw(msg.sender, balance, block.timestamp);
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

   function getFee() public view returns (uint256) {
        return fee;
    }
}