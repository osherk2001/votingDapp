# MetaMask Setup Guide for Local Hardhat Network

## 🦊 Adding Hardhat Network to MetaMask

### Step 1: Open MetaMask Network Settings
1. Click the MetaMask extension icon
2. Click the **network dropdown** at the top (it might say "Ethereum Mainnet")
3. Click **"Add Network"** or **"Add a network manually"** at the bottom

### Step 2: Enter Network Details
Fill in the following information:

| Field | Value |
|-------|-------|
| **Network Name** | `Hardhat Local` or `Localhost 8545` |
| **New RPC URL** | `http://127.0.0.1:8545` |
| **Chain ID** | `31337` |
| **Currency Symbol** | `ETH` |
| **Block Explorer URL** | (leave blank) |

### Step 3: Save and Switch
1. Click **"Save"**
2. MetaMask will automatically switch to the new network
3. You should see "Hardhat Local" or your chosen name at the top

---

## 🔑 Importing Test Accounts

You need to import one of the Hardhat test accounts to interact with your dApp.

### Available Test Accounts

Here are the first 5 Hardhat accounts (all have 10,000 ETH):

#### Account #0 (Owner/Admin)
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Account #1
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

#### Account #2
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

#### Account #3
```
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

#### Account #4
```
Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

### How to Import an Account

1. Click the **account icon** (circle) in the top-right of MetaMask
2. Click **"Import Account"**
3. Select **"Private Key"** as the import type
4. Paste one of the private keys above (including the `0x` prefix)
5. Click **"Import"**

**Recommended:** Import at least Account #0 (for admin functions) and Account #1 (for voting)

---

## 🔥 Common Issues & Solutions

### Issue 1: "Nonce too high" error
**Solution:** Reset your account
1. Click MetaMask icon
2. Go to **Settings** → **Advanced**
3. Click **"Clear activity tab data"** or **"Reset Account"**
4. Confirm the reset

### Issue 2: MetaMask not connecting
**Solution:** 
1. Make sure Hardhat node is running (you should see it in a separate PowerShell window)
2. Check that the RPC URL is exactly `http://127.0.0.1:8545` (not localhost)
3. Make sure Chain ID is `31337`

### Issue 3: "Wrong Network" warning
**Solution:**
1. Click the network dropdown in MetaMask
2. Select **"Hardhat Local"** (or whatever you named it)
3. Refresh the dApp page

### Issue 4: Can't see the network I just added
**Solution:**
1. Try using `http://localhost:8545` instead of `http://127.0.0.1:8545`
2. Or try adding `http://127.0.0.1:8545/` with a trailing slash

---

## ✅ Quick Test

After setting up:

1. **Check Network**: MetaMask should show "Hardhat Local" at the top
2. **Check Balance**: Your imported account should show ~10,000 ETH
3. **Check Connection**: Go to http://localhost:3000 and click "Connect Wallet"
4. **Approve Connection**: MetaMask will ask to connect - click "Connect"
5. **See Address**: Your wallet address should appear on the dApp

---

## 📱 Step-by-Step Visual Guide

### Adding Network:
```
MetaMask → Networks (top) → Add Network → Manual → Fill form → Save
```

### Importing Account:
```
MetaMask → Account Icon → Import Account → Private Key → Paste → Import
```

### Connecting to dApp:
```
dApp → Connect Wallet → MetaMask → Select Account → Connect
```

---

## 🎯 Quick Command to Check if Hardhat is Running

Open PowerShell and run:
```powershell
netstat -ano | findstr :8545
```

If you see output, the Hardhat node is running. If not, restart it:
```powershell
cd c:\block_Chain\votingDapp
npm run node
```

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **NEVER use these private keys on real networks!** They are publicly known test accounts.
2. **NEVER send real ETH to these addresses!** You will lose it.
3. These accounts are only for local development.
4. Always use a separate MetaMask account for development vs real funds.

---

## 🆘 Still Having Issues?

If you're still having trouble:

1. **Check the browser console** (F12) for errors
2. **Check MetaMask is unlocked**
3. **Try disconnecting and reconnecting** the wallet
4. **Restart the Hardhat node** if it crashed
5. **Clear MetaMask cache** (Settings → Advanced → Clear activity)

Need more help? Check:
- Hardhat terminal window for errors
- Vite dev server terminal for errors
- Browser console (F12 → Console tab)
