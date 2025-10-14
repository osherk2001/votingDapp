import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import * as fs from "fs";
import * as path from "path";

interface VoterProof {
  address: string;
  proof: string[];
}

interface MerkleOutput {
  root: string;
  voters: VoterProof[];
}

async function main(): Promise<void> {
  console.log("🌳 Generating Merkle tree for voter whitelist...\n");

  // Read whitelist from CSV or JSON
  const whitelistPath = path.join(process.cwd(), "data", "whitelist.json");
  
  if (!fs.existsSync(whitelistPath)) {
    console.log("📝 Creating example whitelist.json file...");
    
    // Create example with some test addresses
    const exampleWhitelist = [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat account #0
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account #1
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account #2
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat account #3
      "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Hardhat account #4
    ];

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(whitelistPath, JSON.stringify(exampleWhitelist, null, 2));
    console.log("✅ Created example whitelist.json at:", whitelistPath);
    console.log("   Please review and edit the file, then run this script again.\n");
    return;
  }

  // Read and parse whitelist
  const whitelistData = fs.readFileSync(whitelistPath, "utf-8");
  const addresses: string[] = JSON.parse(whitelistData);

  console.log(`📋 Found ${addresses.length} addresses in whitelist\n`);

  // Validate addresses
  const validatedAddresses: string[] = [];
  for (const addr of addresses) {
    try {
      const checksummed = ethers.getAddress(addr);
      validatedAddresses.push(checksummed);
    } catch (error) {
      console.warn(`⚠️  Skipping invalid address: ${addr}`);
    }
  }

  if (validatedAddresses.length === 0) {
    throw new Error("❌ No valid addresses found in whitelist");
  }

  console.log(`✅ Validated ${validatedAddresses.length} addresses\n`);

  // Create Merkle tree
  // IMPORTANT: Leaves must be keccak256(abi.encodePacked(lowercased address))
  const leaves = validatedAddresses.map((addr) =>
    ethers.keccak256(ethers.solidityPacked(["address"], [addr.toLowerCase()]))
  );

  const merkleTree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
  const root = merkleTree.getHexRoot();

  console.log("🌳 Merkle Root:", root);
  console.log(`📊 Tree depth: ${merkleTree.getDepth()}`);
  console.log(`🍃 Leaf count: ${merkleTree.getLeafCount()}\n`);

  // Generate proofs for each address
  const voterProofs: VoterProof[] = validatedAddresses.map((addr) => {
    const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [addr.toLowerCase()]));
    const proof = merkleTree.getHexProof(leaf);
    
    return {
      address: addr,
      proof,
    };
  });

  // Create output object
  const output: MerkleOutput = {
    root,
    voters: voterProofs,
  };

  // Save to file
  const outputPath = path.join(process.cwd(), "data", "merkle-proofs.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("✅ Merkle proofs saved to:", outputPath);
  
  // Display some sample proofs
  console.log("\n📋 Sample proofs (first 3 voters):");
  voterProofs.slice(0, 3).forEach((vp, idx) => {
    console.log(`\nVoter ${idx + 1}:`);
    console.log(`  Address: ${vp.address}`);
    console.log(`  Proof length: ${vp.proof.length}`);
    console.log(`  First proof element: ${vp.proof[0] || "N/A"}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("📋 MERKLE TREE SUMMARY");
  console.log("=".repeat(60));
  console.log("Root:          ", root);
  console.log("Total voters:  ", validatedAddresses.length);
  console.log("Output file:   ", outputPath);
  console.log("=".repeat(60));

  console.log("\n📝 Next step:");
  console.log("   Set this Merkle root in the Voting contract:");
  console.log(`   npx hardhat run scripts/setRoot.ts --network <network>`);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
