import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface MerkleOutput {
  root: string;
  voters: Array<{ address: string; proof: string[] }>;
}

async function main(): Promise<void> {
  console.log("🌳 Setting voter Merkle root in Voting contract...\n");

  const votingAddress = process.env.VOTING_ADDRESS;
  if (!votingAddress) {
    throw new Error("❌ Missing VOTING_ADDRESS in .env file");
  }

  console.log("📍 Voting address:", votingAddress);

  // Read Merkle root from generated file
  const merkleProofsPath = path.join(process.cwd(), "data", "merkle-proofs.json");
  
  if (!fs.existsSync(merkleProofsPath)) {
    throw new Error(
      `❌ Merkle proofs file not found at: ${merkleProofsPath}\n` +
      "   Please run: npx hardhat run scripts/merkle/generate.ts"
    );
  }

  const merkleData = fs.readFileSync(merkleProofsPath, "utf-8");
  const merkleOutput: MerkleOutput = JSON.parse(merkleData);

  const root = merkleOutput.root;
  console.log("🌳 Merkle Root from file:", root);
  console.log(`📊 Total voters: ${merkleOutput.voters.length}\n`);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // Get Voting contract
  const voting = await ethers.getContractAt("Voting", votingAddress);

  // Check current root
  const currentRoot = await voting.voterRoot();
  console.log("\n🔍 Current root in contract:", currentRoot);

  if (currentRoot === root) {
    console.log("✅ Merkle root already set to the correct value");
    return;
  }

  // Set new root
  console.log("\n📝 Setting new Merkle root...");
  const tx = await voting.setVoterMerkleRoot(root);
  console.log("⏳ Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Merkle root set successfully!");

  // Verify
  const newRoot = await voting.voterRoot();
  if (newRoot === root) {
    console.log("\n✅ Verification: Root set correctly");
    console.log(`   ${merkleOutput.voters.length} voters are now whitelisted`);
  } else {
    throw new Error("❌ Verification failed: Root not set correctly");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ MERKLE ROOT SET SUCCESSFULLY");
  console.log("=".repeat(60));
  console.log("Root:         ", root);
  console.log("Total voters: ", merkleOutput.voters.length);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
