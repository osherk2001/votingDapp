import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const { SEPOLIA_URL, PRIVATE_KEY } = process.env;

export default {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
};