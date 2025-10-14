# ✅ Sepolia Network Configuration Complete

Your BAL Voting DApp is now configured for the **Sepolia Ethereum testnet**!

## 📋 What Changed

### Backend Configuration
- ✅ `hardhat.config.ts` - Sepolia network already configured (chainId: 11155111)
- ✅ `.env.example` - Updated with Sepolia RPC URL template
- ✅ All deployment scripts work with `--network sepolia` flag

### Frontend Configuration  
- ✅ `frontend/src/lib/wagmi.ts` - Sepolia is now the **primary chain** (listed first)
- ✅ `frontend/.env.example` - Defaults to Sepolia (chainId: 11155111)
- ✅ RPC URL template updated for Alchemy/Infura
- ✅ Build completed successfully (25.80s)

### Documentation
- ✅ **SEPOLIA_DEPLOYMENT.md** - Complete step-by-step deployment guide
- ✅ **README.md** - Updated with Sepolia quick start instructions

## 🚀 Next Steps

### 1. Get Test Funds

Get free SepoliaETH from faucets:
- https://sepoliafaucet.com/
- https://faucets.chain.link/sepolia
- https://www.infura.io/faucet/sepolia

**Amount needed**: ~0.1 SepoliaETH for deployment and testing

### 2. Setup Environment

**Backend** (`/.env`):
```bash
# Your wallet private key (WITHOUT 0x)
PRIVATE_KEY=abc123...

# Get from https://www.alchemy.com/ or https://infura.io/
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

**Frontend** (`/frontend/.env`):
```bash
# Get from https://cloud.walletconnect.com/
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Will be filled after deployment
VITE_BAL_TOKEN_ADDRESS=0x...
VITE_VOTING_ADDRESS=0x...

# Sepolia config (already set)
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

### 3. Deploy to Sepolia

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Copy the contract addresses and add to .env files!

# Grant MINTER_ROLE
npx hardhat run scripts/grantMinter.ts --network sepolia

# Setup election
npx hardhat run scripts/merkle/generate.ts
npx hardhat run scripts/setRoot.ts --network sepolia
npx hardhat run scripts/addCandidates.ts --network sepolia
npx hardhat run scripts/startElection.ts --network sepolia
```

### 4. Launch Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 and **switch MetaMask to Sepolia network**!

## 🔍 Verify on Etherscan

After deployment, verify your contracts:

```bash
# Get API key from https://etherscan.io/myapikey
# Add to .env: ETHERSCAN_API_KEY=your_key

npx hardhat verify --network sepolia <BAL_TOKEN_ADDRESS> "BAL Token" "BAL"
npx hardhat verify --network sepolia <VOTING_ADDRESS> <BAL_TOKEN_ADDRESS> 10000000000000000000
```

View on Sepolia Etherscan: https://sepolia.etherscan.io/

## 📖 Full Documentation

For detailed instructions, see:
- **[SEPOLIA_DEPLOYMENT.md](./SEPOLIA_DEPLOYMENT.md)** - Complete deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment workflows
- **[README.md](./README.md)** - Project overview and quick start

## 🎯 Testing Checklist

After deployment:

- [ ] Contracts deployed to Sepolia
- [ ] Addresses saved to `.env` files
- [ ] MINTER_ROLE granted
- [ ] Candidates added
- [ ] Voter whitelist set (Merkle root)
- [ ] Election started
- [ ] Frontend connects to Sepolia
- [ ] Can connect MetaMask wallet
- [ ] Can vote successfully
- [ ] BAL tokens minted as reward
- [ ] Results page shows vote counts

## 💡 Tips

**Switch MetaMask to Sepolia:**
1. Open MetaMask
2. Click network dropdown (top left)
3. Select "Sepolia test network"
4. If not visible: Settings → Advanced → Show test networks

**Check Transaction Status:**
- View all transactions: https://sepolia.etherscan.io/
- Search by your wallet address or transaction hash

**Gas Costs:**
- Sepolia gas is free (testnet)
- Typical deployment: ~0.08-0.1 SepoliaETH total
- Per vote: ~0.003 SepoliaETH

## 🆘 Troubleshooting

**"Insufficient funds"**
→ Get more SepoliaETH from faucets

**"Wrong network" in frontend**
→ Switch MetaMask to Sepolia network

**"Network mismatch" errors**
→ Ensure frontend `.env` has `VITE_CHAIN_ID=11155111`

**Contract interactions fail**
→ Verify contract addresses are correct in both `.env` files

**Full troubleshooting guide:** See [SEPOLIA_DEPLOYMENT.md](./SEPOLIA_DEPLOYMENT.md#troubleshooting)

---

🎉 **You're ready to deploy to Sepolia!** Follow the steps above and your DApp will be live on the Ethereum testnet.
