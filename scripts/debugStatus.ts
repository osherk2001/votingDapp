import hre from "hardhat";
import "dotenv/config";

async function main() {
  const votingAddress = process.env.VOTING_ADDRESS as `0x${string}` | undefined;
  const checkAddress = (process.env.CHECK_ADDRESS || "0x90F79bf6EB2c4f870365E785982E1f101E93b906") as `0x${string}`;

  if (!votingAddress) {
    console.error("VOTING_ADDRESS is not set in .env");
    process.exit(1);
  }

  const voting = await hre.ethers.getContractAt("Voting", votingAddress);

  const [sessionId, start, end, voterRoot, candidateCount] = await Promise.all([
    voting.sessionId(),
    voting.start(),
    voting.end(),
    voting.voterRoot(),
    voting.candidateCount(),
  ]);

  let candidate5Active: boolean | undefined;
  if (candidateCount >= 5n) {
    const c5 = await voting.getCandidate(5);
    candidate5Active = c5[2];
  }

  const hasVoted = await voting.voted(sessionId, checkAddress);

  console.log("=== Voting Contract Debug ===");
  console.log("Address:", votingAddress);
  console.log("Session ID:", sessionId.toString());
  console.log("Window:", new Date(Number(start) * 1000).toISOString(), "->", new Date(Number(end) * 1000).toISOString());
  console.log("Voter Root:", voterRoot);
  console.log("Candidate Count:", candidateCount.toString());
  if (candidate5Active !== undefined) console.log("Candidate #5 active:", candidate5Active);
  console.log(`Has ${checkAddress} voted in session ${sessionId}?`, hasVoted);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
