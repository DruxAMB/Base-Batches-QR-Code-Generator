require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

// Load environment variables if present
require("dotenv").config({ path: ".env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    // Base Sepolia testnet
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 84532,
      gasPrice: 1000000000, // 1 gwei
    },
    // Base mainnet
    base: {
      // Public RPC URL that doesn't require API key
      url: "https://base.publicnode.com",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000, // 60 seconds timeout for network requests
    },
    // Local hardhat network
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: BASESCAN_API_KEY,
      base: BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
