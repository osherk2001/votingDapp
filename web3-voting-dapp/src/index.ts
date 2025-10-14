// This file serves as the entry point for the application. It will initialize the application and set up any necessary configurations.

import { ethers } from "ethers";
import { Voting__factory } from "../typechain"; // Assuming typechain is set up for contract types

async function main() {
    // Initialize provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Get contract address from environment variables or configuration
    const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;

    // Create contract instance
    const votingContract = Voting__factory.connect(contractAddress, signer);

    // Add your application logic here
    console.log("Voting DApp initialized");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});