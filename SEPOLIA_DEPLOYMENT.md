# Sepolia Testnet Deployment Guide

This guide will help you deploy the BAL Voting DApp to the Sepolia Ethereum testnet.

## Prerequisites

### 1. Get Sepolia ETH (Test Funds)

You need SepoliaETH to deploy contracts and pay for gas fees. Get free testnet ETH from these faucets:

- **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
- **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
- **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

**Amount needed**: ~0.05 SepoliaETH should be enough for deployment and testing.

### 2. Get Sepolia RPC URL

You need an RPC endpoint to connect to Sepolia. Sign up for a free account:

**Option 1: Alchemy (Recommended)**
1. Sign up at https://www.alchemy.com/
2. Create a new app (Ethereum > Sepolia)
3. Copy the HTTPS URL (e.g., `https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY`)

**Option 2: Infura**
1. Sign up at https://infura.io/
2. Create a new API key (Web3 API > Sepolia)
3. Copy the HTTPS URL (e.g., `https://sepolia.infura.io/v3/YOUR-PROJECT-ID`)

### 3. Get Your Private Key

Export your MetaMask private key:
1. Open MetaMask
2. Click account menu → Account details
3. Click "Show private key"
4. Enter password and copy the key

**⚠️ WARNING**: Never commit your private key to Git! Keep it secret!

---

## Step-by-Step Deployment

### Step 1: Configure Environment

Create `.env` file in the project root:

```bash
# Copy the example file
copy .env.example .env
```

Edit `.env` with your values:

```bash
# Your wallet private key (WITHOUT the 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL from Alchemy or Infura
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

### Step 2: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 5 Solidity files successfully
```

### Step 3: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Expected output:
```
Deploying to Sepolia...
BALToken deployed to: 0x1234...5678
Voting deployed to: 0xabcd...ef01

=== Deployment Summary ===
Network: sepolia
BAL Token: 0x1234...5678
Voting Contract: 0xabcd...ef01

✅ Save these addresses to your .env file!
```

**📝 Save the addresses!** You'll need them for the next steps.

### Step 4: Grant Minter Role

Allow the Voting contract to mint BAL tokens as rewards:

```bash
# Update BAL_TOKEN_ADDRESS and VOTING_ADDRESS in .env first!
npx hardhat run scripts/grantMinter.ts --network sepolia
```

### Step 5: Add Candidates

Create `data/candidates.json` with your candidates:

```json
[
  {
    "name": "Alice Johnson",
    "positions": [75, 30, 50]
  },
  {
    "name": "Bob Smith",
    "positions": [25, 70, 40]
  },
  {
    "name": "Carol Williams",
    "positions": [50, 50, 60]
  }
]
```

Deploy candidates:

```bash
npx hardhat run scripts/addCandidates.ts --network sepolia
```

### Step 6: Generate Merkle Proof for Voters

Create `data/whitelist.json` with voter addresses:

```json
[
  "0x1234567890abcdef1234567890abcdef12345678",
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  "0x9876543210987654321098765432109876543210"
]
```

Generate Merkle tree:

```bash
npx hardhat run scripts/merkle/generate.ts --network sepolia
```

This creates `data/merkle-proofs.json` with the root and proofs.

### Step 7: Set Voter Root

```bash
npx hardhat run scripts/setRoot.ts --network sepolia
```

### Step 8: Start Election

```bash
npx hardhat run scripts/startElection.ts --network sepolia
```

You'll be prompted to enter:
- Session ID (e.g., `1`)
- Start time (e.g., `2024-12-01T10:00:00Z`)
- End time (e.g., `2024-12-08T10:00:00Z`)

---

## Configure Frontend for Sepolia

### Step 1: Update Frontend Environment

Navigate to frontend directory:

```bash
cd frontend
```

Create `.env` file:

```bash
copy .env.example .env
```

Edit `frontend/.env`:

