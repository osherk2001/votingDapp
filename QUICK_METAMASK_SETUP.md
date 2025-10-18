# 🚀 QUICK START: Connect MetaMask to Local Hardhat

## ⚡ 3-Minute Setup

### 1️⃣ Add Network to MetaMask

Open MetaMask → Networks → **Add Network** → Enter:

```
Network Name:     Hardhat Local
RPC URL:         http://127.0.0.1:8545
Chain ID:        31337
Currency:        ETH
```

Click **Save**

---

### 2️⃣ Import a Test Account

MetaMask → Account Icon → **Import Account** → Paste:

**Account #1** (Voter):
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

OR **Account #0** (Admin):
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Click **Import**

---

### 3️⃣ Connect to dApp

1. Go to http://localhost:3000
2. Click **"Connect Wallet"**
3. Select your imported account
4. Click **"Connect"**

---

## ✅ You're Ready!

Your MetaMask should now show:
- Network: **Hardhat Local**
- Balance: **~10,000 ETH**
- Connected to: **localhost:3000**

---

## 🔧 Troubleshooting

### Issue: "Nonce too high" error
**Fix:** MetaMask Settings → Advanced → **Clear activity tab data**

### Issue: Can't connect
**Fix:** Make sure you're on **Hardhat Local** network in MetaMask

### Issue: Wrong network
**Fix:** Switch to Hardhat Local in MetaMask dropdown (top of extension)

---

## 📍 All Test Accounts

All have **10,000 ETH** and are **whitelisted voters**:

| # | Address | Private Key |
|---|---------|-------------|
| 0 | `0xf39F...2266` | `0xac09...ff80` ✅ **ADMIN** |
| 1 | `0x7099...79C8` | `0x59c6...690d` ✅ **VOTER** |
| 2 | `0x3C44...93BC` | `0x5de4...365a` ✅ **VOTER** |
| 3 | `0x90F7...b906` | `0x7c85...007a6` ✅ **VOTER** |
| 4 | `0x15d3...6A65` | `0x47e1...4926a` ✅ **VOTER** |

Full keys in `METAMASK_SETUP_GUIDE.md`

---

## 🎯 Test the Connection

1. **Connect**: Click "Connect Wallet" on the dApp
2. **Vote**: Go to Vote page → Select a candidate → Vote
3. **Receive**: Get 10 BAL tokens as reward! 🎉
