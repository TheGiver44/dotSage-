# DotSage Local Deployment Guide

This guide documents the complete process of deploying and testing DotSage locally, including all the challenges we encountered and how we solved them.

## Overview

DotSage is an AI-powered Polkadot learning chatbot that:
- Answers questions using AI (Groq API)
- Logs questions on-chain using ink! smart contracts
- Allows community voting on questions
- Displays trending questions from the blockchain

## Prerequisites

1. **Rust & Cargo** (with nightly toolchain)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup toolchain install nightly
   rustup target add wasm32-unknown-unknown --toolchain nightly
   ```

2. **cargo-contract** (for building ink! contracts)
   ```bash
   cargo +nightly install cargo-contract --force
   ```

3. **substrate-contracts-node** (local blockchain node)
   ```bash
   cargo +nightly install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --tag v0.42.0
   ```
   **Note**: We use `+nightly` because some dependencies require `edition2024` which isn't stable yet.

4. **Node.js** (v18+ recommended)
   ```bash
   node --version  # Should be 18+
   ```

5. **Polkadot.js Extension** (browser wallet)
   - Chrome: https://chrome.google.com/webstore/detail/polkadot-js-extension/mopnmbcafieddcagagdcbnhejhlodfaa
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/

6. **Groq API Key** (for AI responses)
   - Sign up at https://console.groq.com/
   - Generate an API key
   - Keep it secure (never commit to git)

## Step-by-Step Deployment

### 1. Build the Smart Contract

```bash
cd dotsage/contracts

# Build the contract (this generates metadata.json)
cargo +nightly contract build

# Verify the build succeeded
ls target/ink/dotsage_questions.json  # Should exist
ls target/ink/dotsage_questions.contract  # Should exist
```

**What this does:**
- Compiles the ink! contract to WebAssembly
- Generates contract metadata (`dotsage_questions.json`)
- Creates a deployable contract bundle (`.contract` file)

### 2. Start the Local Contracts Node

```bash
# Start the node in a terminal (keep it running)
~/.cargo/bin/substrate-contracts-node --dev --tmp
```

**Expected output:**
- Node starts and begins producing blocks
- RPC endpoint available at `ws://127.0.0.1:9944`
- Keep this terminal open

**Troubleshooting:**
- If `contracts-node` command not found, check installation path: `~/.cargo/bin/substrate-contracts-node`
- If port 9944 is in use, kill the process: `lsof -ti:9944 | xargs kill`

### 3. Deploy the Contract

```bash
cd dotsage/contracts

# Instantiate the contract on the local node
cargo +nightly contract instantiate \
  --suri "//Alice" \
  --constructor new \
  --url ws://127.0.0.1:9944 \
  --skip-confirm \
  --salt 0x00 \
  --output-json \
  target/ink/dotsage_questions.contract > /tmp/dotsage_instantiate.json

# Extract the contract address
CONTRACT_ADDRESS=$(jq -r '.contract' /tmp/dotsage_instantiate.json)
echo "Contract deployed at: $CONTRACT_ADDRESS"
```

**Important Notes:**
- We use `//Alice` which is a well-known dev account with funds on a dev node
- The contract address will be something like: `5FSLXxMPwSEd6xwt285QKtMkhNN5Afi5fNrc2tmDBGaT8R2C`
- Save this address - you'll need it for the frontend

**Common Errors:**
- `Connection refused`: Make sure the contracts node is running
- `StorageDepositNotEnoughFunds`: Use `//Alice` or another funded dev account
- `unexpected argument '--contract'`: Use the `.contract` file as the last positional argument, not with `--contract` flag

### 4. Wire Frontend with Contract

```bash
cd dotsage

# Copy contract metadata to frontend
cp contracts/target/ink/dotsage_questions.json app/src/lib/contract_metadata.json

# Create frontend environment file
cat > app/.env.local << EOF
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:9944
NEXT_PUBLIC_CONTRACT_ADDRESS=5FSLXxMPwSEd6xwt285QKtMkhNN5Afi5fNrc2tmDBGaT8R2C
EOF

# Replace the address above with your actual contract address from step 3
```

**What this does:**
- Makes contract metadata available to the frontend
- Configures the frontend to connect to your local node
- Points the frontend to your deployed contract

### 5. Set Up Backend (AI Integration)

```bash
cd dotsage/backend

# Install dependencies
npm install

# Create .env file with your Groq API key (don't commit this!)
cat > .env << EOF
GROQ_API_KEY=your_groq_api_key_here
PORT=8788
EOF

# Replace 'your_groq_api_key_here' with your actual key from https://console.groq.com/
```

**Important**: 
- The backend uses `dotenv` to automatically load variables from `.env` file
- **Never commit `.env` to git** - it contains your API key
- If you use `export GROQ_API_KEY=...`, you must restart the backend for it to pick up the change
- The `.env` file approach is more reliable because it persists across shell sessions

