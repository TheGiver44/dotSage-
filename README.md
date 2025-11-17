# DotSage (AI-Powered Polkadot Learning Chatbot)

DotSage helps users ask anything about Polkadot and get AI-generated answers grounded in official docs and ecosystem resources. Logged questions and community votes are stored on-chain via an ink! smart contract, creating a durable, queryable corpus of what the community finds confusing.

## Problem
Polkadot has powerful tech but a steep learning curve. Knowledge is scattered across docs, forums, and threads, making it difficult for newcomers and even builders to find clear answers.

## Solution
An AI chatbot grounded in Polkadot docs with on-chain question logging and voting:
- Ask a question → get an AI answer with links to sources.
- Log the question on-chain.
- Community votes on answer usefulness and surfaces trending questions.

## How It Uses Polkadot
- ink! smart contract on a contracts-enabled Polkadot SDK chain (e.g., Westend or a parachain) to store questions and vote counts.
- `@polkadot/api` and `@polkadot/api-contract` in the frontend to read/write contract state.
- Optional OpenGov linkages for governance-related questions.

## Architecture
- Frontend (Next.js/React)
  - Landing page with hackathon information and app overview.
  - Ask screen (chat-like UI), Explore screen (trending questions).
  - Wallet connection via Polkadot.js extension-compatible wallets.
  - Contract interactions for logging questions and voting.
- Backend (Node/TypeScript)
  - Retrieves static doc snippets for grounding.
  - Calls an LLM to produce concise, source-linked answers.
- Smart Contract (ink!)
  - Stores compact question data and aggregate vote counts.
  - Simple getters and pagination for Explore/Trending.

## Tech Stack
- Frontend: Next.js, TypeScript, `@polkadot/api`, `@polkadot/api-contract`
- Backend: Node.js, TypeScript, Express/Fastify (Express in MVP)
- Contracts: ink! (Rust)

## Getting Started

Requirements:
- Rust + cargo-contract for ink! (follow Polkadot docs)
- Node.js (use `nvm` to match your environment)
- pnpm or npm for installing dependencies

Repository structure:
```
dotsage/
  contracts/
    Cargo.toml
    lib.rs
  app/
    package.json
    tsconfig.json
    next.config.js
    src/
      pages/
        index.tsx
        explore.tsx
      lib/
        polkadot.ts
        api.ts
  backend/
    package.json
    tsconfig.json
    src/
      index.ts
      llm.ts
      docs/
        README.md
```

Contract deploy (high-level):
1. Install `cargo-contract` per Polkadot docs.
2. Build: `cargo contract build`
3. Deploy to your chosen chain (e.g., Westend or a contract-enabled parachain).
4. Record the deployed contract address for the frontend.

### Quick Start (Recommended)

Use the startup script to run both frontend and backend:

```bash
cd dotsage
./start.sh
```

This will start:
- Backend server on http://localhost:8788
- Frontend server on http://localhost:3000

Press `Ctrl+C` to stop both servers.

### Manual Start

Frontend:
1. `cd dotsage/app`
2. `pnpm install` (or `npm install`)
3. `pnpm dev` (or `npm run dev`)

Backend:
1. `cd dotsage/backend`
2. `npm install` (or `pnpm install`)
3. Set `GROQ_API_KEY` environment variable (see below)
4. `npm run dev` (or `pnpm dev`)

Environment (backend):
- **GROQ_API_KEY**: Get a free API key from https://console.groq.com/
  - Create an account and generate an API key
  - Set it in your environment: `export GROQ_API_KEY=your_key_here`
  - Or create a `.env` file in `dotsage/backend/` with: `GROQ_API_KEY=your_key_here`
  - **Never commit `.env` files or API keys to the repository**

## Future Work
- OpenGov integration for canonical answer proposals.
- Better search/ranking and broader document coverage.
- Multi-language.
- Full doc crawler instead of static snippets.

## Devpost Draft (Skeleton)
- Inspiration: Polkadot’s learning curve and fragmented knowledge.
- What it does: Ask → Answer → Log-on-chain → Vote → Explore trending.
- How we built it: Next.js + polkadot.js + ink! + Node TypeScript backend.
- Challenges: Compact on-chain data models, traceable sources, simple UX with Polkadot-native features.
- Accomplishments: End-to-end demo and reusable “AI + on-chain feedback loop” pattern.


