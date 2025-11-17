#!/usr/bin/env bash
set -euo pipefail

# DotSage on-chain setup helper
# - Ensures Rust toolchains and cargo-contract
# - Builds the ink! contract
# - Copies metadata.json into the frontend
# - Optionally writes .env.local with RPC URL and contract address

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONTRACT_DIR="${ROOT_DIR}/dotsage/contracts"
FRONTEND_DIR="${ROOT_DIR}/dotsage/app"
METADATA_SRC="${CONTRACT_DIR}/target/ink/metadata.json"
METADATA_DST="${FRONTEND_DIR}/src/lib/contract_metadata.json"
ENV_FILE="${FRONTEND_DIR}/.env.local"

echo "==> Checking rustup..."
if ! command -v rustup >/dev/null 2>&1; then
  echo "Error: rustup is required. Install from https://rustup.rs/ and re-run."
  exit 1
fi

echo "==> Installing toolchains and target if missing..."
rustup toolchain install nightly --component rust-src || true
rustup target add wasm32-unknown-unknown --toolchain nightly || true

echo "==> Checking cargo-contract..."
if ! command -v cargo-contract >/dev/null 2>&1; then
  echo "Installing cargo-contract..."
  cargo +nightly install cargo-contract --force
fi

echo "==> Building ink! contract..."
cd "${CONTRACT_DIR}"
cargo +nightly contract build

if [ ! -f "${METADATA_SRC}" ]; then
  echo "Error: metadata.json not found at ${METADATA_SRC}"
  exit 1
fi

echo "==> Copying metadata to frontend..."
mkdir -p "$(dirname "${METADATA_DST}")"
cp "${METADATA_SRC}" "${METADATA_DST}"

echo "==> Optionally configure frontend environment (.env.local)"
read -r -p "Enter WS RPC URL (default: wss://westend-rpc.polkadot.io): " WS_URL
WS_URL="${WS_URL:-wss://westend-rpc.polkadot.io}"
read -r -p "Enter deployed contract address (leave blank to fill later): " CONTRACT_ADDRESS
CONTRACT_ADDRESS="${CONTRACT_ADDRESS:-}"

{
  echo "NEXT_PUBLIC_WS_URL=${WS_URL}"
  if [ -n "${CONTRACT_ADDRESS}" ]; then
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}"
  fi
} > "${ENV_FILE}"

echo "==> Done."
echo "Metadata copied to ${METADATA_DST}"
echo "Frontend env written to ${ENV_FILE}"
echo
echo "Next steps:"
echo "1) Deploy the built contract (use Polkadot.js Apps or cargo-contract)."
echo "2) If you didn't provide the address, update NEXT_PUBLIC_CONTRACT_ADDRESS in ${ENV_FILE} after deploy."
echo "3) Start backend:  cd ${ROOT_DIR}/dotsage/backend && PORT=8788 npm run dev"
echo "4) Start frontend: cd ${FRONTEND_DIR} && npm run dev"


