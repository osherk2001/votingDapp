import { ethers } from "hardhat";

async function main(): Promise<void> {
  console.log("🗳️  Starting election...\n");

  const votingAddress = process.env.VOTING_ADDRESS;
  if (!votingAddress) {
    throw new Error("❌ Missing VOTING_ADDRESS in .env file");
  }

  console.log("📍 Voting address:", votingAddress);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // Get Voting contract
  const voting = await ethers.getContractAt("Voting", votingAddress);

  // Get start and end times from environment or use defaults
  // Format: ISO 8601 date strings or Unix timestamps
  const startInput = process.env.ELECTION_START || "";
  const endInput = process.env.ELECTION_END || "";

  let startTime: bigint;
  let endTime: bigint;

  if (startInput && endInput) {
    // Parse from environment
    startTime = BigInt(
      startInput.match(/^\d+$/)
        ? startInput
        : Math.floor(new Date(startInput).getTime() / 1000)
    );
    endTime = BigInt(
      endInput.match(/^\d+$/) ? endInput : Math.floor(new Date(endInput).getTime() / 1000)
    );
  } else {
    // Default: Start now, end in 7 days
    const now = BigInt(Math.floor(Date.now() / 1000));
    startTime = now;
    endTime = now + BigInt(7 * 24 * 60 * 60); // 7 days

    console.log("\n⚠️  No ELECTION_START/ELECTION_END in .env, using defaults:");
  }

  // Validate times
  if (endTime <= startTime) {
    throw new Error("❌ End time must be after start time");
  }

  const duration = endTime - startTime;
  const durationHours = Number(duration) / 3600;

  console.log("\n📅 Election schedule:");
  console.log("   Start: ", new Date(Number(startTime) * 1000).toISOString());
  console.log("   End:   ", new Date(Number(endTime) * 1000).toISOString());
  console.log("   Duration:", durationHours.toFixed(2), "hours");

  // Get current session
  const currentSession = await voting.sessionId();
  console.log("\n📊 Current session ID:", currentSession.toString());

  // Start election
  console.log("\n📝 Starting election...");
  const tx = await voting.startElection(startTime, endTime);
  console.log("⏳ Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Election started successfully!");

  // Get new session info
  const newSessionId = await voting.sessionId();
  const contractStart = await voting.start();
  const contractEnd = await voting.end();

  console.log("\n" + "=".repeat(60));
  console.log("✅ ELECTION STARTED");
  console.log("=".repeat(60));
  console.log("Session ID:   ", newSessionId.toString());
  console.log("Start time:   ", new Date(Number(contractStart) * 1000).toISOString());
  console.log("End time:     ", new Date(Number(contractEnd) * 1000).toISOString());
  console.log("Duration:     ", durationHours.toFixed(2), "hours");
  console.log("=".repeat(60));

  console.log("\n📝 Voters can now cast their votes!");
  console.log("   Make sure they have their Merkle proofs from data/merkle-proofs.json");
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
