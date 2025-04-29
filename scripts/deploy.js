// Script to deploy the InstantQRPremium contract to Base
const hre = require("hardhat");

async function main() {
  console.log("Deploying InstantQRPremium contract...");

  // Get the contract factory
  const InstantQRPremium = await hre.ethers.getContractFactory("InstantQRPremium");
  
  // Deploy the contract
  const instantQRPremium = await InstantQRPremium.deploy();
  
  // Wait for deployment to finish
  await instantQRPremium.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await instantQRPremium.getAddress();
  
  console.log(`InstantQRPremium deployed to: ${contractAddress}`);
  console.log("Deployment transaction hash:", instantQRPremium.deploymentTransaction().hash);
  
  // Wait for 5 block confirmations for verification
  console.log("Waiting for 5 block confirmations...");
  await instantQRPremium.deploymentTransaction().wait(5);
  
  // Verify the contract on Etherscan/Basescan
  console.log("Verifying contract on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
