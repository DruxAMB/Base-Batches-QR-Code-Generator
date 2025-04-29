"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useConnect } from 'wagmi';
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
const CONTRACT_ABI = [
  "function mintPremium(string memory tokenURI) public payable returns (uint256)",
  "function isPremiumActive(uint256 tokenId) public view returns (bool)",
  "function hasActivePremium(address user) public view returns (bool)",
  "function getExpiryTime(address user) public view returns (uint256)",
  "function mintPrice() public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event PremiumMinted(address indexed to, uint256 tokenId, uint256 expiryTime)"
];

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
  
  // Use wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const sendNotification = useNotification();
  
  // Function to get contract instance
  const getContract = () => {
    console.log("getContract called");
    if (typeof window === 'undefined') {
      console.log("Window is undefined");
      return null;
    }
    
    try {
      console.log("Checking window.ethereum:", !!window.ethereum);
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider created");
      return provider.getSigner().then(signer => {
        console.log("Signer obtained");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        console.log("Contract created");
        return contract;
      }).catch(err => {
        console.error("Error getting signer:", err);
        return null;
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
  
  // State for error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle mint with metadata
  const handleMint = async () => {
    console.log("handleMint called", { isConnected, address });
    if (!isConnected) {
      console.log("Not connected, opening connect modal");
      openConnectModal();
      return;
    }
    
    // Reset states
    console.log("Setting minting state");
    setIsMinting(true);
    setMintSuccess(false);
    setErrorMessage(null);
    
    try {
      console.log("Getting contract...");
      const contract = await getContract();
      console.log("Contract instance:", !!contract);
      if (!contract) {
        throw new Error("Unable to connect to wallet. Please make sure your wallet is unlocked and connected to the Base network.");
      }
      
      // Simple metadata for the NFT
      const tokenURI = JSON.stringify({
        name: "Instant QR Premium Access",
        description: "This NFT grants premium access to Instant QR for 14 days",
        image: "https://instantqr.app/premium-nft.png"
      });
      
      // Get mint price from contract
      const price = await contract.mintPrice();
      
      // Check user's balance before minting
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const balance = await provider.getBalance(await signer.getAddress());
        
        // Check if user has enough ETH (price + estimated gas)
        const estimatedGas = ethers.parseEther("0.002"); // Rough estimate for gas
        if (balance < (price + estimatedGas)) {
          throw new Error("Insufficient funds. Please add more ETH to your wallet to cover the mint price and gas fees.");
        }
      } catch (balanceError: any) {
        if (balanceError.message.includes("Insufficient funds")) {
          throw balanceError;
        }
        // If it's another error checking balance, continue with the mint attempt
        console.warn("Error checking balance:", balanceError);
      }
      
      // Execute the mint transaction
      try {
        const tx = await contract.mintPremium(tokenURI, { value: price });
        console.log("Transaction sent:", tx.hash);
        
        // Show pending notification
        sendNotification({
          title: "Transaction Pending",
          body: "Your mint transaction is being processed..."
        });
        
        await tx.wait();
        
        // Transaction successful
        setMintSuccess(true);
        sendNotification({
          title: "Premium NFT Minted",
          body: "Your premium access is now active for 14 days"
        });
        
        // Refresh premium status
        await checkPremiumStatus();
        
        console.log("Minted premium NFT");
      } catch (txError: any) {
        // Handle transaction errors
        if (txError.code === "ACTION_REJECTED") {
          throw new Error("Transaction was rejected. Please try again.");
        } else if (txError.message.includes("insufficient funds")) {
          throw new Error("Insufficient funds for gas. Please add more ETH to your wallet.");
        } else {
          throw txError;
        }
      }
    } catch (error: any) {
      console.error("Mint error:", error);
      
      // Set user-friendly error message
      let userMessage = "There was an error minting your premium NFT. Please try again.";
      
      if (error.message) {
        if (error.message.includes("Insufficient funds")) {
          userMessage = "Insufficient funds. Please add more ETH to your wallet to proceed.";
        } else if (error.message.includes("user rejected") || error.message.includes("ACTION_REJECTED")) {
          userMessage = "Transaction was cancelled. Please try again when you're ready.";
        } else if (error.message.includes("gas")) {
          userMessage = "Not enough ETH for gas fees. Please add more ETH to your wallet.";
        } else if (error.message.includes("network") || error.message.includes("chain")) {
          userMessage = "Please make sure your wallet is connected to the Base network.";
        } else if (error.message.includes("nonce")) {
          userMessage = "Transaction error. Please reset your wallet or try again later.";
        }
      }
      
      setErrorMessage(userMessage);
      
      sendNotification({
        title: "Mint Failed",
        body: userMessage
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
    errorMessage
  };
}
