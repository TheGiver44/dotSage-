# DotSage On-Chain Setup Guide (Questions + Logging)

Follow these steps to make on-chain questions and logging work end-to-end.

## 1) Prerequisites
- Wallet extension installed (Polkadot.js Extension, SubWallet, or Talisman).
- Rust and cargo-contract set up for ink!:
  - rustup toolchain (stable + nightly)
  - cargo-contract per Polkadot docs
- Node with package manager (use nvm if needed).
- A contracts-enabled network endpoint (examples below).

Recommended test networks:
- Westend (for Substrate/Polkadot testnet accounts with contracts)
- A contracts-enabled parachain endpoint (e.g., a local node or public test endpoint)

## 2) Build the ink! Contract
From the repository root:
```bash
cd dotsage/contracts
cargo contract build
```
Artifacts (address may vary):
- `target/ink/dotsage_questions.wasm`
- `target/ink/metadata.json`

If you run into build errors, ensure `cargo-contract` is up-to-date and your toolchains match the ink! docs.

## 3) Deploy the Contract
Use either:
- Polkadot.js Apps UI → Contracts → Upload & Instantiate
- Or `cargo contract upload/instantiate` on a local node

Record:
- Deployed contract address (e.g., `5F...` SS58-formatted address)
- `metadata.json` content

Tip: For Westend you’ll need test funds. Use a faucet or dev account on a local node.

## 4) Wire the Frontend
Edit `dotsage/app/src/lib/polkadot.ts`:
1. Set your WebSocket endpoint and contract address in `getDefaultConfig()`:
   - `wsUrl`: your chain RPC (e.g., `wss://westend-rpc.polkadot.io` or your local node)
   - `contractAddress`: your deployed contract address from Step 3
2. Provide the actual contract metadata where `CONTRACT_METADATA` is defined.
   - Replace the placeholder with the JSON from `target/ink/metadata.json`.
   - Keep the structure intact.

Example (pseudocode):
```ts
// dotsage/app/src/lib/polkadot.ts
const CONTRACT_METADATA = {
  // Paste metadata.json content here
};

function getDefaultConfig() {
  return {
    wsUrl: "wss://westend-rpc.polkadot.io",
    contractAddress: "5Fxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  };
}
```

Important:
- Do not commit secrets. This metadata is safe to commit; it is part of the contract interface.
- Wallet and signing occur in the browser only; SSR is guarded.

## 5) Run the App
Backend (port 8788 with CORS enabled):
```bash
cd dotsage/backend
PORT=8788 npm run dev
```
Frontend:
```bash
cd dotsage/app
npm run dev
```
Open `http://localhost:3000`.

## 6) Validate the Flow
1. Open the Ask page.
2. Enter a question and pick a category.
3. Click “Get Answer” (backend stub returns a placeholder answer + sources).
4. Click “Log this question to Polkadot”.
   - Your wallet will prompt to sign the `ask_question` extrinsic.
   - On success, the UI shows a tx hash.
5. Go to Explore page.
   - Recent questions load via `get_questions`.
6. Vote on a question.
   - Wallet will prompt to sign the `vote` extrinsic.

If you see errors:
- “No wallet extension found”: Install/enable the extension and refresh.
- “Failed to log on-chain”: Ensure the `wsUrl` and `contractAddress` are correct, and the contract ABI matches the deployed code (metadata).
- “Query returns empty”: Confirm you deployed to the same network the frontend connects to and the contract storage has data.

## 7) Optional: Switch Networks
Update `getDefaultConfig()` with a different RPC and address. Re-deploy the contract to that chain and paste the new address.

## 8) Troubleshooting
- Weight/Gas: If extrinsics fail, increase the `WeightV2` `refTime` values slightly in `polkadot.ts`.
- Metadata mismatch: Ensure the metadata you pasted corresponds exactly to the deployed wasm.
- Extension account selection: If multiple extensions are present, adjust selection logic to choose a specific account/source.

## 9) What’s On-Chain vs Off-Chain
- On-chain: question id, author, truncated question text (<=256 chars), category, timestamp, upvotes/downvotes.
- Off-chain: full AI answer text and detailed sources (kept in backend/browser to avoid state bloat).

## 10) Final Demo Checklist
- Ask → Answer shows up
- “Log question” succeeds with tx hash
- Explore lists recent questions
- Voting updates counts (and shows success toast or optimistic UI)
- Open console/explorer link to show the transaction if desired

That’s it. Once the metadata and address are wired, the end-to-end logging and voting flow is live for demos. 


