const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying FundTracker contract...");

  const FundTracker = await hre.ethers.getContractFactory("FundTracker");
  const fundTracker = await FundTracker.deploy();
  await fundTracker.waitForDeployment();

  const address = await fundTracker.getAddress();
  console.log(`✅ FundTracker deployed to: ${address}`);

  // Read ABI from compiled artifact
  const artifact = await hre.artifacts.readArtifact("FundTracker");

  const deployed = {
    address,
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };

  // Write deployed.json for the backend service to consume
  const deployedPath = path.join(__dirname, "../deployed.json");
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log(`📄 deployed.json written to ${deployedPath}`);

  // Patch CONTRACT_ADDRESS in .env
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    envContent = envContent.replace(/^CONTRACT_ADDRESS=.*/m, `CONTRACT_ADDRESS=${address}`);
    fs.writeFileSync(envPath, envContent);
    console.log("🔑 .env updated with CONTRACT_ADDRESS");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
