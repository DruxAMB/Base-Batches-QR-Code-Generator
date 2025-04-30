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
const CONTRACT_ADDRESS = "0xfd4370B24139b299E54bEBeff730819b1fBb0D59"; 

// ABI for the functions we need
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiryTime","type":"uint256"}],"name":"PremiumMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"TokenTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"PREMIUM_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getExpiryTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"hasActivePremium","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isPremiumActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"tokenURI","type":"string"}],"name":"mintPremium","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mintTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPrice","type":"uint256"}],"name":"setMintPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

export function usePremiumNFT() {
  const [isPremium, setIsPremium] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [mintPrice, setMintPrice] = useState<string>("0.001"); // Updated to match mainnet contract
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  // Use wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const sendNotification = useNotification();
  
  // Function to get contract instance using wagmi hooks
  const getContract = async () => {
    if (!isConnected || !address) return null;
    
    try {
      // Use wagmi's hooks to get the provider and signer
      // This works better in Warpcast environment than direct window.ethereum access
      const { ethereum } = window as any;
      
      if (!ethereum) {
        console.error("No ethereum object found");
        return null;
      }
      
      const provider = new ethers.BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      
      // Base mainnet chainId is 8453 (0x2105)
      if (chainId.toString() !== '8453') {
        console.log(`Wrong network detected: ${chainId}. Expected: 8453 (Base mainnet)`);
        setIsWrongNetwork(true);
        return null;
      }
      
      setIsWrongNetwork(false);
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    } catch (error) {
      console.error("Error getting contract:", error);
      return null;
    }
  };
  
  // Get mint price from contract
  const fetchMintPrice = async () => {
    try {
      // Use a read-only provider first to avoid wallet connection issues
      // Try multiple endpoints in case one fails
      let provider;
      try {
        provider = new ethers.JsonRpcProvider('https://base-rpc.publicnode.com');
      } catch (e) {
        // Fallback to main RPC if the first one fails
        provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      }
      
      const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Fetch the mint price
      const price = await readOnlyContract.mintPrice();
      setMintPrice(ethers.formatEther(price));
      console.log('Mint price fetched:', ethers.formatEther(price));
    } catch (error) {
      console.error("Error fetching mint price:", error);
      // Set default mint price from contract
      setMintPrice("0.001");
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
  
  // Function to check if connected to Base mainnet
  // For Warpcast, we assume the user is on Base mainnet since that's what Warpcast supports
  const checkAndSwitchNetwork = async () => {
    if (!isConnected) return false;
    
    try {
      // When using the Farcaster frame connector with Warpcast,
      // the user should already be on Base mainnet
      // We'll just verify this to be safe
      const { ethereum } = window as any;
      
      if (!ethereum) {
        console.log("No ethereum object found - using Warpcast wallet");
        // For Warpcast, we assume we're on Base mainnet
        setIsWrongNetwork(false);
        return true;
      }
      
      // If we have ethereum object, double-check the chain
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        
        // Base mainnet chainId is 8453 (0x2105)
        if (chainId.toString() !== '8453') {
          console.log(`Wrong network detected: ${chainId}. Expected: 8453 (Base mainnet)`);
          setIsWrongNetwork(true);
          
          // For Warpcast users, this shouldn't happen, but just in case
          sendNotification({
            title: "Network Issue",
            body: "This app requires Base mainnet"
          });
          
          return false;
        }
      } catch (e) {
        // If we can't check the network, assume we're on Base with Warpcast
        console.log("Could not check network - assuming Warpcast on Base");
      }
      
      setIsWrongNetwork(false);
      return true;
    } catch (error) {
      console.error("Error checking network:", error);
      // For Warpcast, we'll assume we're on the right network
      setIsWrongNetwork(false);
      return true;
    }
  };
  
  // Handle mint with metadata
  const handleMint = async () => {
    if (!isConnected) {
      // Connect wallet first
      const connector = connectors[0];
      connect({ connector });
      sendNotification({
        title: "Connect Wallet",
        body: "Please connect your wallet to mint a premium NFT"
      });
      return;
    }
    
    setIsMinting(true);
    setMintSuccess(false);
    
    try {
      // Check if we're on the right network using our improved function
      const isCorrectNetwork = await checkAndSwitchNetwork();
      
      if (!isCorrectNetwork) {
        setIsMinting(false);
        return;
      }
      
      // Get contract with fresh connection after network check
      const contract = await getContract();
      if (!contract) {
        throw new Error("Contract not available. Please ensure you're connected to Base mainnet.");
      }
      
      console.log("Contract address:", CONTRACT_ADDRESS);
      
      // Use empty string to use the default token URI from the contract
      const tokenURI = "";
      
      // Get mint price from contract
      let price;
      try {
        price = await contract.mintPrice();
        console.log("Mint price:", ethers.formatEther(price), "ETH");
      } catch (priceError) {
        console.error("Error fetching mint price:", priceError);
        // Use default price if contract call fails
        price = ethers.parseEther("0.001");
        console.log("Using default mint price:", ethers.formatEther(price), "ETH");
      }
      
      // Execute the mint transaction with explicit gas parameters
      const tx = await contract.mintPremium(tokenURI, {
        value: price,
        gasLimit: 500000
      });
      
      console.log("Transaction sent:", tx.hash);
      sendNotification({
        title: "Transaction Sent",
        body: "Your premium NFT is being minted"
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Update premium status
      setMintSuccess(true);
      
      // Send success notification
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