### 6. Start Backend Server

```bash
cd dotsage/backend
PORT=8788 npm run dev
```

**Expected output:**
```
DotSage backend listening on http://localhost:8788
```

Keep this terminal open.

### 7. Start Frontend Server

```bash
cd dotsage/app
npm install  # First time only
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

### 8. Test the Application

1. **Open browser**: http://localhost:3000
2. **Install Polkadot.js Extension** (if not already installed)
3. **Create/Import Account** in the extension
4. **Test the flow**:
   - Ask a question (e.g., "How does OpenGov work?")
   - Get AI answer (if GROQ_API_KEY is set)
   - Click "Log this question to Polkadot"
   - Approve the transaction in the wallet extension
   - See the transaction hash

## Key Challenges & Solutions

### Challenge 1: Contract Method Not Found

**Error**: `Contract method 'ask_question' not found in metadata`

**Solution**: Use the `Abi` class to properly resolve method identifiers:

```typescript
import { Abi } from "@polkadot/api-contract";

const abi = new Abi(CONTRACT_METADATA);
const message = abi.findMessage('ask_question');
(c.tx as Record<string, unknown>)[message.identifier](...)
```

### Challenge 2: SSR Errors with Polkadot Extension

**Error**: `ReferenceError: window is not defined`

**Solution**: Defer wallet imports to browser-only execution:

```typescript
if (typeof window === "undefined") {
  throw new Error("Wallet actions require a browser environment");
}
const { web3Enable, web3FromSource } = await import("@polkadot/extension-dapp");
```

### Challenge 3: Cargo Edition Requirements

**Error**: `feature edition2024 is required`

**Solution**: Use nightly Cargo toolchain:

```bash
cargo +nightly install contracts-node ...
cargo +nightly contract build
```

### Challenge 4: Contract Instantiate Command Syntax

**Error**: `unexpected argument '--contract' found`

**Solution**: Pass the `.contract` file as a positional argument:

```bash
cargo contract instantiate --suri "//Alice" --constructor new --url ws://127.0.0.1:9944 target/ink/dotsage_questions.contract
```

## Verification Checklist

- [ ] Contracts node running on `ws://127.0.0.1:9944`
- [ ] Contract deployed and address saved
- [ ] `app/src/lib/contract_metadata.json` exists
- [ ] `app/.env.local` has correct RPC URL and contract address
- [ ] Backend running on port 8788
- [ ] Frontend running on port 3000
- [ ] Polkadot.js extension installed and has accounts
- [ ] GROQ_API_KEY set (optional, for AI responses)

## Troubleshooting

### Frontend shows 404 errors

**Check:**
1. Is Next.js dev server actually running? `ps aux | grep "next dev"`
2. Are there multiple instances? Kill duplicates: `pkill -f "next dev"`
3. Check browser console for specific errors
4. Verify `.env.local` exists and has correct values

### Wallet connection fails

**Check:**
1. Extension installed and enabled
2. At least one account exists in extension
3. Page refreshed after installing extension
4. Browser console for specific error messages

### Contract calls fail

**Check:**
1. Contracts node is running and producing blocks
2. Contract address in `.env.local` matches deployed address
3. Metadata file is up-to-date (rebuild contract if needed)
4. Wallet has sufficient balance (dev accounts should be fine)

### AI responses are placeholders

**Check:**
1. `.env` file exists in `dotsage/backend/` with `GROQ_API_KEY=your_key`
2. Backend was restarted after creating/updating `.env` file
3. Backend server logs show no API errors
4. API key is valid (test at https://console.groq.com/)
5. If using `export`, make sure backend was started in the same shell session

**Solution**: Create a `.env` file instead of using `export`:
```bash
cd dotsage/backend
echo "GROQ_API_KEY=your_actual_key_here" > .env
# Then restart the backend
```

## Next Steps

Once local deployment is working:

1. **Test all features**:
   - Ask questions and get AI answers
   - Log questions on-chain
   - View questions on Explore page
   - Vote on questions

2. **Deploy to testnet** (optional):
   - Use a contracts-enabled parachain (e.g., Astar, Aleph Zero)
   - Update RPC URL and contract address in frontend
   - Use real accounts with testnet tokens

3. **Production deployment**:
   - Set up proper environment variables
   - Use production-grade RPC endpoints
   - Secure API keys properly
   - Enable proper error monitoring

## Summary

The deployment process involves:
1. Building the ink! contract
2. Starting a local contracts node
3. Deploying the contract and saving the address
4. Wiring the frontend with metadata and env vars
5. Setting up the backend with AI API key
6. Starting both servers
7. Testing with a browser wallet

The main challenges were:
- Contract method resolution (solved with Abi class)
- SSR compatibility (solved with dynamic imports)
- Cargo toolchain requirements (solved with nightly)
- Command syntax issues (solved with correct argument order)

With this guide, you should be able to reproduce the deployment from scratch!

