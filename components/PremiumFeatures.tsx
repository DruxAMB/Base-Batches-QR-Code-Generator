"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { usePremiumNFT } from '@/hooks/usePremiumNFT';

export function PremiumFeatures() {
  const { 
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
  } = usePremiumNFT();

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
            onClick={openConnectModal}
            className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
          >
            Connect Wallet
          </Button>
        </div>
      ) : isWrongNetwork ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-amber-500 font-medium">Please switch to Base Sepolia network</p>
          <Button 
            onClick={handleMint} 
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Switch Network
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleMint} 
          disabled={isMinting}
          className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
        >
          {isMinting ? "Minting..." : `Mint Premium NFT (${mintPrice} ETH)`}
        </Button>
      )}
      
      {mintSuccess && (
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
