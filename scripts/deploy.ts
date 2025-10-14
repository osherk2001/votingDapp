import { ethers } from "hardhat";

async function main(): Promise<void> {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy BALToken
  console.log("📝 Deploying BALToken...");
  const BALTokenFactory = await ethers.getContractFactory("BALToken");
  const balToken = await BALTokenFactory.deploy("BAL Token", "BAL");
  await balToken.waitForDeployment();
  const balTokenAddress = await balToken.getAddress();
  console.log("✅ BALToken deployed to:", balTokenAddress);

  // Deploy Voting contract with reward per vote (10 BAL tokens)
  const rewardPerVote = ethers.parseEther("10");
  console.log("\n📝 Deploying Voting contract...");
  console.log("   Reward per vote:", ethers.formatEther(rewardPerVote), "BAL");
  
  const VotingFactory = await ethers.getContractFactory("Voting");
  const voting = await VotingFactory.deploy(balTokenAddress, rewardPerVote);
  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();
  console.log("✅ Voting contract deployed to:", votingAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("BALToken address:    ", balTokenAddress);
  console.log("Voting address:      ", votingAddress);
  console.log("Deployer address:    ", deployer.address);
  console.log("Reward per vote:     ", ethers.formatEther(rewardPerVote), "BAL");
  console.log("=".repeat(60));

  console.log("\n📝 Next steps:");
  console.log("1. Grant MINTER_ROLE to Voting contract:");
  console.log(`   npx hardhat run scripts/grantMinter.ts --network <network>`);
  console.log("2. Add candidates:");
  console.log(`   npx hardhat run scripts/addCandidates.ts --network <network>`);
  console.log("3. Generate Merkle root for voters:");
  console.log(`   npx hardhat run scripts/merkle/generate.ts`);
  console.log("4. Set voter Merkle root:");
  console.log(`   npx hardhat run scripts/setRoot.ts --network <network>`);
  console.log("5. Start election:");
  console.log(`   npx hardhat run scripts/startElection.ts --network <network>`);

  console.log("\n💾 Save these addresses to your .env file:");
  console.log(`BAL_TOKEN_ADDRESS=${balTokenAddress}`);
  console.log(`VOTING_ADDRESS=${votingAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
