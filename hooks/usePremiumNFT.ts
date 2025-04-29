"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useConnect } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useNotification } from '@coinbase/onchainkit/minikit';

// Add window ethereum type
declare global {
  interface Window {
    ethereum: any;
  }
}

// This would be your deployed contract address
const CONTRACT_ADDRESS = "0xc41cFe0e5Aded5e2B4030D2EBc947D1BFA94461c"; 

// ABI for the functions we need
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiryTime","type":"uint256"}],"name":"PremiumMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"TokenTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"PREMIUM_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getExpiryTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"hasActivePremium","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isPremiumActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"tokenURI","type":"string"}],"name":"mintPremium","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mintTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPrice","type":"uint256"}],"name":"setMintPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// Mock data for development (until contract is deployed)
const MOCK_PREMIUM = false;
const MOCK_DAYS_REMAINING = 10;
const MOCK_EXPIRY_DATE = new Date(Date.now() + 1000 * 60 * 60 * 24 * MOCK_DAYS_REMAINING);

export function usePremiumNFT() {
  const [isPremium, setIsPremium] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [mintPrice, setMintPrice] = useState<string>("0.01");
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  // Use wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const sendNotification = useNotification();
  
  // Function to get contract instance
  const getContract = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      return provider.getSigner().then(signer => {
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      });
    } catch (error) {
      console.error("Error getting contract:", error);
      return null;
    }
  };
  
  // Get mint price from contract
  const fetchMintPrice = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      
      const price = await contract.mintPrice();
      setMintPrice(ethers.formatEther(price));
    } catch (error) {
      console.error("Error fetching mint price:", error);
    }
  };
  
  // Check premium status
  const checkPremiumStatus = async () => {
    if (!address) return;
    
    try {
      const contract = await getContract();
      if (!contract) return;
      
      // Check if user has active premium
      const hasPremium = await contract.hasActivePremium(address);
      setIsPremium(hasPremium);
      
      if (hasPremium) {
        // Get expiry time
        const expiryTimestamp = await contract.getExpiryTime(address);
        const expiryTimeMs = Number(expiryTimestamp) * 1000;
        const expiry = new Date(expiryTimeMs);
        setExpiryDate(expiry);
        
        // Calculate days remaining
        const now = Date.now();
        const remainingMs = expiryTimeMs - now;
        const days = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
        setDaysRemaining(days);
      } else {
        setExpiryDate(null);
        setDaysRemaining(null);
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    }
  };
  
  // Open connect modal function
  const openConnectModal = () => {
    // Find the first available connector (usually injected like MetaMask)
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };
  
  // Function to check if connected to Base Sepolia
  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) return false;
    
    const chainId = window.ethereum.chainId;
    console.log("Current chainId:", chainId);
    
    // Base Sepolia chainId is 0x14a34 (hex) or 84532 (decimal)
    if (chainId !== '0x14a34') {
      setIsWrongNetwork(true);
      
      try {
        // Request network switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a34' }],
        });
        
        setIsWrongNetwork(false);
        return true;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x14a34',
                  chainName: 'Base Sepolia',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://sepolia.base.org'],
                  blockExplorerUrls: ['https://sepolia.basescan.org'],
                },
              ],
            });
            
            setIsWrongNetwork(false);
            return true;
          } catch (addError) {
            console.error("Error adding network:", addError);
            return false;
          }
        }
        console.error("Error switching network:", switchError);
        return false;
      }
    }
    
    setIsWrongNetwork(false);
    return true;
  };
  
  // Handle mint with metadata
  const handleMint = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }
    
    // Check if on correct network first
    const isCorrectNetwork = await checkAndSwitchNetwork();
    if (!isCorrectNetwork) {
      sendNotification({
        title: "Wrong Network",
        body: "Please switch to Base Sepolia network to mint"
      });
      return;
    }
    
    setIsMinting(true);
    setMintSuccess(false);
    
    try {
      // Debug wallet info
      console.log("Wallet address:", address);
      console.log("Connected to network:", window.ethereum?.chainId);
      
      const contract = await getContract();
      if (!contract) throw new Error("Contract not available");
      
      console.log("Contract address:", CONTRACT_ADDRESS);
      
      // Simple metadata for the NFT
      const tokenURI = JSON.stringify({
        name: "Instant QR Premium Access",
        description: "This NFT grants premium access to Instant QR for 14 days",
        image: "https://instantqr.app/premium-nft.png"
      });
      
      try {
        // Check if contract exists
        const name = await contract.name();
        console.log("Contract name:", name);
        
        // Get mint price from contract
        const price = await contract.mintPrice();
        console.log("Mint price:", ethers.formatEther(price), "ETH");
        
        // Get wallet balance
        const provider = new ethers.BrowserProvider(window.ethereum);
        if (address) {
          const balance = await provider.getBalance(address);
          console.log("Wallet balance:", ethers.formatEther(balance), "ETH");
        }
        
        // Execute the mint transaction with explicit gas parameters
        console.log("Attempting to mint with value:", ethers.formatEther(price), "ETH");
        
        try {
          // Create transaction with explicit gas parameters
          const gasLimit = 500000; // Explicit gas limit
          console.log("Using gas limit:", gasLimit);
          
          // Call the contract method directly with gas parameters
          const tx = await contract.mintPremium(tokenURI, { 
            value: price,
            gasLimit: gasLimit
          });
          
          console.log("Transaction sent:", tx.hash);
          const receipt = await tx.wait();
          console.log("Transaction confirmed, gas used:", receipt.gasUsed.toString());
        } catch (txError: any) { // Use any type for error handling
          console.error("Transaction error details:", txError);
          // Try to extract more specific error information
          if (txError?.reason) console.error("Error reason:", txError.reason);
          if (txError?.code) console.error("Error code:", txError.code);
          if (txError?.error) console.error("Inner error:", txError.error);
          throw txError;
        }
      } catch (innerError) {
        console.error("Contract interaction error:", innerError);
        throw innerError;
      }
      
      // Transaction successful
      setMintSuccess(true);
      sendNotification({
        title: "Premium NFT Minted",
        body: "Your premium access is now active for 14 days"
      });
      
      // Refresh premium status
      await checkPremiumStatus();
      
      console.log("Minted premium NFT");
    } catch (error) {
      console.error("Mint error:", error);
      sendNotification({
        title: "Mint Failed",
        body: "There was an error minting your premium NFT"
      });
    } finally {
      setIsMinting(false);
    }
  };
  
  // Initialize when component mounts
  useEffect(() => {
    fetchMintPrice();
  }, []);
  
  // Check premium status when address changes
  useEffect(() => {
    if (isConnected && address) {
      checkPremiumStatus();
    } else {
      // Reset premium status when disconnected
      setIsPremium(false);
      setDaysRemaining(null);
      setExpiryDate(null);
    }
  }, [address, isConnected]);

  // Check network when component mounts or when connected
  useEffect(() => {
    if (isConnected) {
      checkAndSwitchNetwork();
    }
  }, [isConnected]);

  return {
    isConnected,
    isPremium,
    expiryDate,
    daysRemaining,
    mintPrice,
    handleMint,
    isMinting,
    mintSuccess,
    openConnectModal,
    isWrongNetwork
  };
}
