import { ethers } from "hardhat";
import "dotenv/config";
import fs from "fs";
import path from "path";

async function main() {
  const votingAddress = process.env.VOTING_ADDRESS as `0x${string}`;
  if (!votingAddress) throw new Error("Missing VOTING_ADDRESS in .env");

  const candidateId = Number(process.env.CANDIDATE_ID || 5);
  const sender = (process.env.CHECK_ADDRESS || "0x90F79bf6EB2c4f870365E785982E1f101E93b906") as `0x${string}`;

  const proofsPath = path.join(process.cwd(), "data", "merkle-proofs.json");
  const data = JSON.parse(fs.readFileSync(proofsPath, "utf-8"));
  const entry = (data.voters as Array<{ address: string; proof: string[] }>).find(
    (v) => v.address.toLowerCase() === sender.toLowerCase()
  );
  if (!entry) throw new Error(`No proof found for ${sender}`);

  const voting = await ethers.getContractAt("Voting", votingAddress);
  const [sid, start, end, cc] = await Promise.all([
    voting.sessionId(),
    voting.start(),
    voting.end(),
    voting.candidateCount(),
  ]);
  console.log("Session:", sid.toString(), "Window:", Number(start), "->", Number(end), "Candidates:", cc.toString());

  const all = await ethers.getSigners();
  const signer = all.find((s) => s.address.toLowerCase() === sender.toLowerCase());
  if (!signer) throw new Error(`Signer for ${sender} not found in local accounts`);

  try {
    const tx = await voting.connect(signer).vote(candidateId, entry.proof);
    console.log("Submitted tx:", tx.hash);
    await tx.wait();
    console.log("Vote success");
  } catch (e: any) {
    console.error("Vote reverted");
    // Print as much as possible from the error
    if (e?.error?.data) console.error("data:", e.error.data);
    if (e?.data) console.error("data:", e.data);
    if (e?.reason) console.error("reason:", e.reason);
    if (e?.shortMessage) console.error("shortMessage:", e.shortMessage);
    console.error(e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
