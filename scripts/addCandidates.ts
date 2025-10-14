import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface Candidate {
  name: string;
  positions: [number, number, number];
}

async function main(): Promise<void> {
  console.log("👥 Adding candidates to Voting contract...\n");

  const votingAddress = process.env.VOTING_ADDRESS;
  if (!votingAddress) {
    throw new Error("❌ Missing VOTING_ADDRESS in .env file");
  }

  console.log("📍 Voting address:", votingAddress);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // Get Voting contract
  const voting = await ethers.getContractAt("Voting", votingAddress);

  // Read candidates from JSON file
  const candidatesPath = path.join(process.cwd(), "data", "candidates.json");
  
  if (!fs.existsSync(candidatesPath)) {
    console.log("\n📝 Creating example candidates.json file...");
    const exampleCandidates: Candidate[] = [
      {
        name: "Alice Johnson",
        positions: [30, 60, 90], // Economy: 30, Healthcare: 60, Environment: 90
      },
      {
        name: "Bob Smith",
        positions: [70, 40, 20], // Economy: 70, Healthcare: 40, Environment: 20
      },
      {
        name: "Carol Williams",
        positions: [50, 80, 50], // Economy: 50, Healthcare: 80, Environment: 50
      },
    ];

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(candidatesPath, JSON.stringify(exampleCandidates, null, 2));
    console.log("✅ Created example candidates.json at:", candidatesPath);
    console.log("   Please review and edit the file, then run this script again.");
    return;
  }

  const candidatesData = fs.readFileSync(candidatesPath, "utf-8");
  const candidates: Candidate[] = JSON.parse(candidatesData);

  console.log(`\n📋 Found ${candidates.length} candidates in candidates.json\n`);

  // Add each candidate
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    console.log(`Adding candidate ${i + 1}/${candidates.length}:`);
    console.log(`  Name: ${candidate.name}`);
    console.log(`  Positions: [${candidate.positions.join(", ")}]`);

    // Validate positions
    if (candidate.positions.length !== 3) {
      throw new Error(`❌ Candidate ${candidate.name} must have exactly 3 positions`);
    }
    for (const pos of candidate.positions) {
      if (pos < 0 || pos > 100) {
        throw new Error(`❌ Candidate ${candidate.name} has invalid position value: ${pos}`);
      }
    }

    const tx = await voting.addCandidate(candidate.name, candidate.positions);
    console.log(`  ⏳ Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    
    // Find CandidateAdded event
    const event = receipt?.logs.find(
      (log) => log.topics[0] === voting.interface.getEvent("CandidateAdded")?.topicHash
    );
    
    if (event) {
      const parsedEvent = voting.interface.parseLog({
        topics: [...event.topics],
        data: event.data,
      });
      console.log(`  ✅ Candidate added with ID: ${parsedEvent?.args[0]}\n`);
    }
  }

  // Get current candidate count
  const candidateCount = await voting.candidateCount();
  console.log("=".repeat(60));
  console.log(`✅ Successfully added ${candidates.length} candidates`);
  console.log(`📊 Total candidates in contract: ${candidateCount}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
