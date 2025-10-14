# 🚀 Deployment Guide

Complete step-by-step guide for deploying the Voting DApp.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
4. [Mainnet Deployment](#mainnet-deployment)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com/))
- **MetaMask** or compatible wallet ([install](https://metamask.io/))

### Required Accounts

- **Wallet with ETH** for gas fees
  - Local: Use Hardhat test accounts (pre-funded)
  - Sepolia: Get test ETH from [faucet](https://sepoliafaucet.com/)
  - Mainnet: Real ETH required

- **RPC Provider** (Infura/Alchemy/QuickNode)
  - Sign up at [infura.io](https://infura.io/) or [alchemy.com](https://www.alchemy.com/)
  - Get API key for your network

---

## Local Development

### 1. Install Dependencies

```bash
cd dappweb3
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

**Expected output:**
```
Compiled 5 Solidity files successfully
Generated 40 TypeScript typings
```

### 3. Run Tests

```bash
npm test
```

**Expected:**
```
65 passing (3s)
```

### 4. Start Local Node

**Terminal 1:**
```bash
npm run node
```

Keep this running. You'll see 20 test accounts with 10,000 ETH each.

### 5. Deploy Contracts

**Terminal 2:**
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Save the output addresses:**
```
BALToken address:     0x5FbDB2315678afecb367f032d93F642f64180aa3
Voting address:       0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

Create `.env`:
```env
BAL_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VOTING_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 6. Setup Election

```bash
# Grant minting permission
npx hardhat run scripts/grantMinter.ts --network localhost

# Generate Merkle tree (creates data/whitelist.json)
npx hardhat run scripts/merkle/generate.ts

# Edit data/whitelist.json if needed, then generate again
npx hardhat run scripts/merkle/generate.ts

# Set Merkle root
npx hardhat run scripts/setRoot.ts --network localhost

# Add candidates (creates data/candidates.json)
npx hardhat run scripts/addCandidates.ts --network localhost

# Edit data/candidates.json if needed, then add again
npx hardhat run scripts/addCandidates.ts --network localhost

# Start election
npx hardhat run scripts/startElection.ts --network localhost
```

### 7. Test Voting

Use Hardhat console or write a test script to vote:

```bash
npx hardhat console --network localhost
```

```javascript
const voting = await ethers.getContractAt("Voting", "0xe7f1...");
const proofs = require("./data/merkle-proofs.json");

// Get proof for first voter
const voter1Proof = proofs.voters[0].proof;

// Vote for candidate 1
await voting.vote(1, voter1Proof);
```

### 8. View Results

```bash
npx hardhat run scripts/results.ts --network localhost
```

---

## Sepolia Testnet Deployment

### 1. Get Sepolia ETH

Visit [sepoliafaucet.com](https://sepoliafaucet.com/) and request test ETH.

**Minimum required:** ~0.05 ETH for deployment + setup

### 2. Setup Environment

Create `.env`:
```env
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

**⚠️ Security Warning:**
- Never commit `.env` to Git
- Never share your private key
- Use a dedicated wallet for testnet

### 3. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Wait for confirmations** (1-2 minutes on Sepolia).

**Save addresses to `.env`:**
```env
BAL_TOKEN_ADDRESS=0x...
VOTING_ADDRESS=0x...
```

### 4. Verify Contracts on Etherscan

Install verification plugin:
```bash
npm install --save-dev @nomicfoundation/hardhat-verify
```

Add to `hardhat.config.ts`:
```typescript
import "@nomicfoundation/hardhat-verify";

export default {
  // ... existing config
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

Get API key from [etherscan.io/myapikey](https://etherscan.io/myapikey)

Verify:
```bash
npx hardhat verify --network sepolia \
  0x5FbDB... "BAL Token" "BAL"

npx hardhat verify --network sepolia \
  0xe7f17... "0x5FbDB..." "10000000000000000000"
```

### 5. Setup Election on Sepolia

```bash
# Grant minting permission
npx hardhat run scripts/grantMinter.ts --network sepolia

# Generate Merkle tree with real voter addresses
# Edit data/whitelist.json with actual wallet addresses
npx hardhat run scripts/merkle/generate.ts

# Set Merkle root
npx hardhat run scripts/setRoot.ts --network sepolia

# Add candidates
# Edit data/candidates.json
npx hardhat run scripts/addCandidates.ts --network sepolia

# Set election schedule in .env
echo "ELECTION_START=2024-11-01T00:00:00Z" >> .env
echo "ELECTION_END=2024-11-08T00:00:00Z" >> .env

# Start election
npx hardhat run scripts/startElection.ts --network sepolia
```

### 6. Share with Voters

Voters need:
1. **Contract address:** From `VOTING_ADDRESS`
2. **Their Merkle proof:** From `data/merkle-proofs.json`
3. **Sepolia ETH:** For gas (~0.001 ETH per vote)

---

## Mainnet Deployment

### ⚠️ CRITICAL CHECKLIST

- [ ] All tests passing
- [ ] Contracts audited (recommended)
- [ ] Sepolia deployment tested thoroughly
- [ ] Gas prices checked ([etherscan.io/gastracker](https://etherscan.io/gastracker))
- [ ] Sufficient ETH for deployment (~0.1-0.2 ETH)
- [ ] `.env` backed up securely
- [ ] Emergency pause mechanism tested
- [ ] Admin wallet secured (hardware wallet recommended)

### 1. Prepare Mainnet Wallet

- Use hardware wallet (Ledger/Trezor) recommended
- Ensure sufficient ETH balance
- Test transaction signing

### 2. Configure Mainnet

Add to `hardhat.config.ts`:
```typescript
networks: {
  mainnet: {
    url: process.env.MAINNET_RPC_URL || "",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 1,
  },
}
```

Update `.env`:
```env
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_mainnet_wallet_key
```

### 3. Deploy

```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

**Expect higher gas costs:**
- BALToken: ~1.5M gas
- Voting: ~2.5M gas
- At 30 gwei: ~0.12 ETH total

### 4. Post-Deployment

1. **Transfer admin role** to multisig (recommended)
2. **Verify contracts** on Etherscan
3. **Monitor** initial transactions
4. **Document** all addresses in secure location

---

## Post-Deployment Setup

### Update Frontend Environment

Create `frontend/.env`:
```env
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
VITE_VOTING_CONTRACT_ADDRESS_SEPOLIA=0x...
VITE_BAL_TOKEN_CONTRACT_ADDRESS_SEPOLIA=0x...
```

### Copy ABIs to Frontend

```bash
# Copy compiled contract ABIs
cp artifacts/contracts/BALToken.sol/BALToken.json frontend/src/abi/
cp artifacts/contracts/Voting.sol/Voting.json frontend/src/abi/
```

### Configure Candidates

Edit `data/candidates.json`:
```json
[
  {
    "name": "Candidate Name",
    "positions": [50, 75, 30]
  }
]
```

**Positions:** `[Topic1, Topic2, Topic3]` - values 0-100

### Configure Voters

Edit `data/whitelist.json`:
```json
[
  "0xYourVoterAddress1",
  "0xYourVoterAddress2"
]
```

**Important:** Use checksum addresses (mixed case).

---

## Verification

### Smart Contracts

```bash
# Check BALToken
npx hardhat console --network sepolia
```

```javascript
const bal = await ethers.getContractAt("BALToken", "0x...");
await bal.name(); // "BAL Token"
await bal.symbol(); // "BAL"
await bal.totalSupply(); // 0 (initially)
```

```javascript
// Check Voting
const voting = await ethers.getContractAt("Voting", "0x...");
await voting.candidateCount(); // Number of candidates
await voting.sessionId(); // Current session
await voting.voterRoot(); // Merkle root
```

### Etherscan

Visit `https://sepolia.etherscan.io/address/0x...`

**Verify:**
- ✅ Contract verified (green checkmark)
- ✅ Contract code visible
- ✅ Read/Write functions accessible

---

## Troubleshooting

### "Insufficient funds for gas"

**Solution:**
- Add more ETH to deployer wallet
- Check gas price: `await ethers.provider.getGasPrice()`

### "Nonce too high"

**Solution:**
```bash
# Reset Hardhat cache
npx hardhat clean
rm -rf cache artifacts
```

### "Contract not deployed"

**Solution:**
- Check transaction hash on Etherscan
- Verify network selection (`--network sepolia`)
- Ensure RPC URL is correct

### "Cannot verify contract"

**Solution:**
- Ensure constructor args match exactly
- Wait 1-2 minutes after deployment
- Try manual verification on Etherscan

### "MINTER_ROLE not granted"

**Solution:**
```bash
npx hardhat run scripts/grantMinter.ts --network sepolia
```

Verify:
```javascript
const bal = await ethers.getContractAt("BALToken", "0x...");
const MINTER_ROLE = await bal.MINTER_ROLE();
await bal.hasRole(MINTER_ROLE, votingAddress); // Should be true
```

---

## Gas Optimization

### Deployment Costs (estimate at 30 gwei)

| Contract | Gas | Cost (ETH) |
|----------|-----|------------|
| BALToken | 1.5M | 0.045 |
| Voting | 2.5M | 0.075 |
| Grant Role | 50k | 0.0015 |
| Add Candidate | 150k | 0.0045 |
| Set Root | 45k | 0.00135 |
| Start Election | 60k | 0.0018 |
| **Total Setup** | **~4.3M** | **~0.13 ETH** |

### Runtime Costs

| Action | Gas | Cost (30 gwei) |
|--------|-----|----------------|
| Vote | 150k | 0.0045 ETH |
| Mint BAL | included | - |
| Get Results | 0 (view) | free |

### Tips

- Deploy during low gas times (weekends, late night UTC)
- Use `gasPrice` parameter for fixed gas
- Consider EIP-1559 (base fee + priority fee)

---

## Security Checklist

- [ ] Private keys never committed to Git
- [ ] `.env` in `.gitignore`
- [ ] RPC URLs use HTTPS
- [ ] Admin address uses hardware wallet (mainnet)
- [ ] MINTER_ROLE only granted to Voting contract
- [ ] Merkle root set before election starts
- [ ] Election window validated (end > start)
- [ ] Test deployment on Sepolia before mainnet
- [ ] Contract verification on Etherscan completed
- [ ] Emergency procedures documented

---

## Next Steps

After successful deployment:

1. **Frontend deployment** → See `frontend/README.md`
2. **Monitor transactions** → Use Etherscan
3. **Share voter instructions** → Include Merkle proofs
4. **Plan election marketing** → Announce dates
5. **Prepare results analysis** → Export JSON data

---

## Support

- **Issues:** [GitHub Issues](https://github.com/osherk2001/votingDapp/issues)
- **Hardhat Docs:** [hardhat.org/docs](https://hardhat.org/docs)
- **Etherscan:** [docs.etherscan.io](https://docs.etherscan.io/)

