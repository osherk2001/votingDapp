# Phase 10: E2E Testing on Localhost - Complete Guide

## 🎯 Overview
This document provides step-by-step instructions for end-to-end testing of the Voting DApp on a local Hardhat network.

## ✅ Setup Complete

### 1. **Hardhat Node Running** ✅
- **URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Accounts**: 20 test accounts with 10,000 ETH each

### 2. **Contracts Deployed** ✅
```
BALToken:  0x5FbDB2315678afecb367f032d93F642f64180aa3
Voting:    0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Deployer:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 3. **Configuration Complete** ✅
- ✅ Voting contract granted MINTER_ROLE on BALToken
- ✅ 5 candidates added:
  - Alice Johnson [30, 60, 90]
  - Bob Smith [70, 40, 20]
  - Carol Williams [50, 80, 50]
  - David Chen [85, 25, 75]
  - Eva Martinez [40, 70, 30]

### 4. **Voter Whitelist** ✅
- ✅ Merkle root set: `0x77e700f03437c8e81143fabca89ab927d28d5207bf6ed00aa9b4d8ed5cdd6f7c`
- ✅ 5 whitelisted voters (first 5 Hardhat accounts)
- ✅ Proofs generated in `data/merkle-proofs.json`

### 5. **Election Started** ✅
- ✅ Session ID: 1
- ✅ Start: 2025-10-14T17:03:17.000Z (NOW - active!)
- ✅ End: 2025-10-21T17:03:17.000Z (7 days)
- ✅ Reward per vote: 10 BAL tokens

### 6. **Frontend Running** ✅
- ✅ Dev server: http://localhost:3001/
- ✅ Environment configured for localhost
- ✅ Contract addresses set

---

## 📋 E2E Testing Checklist

### **Step 1: Connect MetaMask to Localhost**

1. **Add Localhost Network to MetaMask**:
   - Network Name: `Hardhat Localhost`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Accounts**:
   Import these private keys (they have 10,000 ETH and are whitelisted):

   ```
   Account #0 (Deployer/Admin):
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

   Account #1 (Voter 1):
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

   Account #2 (Voter 2):
   0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

   Account #3 (Voter 3):
   0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
   Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906

   Account #4 (Voter 4):
   0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
   Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
   ```

---

### **Step 2: Test Admin Interface**

**Using Account #0 (Deployer)**:

1. **Navigate to Admin Page**:
   - Go to http://localhost:3001/admin
   - Connect with Account #0

2. **Test Candidate Management**:
   - [ ] Verify all 5 candidates are displayed
   - [ ] Check policy positions are correct
   - [ ] Try adding a new candidate (optional)
   - [ ] Verify candidate count updates

3. **Test Voter Management**:
   - [ ] Check Merkle root is displayed correctly
   - [ ] Verify root matches: `0x77e700...cdd6f7c`

4. **Test Election Management**:
   - [ ] Verify current session shows ID: 1
   - [ ] Check election status shows "Active"
   - [ ] Verify start/end times are displayed
   - [ ] Confirm time window is correct (7 days)

---

### **Step 3: Test Voting Workflow**

**Using Account #1 (Voter)**:

1. **Get Merkle Proof**:
   - Open `data/merkle-proofs.json`
   - Find proof for Account #1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

2. **Navigate to Vote Page**:
   - Go to http://localhost:3001/vote
   - Connect with Account #1
   - Verify wallet is connected

3. **Manual Voting**:
   - [ ] Select a candidate (e.g., "Alice Johnson")
   - [ ] Click "Vote" button
   - [ ] Confirm transaction in MetaMask
   - [ ] Wait for confirmation
   - [ ] Verify success message appears

4. **AI Matching (Optional)**:
   - [ ] Enter policy preferences (e.g., [60, 50, 70])
   - [ ] Click "Find Best Match"
   - [ ] Verify matching algorithm runs
   - [ ] Check recommended candidate
   - [ ] Vote for recommendation

5. **Verify Vote Recorded**:
   - [ ] Check "Already voted" message appears
   - [ ] Try voting again (should fail)

---

### **Step 4: Test BAL Token Rewards**

**Check BAL Balance After Voting**:

1. **Add BAL Token to MetaMask**:
   - Token Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
   - Symbol: `BAL`
   - Decimals: `18`

2. **Verify Reward**:
   - [ ] Check balance shows 10 BAL (10.0)
   - [ ] Verify transaction history shows mint

3. **Alternative Verification (Script)**:
   ```bash
   # Run in root directory
   npx hardhat console --network localhost
   ```
   ```javascript
   const bal = await ethers.getContractAt("BALToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
   const voterAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
   const balance = await bal.balanceOf(voterAddress);
   console.log("BAL Balance:", ethers.formatEther(balance));
   // Should output: 10.0
   ```

---

### **Step 5: Test Results Page**

1. **Navigate to Results**:
   - Go to http://localhost:3001/results
   - Page should load automatically

2. **Verify Data Display**:
   - [ ] Session selector shows "Current Session (1)"
   - [ ] Total votes count is correct (should be 1 after Step 3)
   - [ ] Candidates count shows 5
   - [ ] Session ID displays 1

3. **Check Leaderboard**:
   - [ ] Candidate you voted for has 1 vote
   - [ ] Vote percentage shows 100%
   - [ ] Progress bar is filled
   - [ ] Winner badge/trophy shows for leading candidate
   - [ ] Policy positions displayed correctly

4. **Test Auto-Refresh**:
   - [ ] Toggle "Auto-refresh" switch ON
   - [ ] Have another account vote (Account #2)
   - [ ] Wait 5 seconds
   - [ ] Verify vote count updates automatically
   - [ ] Check percentages recalculate

5. **Test Session Selector**:
   - [ ] Select "Session 1" from dropdown
   - [ ] Verify data remains the same
   - [ ] (If you start a new election, test switching between sessions)

6. **Check Winner Display**:
   - [ ] Winner card appears if votes > 0
   - [ ] Shows correct candidate name
   - [ ] Displays vote count
   - [ ] Shows percentage
   - [ ] Policy positions visible

---

### **Step 6: Multi-Voter Simulation**

**Cast votes from multiple accounts to test full flow**:

1. **Vote with Account #2**:
   - Get proof from `merkle-proofs.json` for `0x3C44...`
   - Vote for "Bob Smith"
   - Verify BAL reward received

2. **Vote with Account #3**:
   - Vote for "Carol Williams"
   - Check BAL balance

3. **Vote with Account #4**:
   - Vote for "Alice Johnson"
   - Verify vote recorded

4. **Check Results**:
   - Navigate to Results page
   - Verify:
     - [ ] Total votes: 4
     - [ ] Alice: 2 votes (50%)
     - [ ] Bob: 1 vote (25%)
     - [ ] Carol: 1 vote (25%)
     - [ ] Alice shows winner badge
     - [ ] Progress bars scale correctly

---

### **Step 7: Compare Script vs UI**

Run the results script and compare with frontend:

```bash
cd "c:\Users\Lia\OneDrive - Holon Institute of Technology\CS\blockchain\dappweb3"
$env:VOTING_ADDRESS='0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
$env:SESSION_ID='1'
npx hardhat run scripts/results.ts --network localhost
```

**Verify**:
- [ ] Vote counts match between script and UI
- [ ] Winner ID matches
- [ ] Candidate names match
- [ ] Policy positions match
- [ ] Percentages are consistent

---

## 🐛 Troubleshooting

### MetaMask Issues

**"Nonce too high" error**:
```
Settings → Advanced → Clear activity tab data
```

**Chain ID mismatch**:
- Ensure MetaMask is on Chain ID 31337
- Switch network to "Hardhat Localhost"

**Gas estimation failed**:
- Check Hardhat node is running
- Verify contract addresses are correct
- Ensure voter is whitelisted

### Frontend Issues

**Contracts not loading**:
- Check `.env` has correct addresses
- Restart dev server after env changes
- Clear browser cache

**Wallet not connecting**:
- Ensure MetaMask is unlocked
- Check network is set to localhost (31337)
- Try refreshing the page

### Voting Errors

**"Not whitelisted"**:
- Verify account address is in `data/whitelist.json`
- Check Merkle proof is correct
- Ensure root was set correctly

**"Already voted"**:
- Expected behavior - can't vote twice
- Use different account to test

**"Not in election window"**:
- Check current time is between start and end
- Verify election was started successfully

---

## 📊 Expected Results Summary

After completing all tests:

| Metric | Expected Value |
|--------|---------------|
| Total Candidates | 5 |
| Total Votes | 4 |
| BAL Tokens Minted | 40 (10 per vote) |
| Session ID | 1 |
| Election Status | Active |
| Whitelisted Voters | 5 |
| Winner | Alice Johnson (2 votes, 50%) |

---

## 🎬 Next Steps After E2E Testing

Once all tests pass:

1. **Document Test Results**:
   - Take screenshots of each page
   - Record any bugs or issues
   - Note performance observations

2. **Prepare for Phase 11**:
   - Review error handling needs
   - Identify UX improvements
   - Plan i18n implementation
   - Security review checklist

3. **Production Deployment Prep**:
   - Test on Sepolia testnet
   - Update documentation
   - Prepare deployment guide
   - Create user manual

---

## ✅ Test Completion Checklist

- [ ] Hardhat node running successfully
- [ ] Contracts deployed and configured
- [ ] Frontend loads without errors
- [ ] MetaMask connects to localhost
- [ ] Admin interface fully functional
- [ ] Voting workflow works end-to-end
- [ ] BAL rewards minted correctly
- [ ] Results page displays accurate data
- [ ] Auto-refresh updates data
- [ ] Script output matches UI
- [ ] Multiple votes processed correctly
- [ ] All edge cases handled gracefully

---

**Status**: Ready for testing! 🚀
**Frontend**: http://localhost:3001/
**Hardhat Node**: http://127.0.0.1:8545
**Session ID**: 1 (ACTIVE)
