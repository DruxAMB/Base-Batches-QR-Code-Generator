"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { usePremiumNFT } from '@/hooks/usePremiumNFT';
import { useFarcasterWallet } from '@/hooks/useFarcasterWallet';
import { useNotification } from '@coinbase/onchainkit/minikit';

export function PremiumFeatures() {
  // Use both hooks - the original one for premium status and the Farcaster one for wallet interactions
  const { 
    isPremium, 
    expiryDate, 
    daysRemaining, 
    checkPremiumStatus
  } = usePremiumNFT();
  
  // Use the Farcaster wallet integration for minting
  const {
    isConnected,
    mintPremium,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    mintPrice: farcasterMintPrice,
    transactionHash
  } = useFarcasterWallet();
  
  const sendNotification = useNotification();
  
  // Show notifications for transaction status and update premium status
  useEffect(() => {
    if (isPending || isConfirming) {
      sendNotification({
        title: "Transaction Processing",
        body: "Your premium NFT is being minted"
      });
    }
    
    if (isConfirmed && transactionHash) {
      sendNotification({
        title: "Premium NFT Minted",
        body: "Your premium access is now active for 14 days"
      });
      
      // Refresh premium status immediately and then again after a delay
      // to ensure the blockchain state is properly reflected
      checkPremiumStatus();
      
      // Set up multiple checks to ensure we catch the updated state
      const checkIntervals = [1000, 3000, 6000, 10000]; // Check at 1s, 3s, 6s, and 10s
      
      checkIntervals.forEach(delay => {
        setTimeout(() => {
          console.log(`Checking premium status after ${delay}ms`);
          checkPremiumStatus();
        }, delay);
      });
    }
    
    if (error) {
      sendNotification({
        title: "Mint Failed",
        body: "There was an error minting your premium NFT"
      });
      console.error("Mint error:", error);
    }
  }, [isPending, isConfirming, isConfirmed, error, transactionHash, sendNotification, checkPremiumStatus]);
  
  // Force a refresh of premium status every 5 seconds when a transaction is confirmed
  // This ensures the UI updates even if there are caching issues
  useEffect(() => {
    if (isConfirmed && transactionHash) {
      const intervalId = setInterval(() => {
        console.log("Periodic premium status check");
        checkPremiumStatus();
      }, 5000);
      
      // Clean up the interval when component unmounts or transaction hash changes
      return () => clearInterval(intervalId);
    }
  }, [isConfirmed, transactionHash, checkPremiumStatus]);

  // Premium features UI
  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-4 border border-[var(--app-accent)] rounded-lg bg-[var(--app-background)] shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--app-accent)]">Premium Features</h3>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            {daysRemaining !== null && (
              <span>Premium expires in {daysRemaining} days</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-[var(--app-card-border)] rounded-md">
            <h4 className="font-medium mb-2">Custom Logo Upload</h4>
            <p className="text-sm text-[var(--app-foreground-muted)]">Add your own logo to QR codes</p>
            <Button variant="outline" size="sm" className="mt-2">
              Upload Logo
            </Button>
          </div>
          
          <div className="p-3 border border-[var(--app-card-border)] rounded-md">
            <h4 className="font-medium mb-2">Advanced Styling</h4>
            <p className="text-sm text-[var(--app-foreground-muted)]">Customize colors and shapes</p>
            <Button variant="outline" size="sm" className="mt-2">
              Customize
            </Button>
          </div>
          
          <div className="p-3 border border-[var(--app-card-border)] rounded-md">
            <h4 className="font-medium mb-2">Bulk Generation</h4>
            <p className="text-sm text-[var(--app-foreground-muted)]">Create multiple QR codes at once</p>
            <Button variant="outline" size="sm" className="mt-2">
              Bulk Create
            </Button>
          </div>
          
          <div className="p-3 border border-[var(--app-card-border)] rounded-md">
            <h4 className="font-medium mb-2">Analytics</h4>
            <p className="text-sm text-[var(--app-foreground-muted)]">Track QR code scans</p>
            <Button variant="outline" size="sm" className="mt-2">
              View Stats
            </Button>
          </div>
        </div>
        
        {expiryDate && (
          <div className="mt-4 text-xs text-center text-[var(--app-foreground-muted)]">
            Premium access expires on {expiryDate.toLocaleDateString()}
          </div>
        )}
      </motion.div>
    );
  }

  // Upsell UI if not premium
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 border border-[var(--app-card-border)] rounded-lg bg-[var(--app-background)] shadow-md text-center"
    >
      <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
      <p className="text-sm text-[var(--app-foreground-muted)] mb-4">
        Get advanced QR code features for 14 days by minting our premium NFT
      </p>
      
      {!isConnected ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm">Connect your wallet to get started</p>
          <Button 
            onClick={mintPremium} // This will trigger connect if not connected
            className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
          >
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm">
            {isPending || isConfirming ? "Minting in progress..." : 
             isConfirmed ? "Mint successful! Refreshing status..." : 
             `Mint price: ${farcasterMintPrice} ETH`}
          </p>
          {error && (
            <p className="text-xs text-red-500 max-w-xs">
              There was an error with your transaction. Please try again.
            </p>
          )}
          <Button 
            onClick={mintPremium}
            disabled={isPending || isConfirming}
            className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
          >
            {isPending ? "Minting..." : 
             isConfirming ? "Confirming..." :
             isConfirmed ? "Minted!" : 
             "Mint Premium NFT"}
          </Button>
          {transactionHash && (
            <a 
              href={`https://basescan.org/tx/${transactionHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              View transaction
            </a>
          )}
        </div>
      )}
      {isConfirmed && (
        <p className="text-green-500 mt-2 text-sm">
          Success! Your premium access is now active.
        </p>
      )}
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--app-foreground-muted)]">
        <div>✓ Custom Logo Upload</div>
        <div>✓ Advanced Styling</div>
        <div>✓ Bulk Generation</div>
        <div>✓ Analytics</div>
      </div>
    </motion.div>
  );
}