```bash
# Get WalletConnect project ID from https://cloud.walletconnect.com/
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Contract addresses from deployment
VITE_BAL_TOKEN_ADDRESS=0x1234...5678
VITE_VOTING_ADDRESS=0xabcd...ef01

# Sepolia network
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

### Step 2: Build Frontend

```bash
npm run build
```

### Step 3: Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Testing on Sepolia

### 1. Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. **Switch MetaMask to Sepolia network**
4. Approve connection

### 2. Admin Functions

Go to http://localhost:3000/admin

**Add Candidates:**
- Navigate to "Candidates" tab
- Enter candidate details and positions
- Submit transaction (confirm in MetaMask)

**Manage Voters:**
- Navigate to "Voters" tab
- Add voter addresses
- Generate and set Merkle root
- Submit transaction

**Start Election:**
- Navigate to "Election" tab
- Set session ID and time window
- Submit transaction

### 3. Voting

Go to http://localhost:3000/vote

**Manual Voting:**
- Browse candidates
- Click "Vote for this Candidate"
- Confirm transaction

**AI Matching:**
- Go to "AI-Powered Match" tab
- Adjust position sliders
- Click "Calculate Matches"
- Vote for top match

### 4. View Results

Go to http://localhost:3000/results

- See live vote counts
- View winner (after election ends)
- Check BAL token rewards

---

## Verify Contracts on Etherscan

Make your contracts public and verifiable:

### 1. Get Etherscan API Key

1. Sign up at https://etherscan.io/
2. Go to API Keys → Create new key
3. Copy the API key

### 2. Update .env

```bash
ETHERSCAN_API_KEY=your_api_key_here
```

### 3. Verify BALToken

```bash
npx hardhat verify --network sepolia <BAL_TOKEN_ADDRESS> "BAL Token" "BAL"
```

### 4. Verify Voting Contract

```bash
npx hardhat verify --network sepolia <VOTING_ADDRESS> <BAL_TOKEN_ADDRESS> 10000000000000000000
```

---

## Troubleshooting

### "Insufficient funds" error

**Solution**: Get more SepoliaETH from faucets listed above.

### "Network mismatch" in MetaMask

**Solution**: Switch MetaMask to Sepolia network:
1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia test network"
4. If not visible, enable "Show test networks" in Settings

### "Transaction underpriced"

**Solution**: Increase gas price in hardhat.config.ts:

```typescript
sepolia: {
  url: process.env.SEPOLIA_RPC_URL || "",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 11155111,
  gasPrice: 20000000000, // 20 gwei
},
```

### "Nonce too high"

**Solution**: Reset MetaMask account:
1. Settings → Advanced
2. Click "Clear activity tab data"

### Frontend shows "Wrong network"

**Solution**: Ensure MetaMask is on Sepolia and frontend .env has correct VITE_CHAIN_ID=11155111

---

## Gas Costs Estimate (Sepolia)

| Operation | Estimated Gas | Cost @ 20 gwei |
|-----------|---------------|----------------|
| Deploy BALToken | ~1,500,000 | ~0.03 ETH |
| Deploy Voting | ~2,500,000 | ~0.05 ETH |
| Grant Minter Role | ~50,000 | ~0.001 ETH |
| Add Candidate | ~100,000 | ~0.002 ETH |
| Set Voter Root | ~50,000 | ~0.001 ETH |
| Start Election | ~100,000 | ~0.002 ETH |
| Vote | ~150,000 | ~0.003 ETH |

**Total for full setup**: ~0.1 SepoliaETH

---

## Sepolia Block Explorer

View your contracts and transactions:

https://sepolia.etherscan.io/

Search by:
- Your wallet address
- Contract addresses
- Transaction hashes

---

## Next Steps

✅ Contracts deployed to Sepolia
✅ Frontend configured for Sepolia
✅ Voters can connect and vote
✅ Admin can manage election

**Ready for mainnet?** Follow the same steps but use:
- Real ETH (not testnet)
- Mainnet RPC URL
- `--network mainnet` flag
- Triple-check everything! 🚀
