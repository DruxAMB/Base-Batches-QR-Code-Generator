// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InstantQRPremium is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    uint256 public mintPrice = 0.002 ether; // Can be adjusted by owner
    uint256 public constant PREMIUM_DURATION = 14 days;
    
    // Map tokenId to mint timestamp
    mapping(uint256 => uint256) public mintTimestamp;
    
    // Custom enumeration mappings
    mapping(address => uint256[]) private _ownedTokens;
    mapping(uint256 => uint256) private _ownedTokensIndex;
    
    // Track all token ids
    uint256[] private _allTokens;
    
    // Events
    event PremiumMinted(address indexed to, uint256 tokenId, uint256 expiryTime);
    
    // Constructor with proper initialization
    constructor() ERC721("Instant QR Premium", "INQR") Ownable(msg.sender) {
        tokenCounter = 0;
    }
    
    // Override _burn to clean up token URI
    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }

    
    // Public mint function - anyone can mint by paying
    function mintPremium(string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Record mint timestamp
        mintTimestamp[newTokenId] = block.timestamp;
        
        // Add to owner's tokens for enumeration
        _ownedTokens[msg.sender].push(newTokenId);
        _ownedTokensIndex[newTokenId] = _ownedTokens[msg.sender].length - 1;
        
        // Add to all tokens
        _allTokens.push(newTokenId);
        
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
    
    // Override _transfer to update our custom enumeration
    function _transfer(address from, address to, uint256 tokenId) internal override {
        super._transfer(from, to, tokenId);
        
        // Remove from previous owner
        uint256 lastTokenIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];
        
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }
        
        _ownedTokens[from].pop();
        
        // Add to new owner
        _ownedTokens[to].push(tokenId);
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length - 1;
    }
    
    // Custom function to get token of owner by index
    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
        require(index < _ownedTokens[owner].length, "Index out of bounds");
        return _ownedTokens[owner][index];
    }
    
    // Get all tokens owned by an address
    function getTokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }
    
    // Find if user has any active premium tokens
    function hasActivePremium(address user) public view returns (bool) {
        uint256 tokenCount = balanceOf(user);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (isPremiumActive(tokenId)) {
                return true;
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
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (mintTimestamp[tokenId] > latestTimestamp) {
                latestTimestamp = mintTimestamp[tokenId];
                latestTokenId = tokenId;
            }
        }
        
        return mintTimestamp[latestTokenId] + PREMIUM_DURATION;
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
