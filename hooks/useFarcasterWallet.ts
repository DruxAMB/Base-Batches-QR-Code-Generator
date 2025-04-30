import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useReadContract } from 'wagmi'
import { parseEther } from 'viem'

// This hook provides a simplified interface for using the Farcaster wallet with wagmi
export function useFarcasterWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  
  // Contract details
  const contractAddress = "0xfd4370B24139b299E54bEBeff730819b1fBb0D59"
  const mintPremiumAbi = {
    name: 'mintPremium',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'tokenURI', type: 'string' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
  
  const mintPriceAbi = {
    name: 'mintPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
  
  // Read the mint price from the contract
  const { data: mintPrice } = useReadContract({
    address: contractAddress,
    abi: [mintPriceAbi],
    functionName: 'mintPrice',
  }) as { data: bigint | undefined }
  
  // Write contract hook for minting
  const { data: hash, isPending, error, writeContract } = useWriteContract()
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })
  
  // Function to mint the premium NFT
  const mintPremium = async () => {
    if (!isConnected) {
      // Connect wallet first
      connect({ connector: connectors[0] })
      return
    }
    
    try {
      // Use empty string to use the default token URI from the contract
      const tokenURI = ""
      
      // Get mint price (fallback to 0.001 ETH if not available)
      const price = mintPrice || parseEther('0.001')
      
      // Execute the mint transaction
      writeContract({
        address: contractAddress,
        abi: [mintPremiumAbi],
        functionName: 'mintPremium',
        args: [tokenURI],
        value: price,
      })
    } catch (error) {
      console.error("Error minting:", error)
    }
  }
  
  return {
    address,
    isConnected,
    mintPremium,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    mintPrice: mintPrice ? (Number(mintPrice) / 10**18).toString() : '0.001',
    transactionHash: hash
  }
}
