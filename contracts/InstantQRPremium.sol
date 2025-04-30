// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InstantQRPremium is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    uint256 public mintPrice = 0.01 ether; // Can be adjusted by owner
    uint256 public constant PREMIUM_DURATION = 14 days;
    
    // Default token URI with the provided image
    string public defaultTokenURI = "https://peach-obvious-bobcat-804.mypinata.cloud/ipfs/bafkreiddgvuv6axhgcb5mfe3m5bbk2n2e3jlc6a4zvt4lusl4ops2nupny";
    
    // Map tokenId to mint timestamp
    mapping(uint256 => uint256) public mintTimestamp;
    
    // Events
    event PremiumMinted(address indexed to, uint256 tokenId, uint256 expiryTime);
    event TokenTransferred(address indexed from, address indexed to, uint256 tokenId);
    
    // Constructor with proper initialization
    constructor() ERC721("Instant QR Premium", "INQR") Ownable(msg.sender) {
        tokenCounter = 0;
    }
    
    // Public mint function - anyone can mint by paying
    function mintPremium(string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        
        // Use provided tokenURI if not empty, otherwise use default
        string memory finalURI = bytes(tokenURI).length > 0 ? tokenURI : defaultTokenURI;
        _setTokenURI(newTokenId, finalURI);
        
        // Record mint timestamp
        mintTimestamp[newTokenId] = block.timestamp;
        
        // Increment counter
        tokenCounter++;
        
        emit PremiumMinted(msg.sender, newTokenId, block.timestamp + PREMIUM_DURATION);
        
        return newTokenId;
    }
    
    // Check if a specific token is still active (not expired)
    function isPremiumActive(uint256 tokenId) public view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            // Token exists if ownerOf doesn't revert
            return block.timestamp < mintTimestamp[tokenId] + PREMIUM_DURATION;
        } catch {
            // Token doesn't exist
            return false;
        }
    }
    
    // Find if user has any active premium tokens
    function hasActivePremium(address user) public view returns (bool) {
        uint256 tokenCount = balanceOf(user);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            try this.tokenOfOwnerByIndex(user, i) returns (uint256 tokenId) {
                if (isPremiumActive(tokenId)) {
                    return true;
                }
            } catch {
                continue;
            }
        }
        
        return false;
    }
    
    // Get expiry time of the most recently minted token for a user
    function getExpiryTime(address user) public view returns (uint256) {
        uint256 tokenCount = balanceOf(user);
        if (tokenCount == 0) return 0;
        
        uint256 latestTokenId = 0;
        uint256 latestTimestamp = 0;
        
        for (uint256 i = 0; i < tokenCount; i++) {
            try this.tokenOfOwnerByIndex(user, i) returns (uint256 tokenId) {
                if (mintTimestamp[tokenId] > latestTimestamp) {
                    latestTimestamp = mintTimestamp[tokenId];
                    latestTokenId = tokenId;
                }
            } catch {
                continue;
            }
        }
        
        return mintTimestamp[latestTokenId] + PREMIUM_DURATION;
    }
    
    // Use OpenZeppelin's built-in tokenOfOwnerByIndex
    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
        require(index < balanceOf(owner), "ERC721Enumerable: owner index out of bounds");
        uint256 count = 0;
        for (uint256 i = 0; i < tokenCounter; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                if (count == index) return i;
                count++;
            }
        }
        revert("ERC721Enumerable: owner index out of bounds");
    }
    
    // Helper function to check if a token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
    
    // Owner can update mint price
    function setMintPrice(uint256 _newPrice) public onlyOwner {
        mintPrice = _newPrice;
    }
    
    // Owner can withdraw funds
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}
