import { ethers } from "hardhat";

async function main(): Promise<void> {
  console.log("📊 Fetching election results...\n");

  const votingAddress = process.env.VOTING_ADDRESS;
  if (!votingAddress) {
    throw new Error("❌ Missing VOTING_ADDRESS in .env file");
  }

  console.log("📍 Voting address:", votingAddress);

  // Get Voting contract
  const voting = await ethers.getContractAt("Voting", votingAddress);

  // Get session ID from environment or use current session
  const sessionInput = process.env.SESSION_ID;
  const sessionId = sessionInput ? BigInt(sessionInput) : await voting.sessionId();

  console.log("🗳️  Session ID:", sessionId.toString());

  // Get session info
  if (sessionId > 0n) {
    const start = await voting.start();
    const end = await voting.end();
    const now = BigInt(Math.floor(Date.now() / 1000));

    console.log("\n📅 Election period:");
    console.log("   Start:", new Date(Number(start) * 1000).toISOString());
    console.log("   End:  ", new Date(Number(end) * 1000).toISOString());
    
    if (now < start) {
      console.log("   Status: ⏰ Not started yet");
    } else if (now <= end) {
      console.log("   Status: ✅ Currently active");
    } else {
      console.log("   Status: 🏁 Ended");
    }
  }

  // Get candidate count
  const candidateCount = await voting.candidateCount();
  console.log("\n👥 Total candidates:", candidateCount.toString());

  if (candidateCount === 0n) {
    console.log("\n⚠️  No candidates found");
    return;
  }

  // Fetch vote counts for all candidates
  interface CandidateResult {
    id: number;
    name: string;
    positions: number[];
    active: boolean;
    votes: bigint;
  }

  const results: CandidateResult[] = [];
  let totalVotes = 0n;

  console.log("\n📊 Fetching votes for each candidate...");
  
  for (let i = 1n; i <= candidateCount; i++) {
    const [name, positions, active] = await voting.getCandidate(i);
    const votes = await voting.votes(sessionId, i);
    
    results.push({
      id: Number(i),
      name,
      positions: [Number(positions[0]), Number(positions[1]), Number(positions[2])],
      active,
      votes,
    });

    totalVotes += votes;
  }

  // Sort by votes (descending)
  results.sort((a, b) => (a.votes > b.votes ? -1 : a.votes < b.votes ? 1 : 0));

  // Get winner
  const [winnerId, winnerVotes] = await voting.getWinner(sessionId);

  // Display results
  console.log("\n" + "=".repeat(80));
  console.log("🏆 ELECTION RESULTS - Session", sessionId.toString());
  console.log("=".repeat(80));
  
  if (totalVotes === 0n) {
    console.log("\n⚠️  No votes cast yet");
  } else {
    console.log(`\n📊 Total votes cast: ${totalVotes.toString()}\n`);

    results.forEach((candidate, index) => {
      const percentage =
        totalVotes > 0n ? ((Number(candidate.votes) / Number(totalVotes)) * 100).toFixed(2) : "0.00";
      const isWinner = candidate.id === Number(winnerId);
      const symbol = isWinner ? "🏆" : `${index + 1}.`;
      const status = candidate.active ? "" : " (inactive)";

      console.log(`${symbol} ${candidate.name}${status}`);
      console.log(`   Votes: ${candidate.votes.toString()} (${percentage}%)`);
      console.log(`   Positions: [${candidate.positions.join(", ")}]`);
      console.log();
    });

    if (winnerId > 0n) {
      const winner = results.find((c) => c.id === Number(winnerId));
      console.log("=".repeat(80));
      console.log(`🎉 WINNER: ${winner?.name || "Unknown"}`);
      console.log(`   Total votes: ${winnerVotes.toString()}`);
      console.log("=".repeat(80));
    }
  }

  // Export to JSON
  const outputData = {
    sessionId: sessionId.toString(),
    totalVotes: totalVotes.toString(),
    winnerId: winnerId.toString(),
    winnerVotes: winnerVotes.toString(),
    candidates: results.map((c) => ({
      id: c.id,
      name: c.name,
      positions: c.positions,
      active: c.active,
      votes: c.votes.toString(),
      percentage:
        totalVotes > 0n ? ((Number(c.votes) / Number(totalVotes)) * 100).toFixed(2) : "0",
    })),
  };

  const fs = await import("fs");
  const path = await import("path");
  const outputPath = path.join(process.cwd(), "data", `results-session-${sessionId}.json`);
  
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Results saved to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
