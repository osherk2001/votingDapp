# Complete E2E Setup Script - Run in Order

## Step 1: Start Hardhat Node (Keep this running!)
```powershell
# Open a NEW PowerShell window and run:
cd "c:\Users\Lia\OneDrive - Holon Institute of Technology\CS\blockchain\dappweb3"
npx hardhat node
# ⚠️ LEAVE THIS WINDOW OPEN - Don't close it!
```

## Step 2: Deploy Contracts (In a DIFFERENT PowerShell window)
```powershell
cd "c:\Users\Lia\OneDrive - Holon Institute of Technology\CS\blockchain\dappweb3"
npx hardhat run scripts/deploy.ts --network localhost
```

**📝 Copy the addresses from the output:**
- BALToken: 0x...
- Voting: 0x...

## Step 3: Set Environment Variables
```powershell
# Replace with YOUR addresses from Step 2
$env:BAL_TOKEN_ADDRESS='0x5FbDB2315678afecb367f032d93F642f64180aa3'
$env:VOTING_ADDRESS='0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
```

## Step 4: Grant Minter Role
```powershell
npx hardhat run scripts/grantMinter.ts --network localhost
```

## Step 5: Add Candidates
```powershell
npx hardhat run scripts/addCandidates.ts --network localhost
```

## Step 6: Generate Whitelist
```powershell
npx hardhat run scripts/merkle/generate.ts
```

## Step 7: Set Merkle Root
```powershell
npx hardhat run scripts/setRoot.ts --network localhost
```

## Step 8: Start Election
```powershell
npx hardhat run scripts/startElection.ts --network localhost
```

## Step 9: Update Frontend .env
Edit `frontend/.env` file with the NEW addresses from Step 2:
```properties
VITE_BAL_TOKEN_ADDRESS=<YOUR_BAL_TOKEN_ADDRESS>
VITE_VOTING_ADDRESS=<YOUR_VOTING_ADDRESS>
VITE_CHAIN_ID=31337
VITE_RPC_URL=http://127.0.0.1:8545
```

## Step 10: Start Frontend
```powershell
cd frontend
npm run dev
```

## Step 11: Configure MetaMask
1. Add Network:
   - Network Name: Hardhat Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

2. Import Account #0:
   - Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

3. **IMPORTANT**: Reset MetaMask account:
   - Settings → Advanced → Clear activity tab data
   - (This fixes nonce issues)

---

## ⚠️ CRITICAL RULES

1. **NEVER close the Hardhat node window** - If you do, all data is lost
2. **Run commands in a SEPARATE window** from the node
3. **Always update frontend .env** with new contract addresses after deploy
4. **Always restart frontend dev server** after changing .env
5. **Always reset MetaMask** when restarting the blockchain

---

## 🐛 Why Data Wasn't Saving

The issue was:
- Hardhat node was stopped (you pressed Ctrl+C)
- When node stops, ALL blockchain data is lost
- Frontend can't connect to a stopped node
- MetaMask shows "inactive" because there's no blockchain

**Solution**: Keep the Hardhat node running in a separate terminal window!
