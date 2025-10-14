import { ethers } from "hardhat";

async function main(): Promise<void> {
  console.log("🔑 Granting MINTER_ROLE to Voting contract...\n");

  // Get deployed contract addresses from environment or command line
  const balTokenAddress = process.env.BAL_TOKEN_ADDRESS;
  const votingAddress = process.env.VOTING_ADDRESS;

  if (!balTokenAddress || !votingAddress) {
    throw new Error(
      "❌ Missing contract addresses. Please set BAL_TOKEN_ADDRESS and VOTING_ADDRESS in .env file"
    );
  }

  console.log("📍 BALToken address:", balTokenAddress);
  console.log("📍 Voting address:  ", votingAddress);

  const [deployer] = await ethers.getSigners();
  console.log("\n👤 Using account:", deployer.address);

  // Get BALToken contract
  const balToken = await ethers.getContractAt("BALToken", balTokenAddress);

  // Get MINTER_ROLE hash
  const MINTER_ROLE = await balToken.MINTER_ROLE();
  console.log("\n🔐 MINTER_ROLE:", MINTER_ROLE);

  // Check if already granted
  const hasRole = await balToken.hasRole(MINTER_ROLE, votingAddress);
  if (hasRole) {
    console.log("✅ Voting contract already has MINTER_ROLE");
    return;
  }

  // Grant MINTER_ROLE
  console.log("\n📝 Granting MINTER_ROLE to Voting contract...");
  const tx = await balToken.grantRole(MINTER_ROLE, votingAddress);
  console.log("⏳ Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ MINTER_ROLE granted successfully!");

  // Verify
  const hasRoleAfter = await balToken.hasRole(MINTER_ROLE, votingAddress);
  if (hasRoleAfter) {
    console.log("\n✅ Verification: Voting contract now has MINTER_ROLE");
  } else {
    throw new Error("❌ Verification failed: Role not granted");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
