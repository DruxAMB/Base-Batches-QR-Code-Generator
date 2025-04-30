// Script to deploy the InstantQRPremium contract to Base mainnet
const hre = require("hardhat");

async function main() {
  console.log("Deploying InstantQRPremium to Base mainnet...");

  // Get the contract factory
  const InstantQRPremium = await hre.ethers.getContractFactory("InstantQRPremium");
  
  // Deploy the contract
  const premium = await InstantQRPremium.deploy();
  
  // Wait for deployment to complete
  await premium.waitForDeployment();
  
  // Get the contract address
  const address = await premium.getAddress();
  
  console.log(`InstantQRPremium deployed to: ${address}`);
  console.log("Mint price set to: 0.001 ETH");
  console.log("Premium duration: 14 days");
  
  console.log("\nVerification command:");
  console.log(`npx hardhat verify --network base ${address}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
