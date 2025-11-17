<div align="center">

# 🤖 DotSage
### AI-Powered Polkadot Learning Chatbot

**Bring Web2 Applications to Web3**

[![Polkadot](https://img.shields.io/badge/Built%20on-Polkadot-E6007A?style=for-the-badge&logo=polkadot)](https://polkadot.network)
[![ink!](https://img.shields.io/badge/Smart%20Contracts-ink!-FF4081?style=for-the-badge)](https://use.ink/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

**Ask anything about Polkadot. Get AI-generated answers grounded in official docs. Log questions on-chain. Vote and explore trending topics.**

[Demo Videos](#-demo-videos) • [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture)

</div>

---

## 🎬 Demo Videos

<div align="center">

### Watch DotSage in Action

[![Demo Video 1](https://img.youtube.com/vi/4JksX48qTH8/0.jpg)](https://youtu.be/4JksX48qTH8)
[![Demo Video 2](https://img.youtube.com/vi/9obNyBCh7iY/0.jpg)](https://youtu.be/9obNyBCh7iY)
[![Demo Video 3](https://img.youtube.com/vi/G5wayIs7jts/0.jpg)](https://youtu.be/G5wayIs7jts)

*Click on any thumbnail to watch the full demo*

</div>

---

## 📸 Screenshots

<div align="center">

### Landing Page
![Landing Page](./assets/images/Screenshot%202025-11-16%20at%2015.35.01.png)

### Ask Questions & Get AI Answers
![Ask Page](./assets/images/Screenshot%202025-11-16%20at%2015.34.52.png)

### Explore On-Chain Questions
![Explore Page](./assets/images/Screenshot%202025-11-16%20at%2015.08.34.png)

### Wallet Integration
![Wallet Integration](./assets/images/Screenshot%202025-11-16%20at%2010.28.01.png)

</div>

---

## 🎯 Problem

Polkadot has powerful tech but a **steep learning curve**. Knowledge is scattered across docs, forums, and threads, making it difficult for newcomers and even builders to find clear answers.

> *"Polkadot's learning curve and fragmented knowledge"* - This is exactly what DotSage solves.

## ✨ Solution

DotSage is an **AI chatbot grounded in Polkadot docs** with on-chain question logging and voting:

1. **Ask** → Get AI-generated answers with links to official sources
2. **Log** → Store questions permanently on-chain via ink! smart contracts
3. **Vote** → Community votes on answer usefulness
4. **Explore** → Discover trending questions and community insights

---

## 🏆 Hackathon: Bring Web2 Applications to Web3

<div align="center">

![Hackathon Banner](./assets/promo-bts/hackatho.png)

</div>

### About the Hackathon

One of Web3's key promises is to deliver a **decentralized and fair internet** where users control their own data, identity, and destiny. So far, the smart contracts-driven Web3 applications centered around cryptocurrency, payments, decentralized finance, and memes have dominated the Web3 and Blockchain technology narrative. 

**Polkadot is set out to expand Web3's horizons** through its Rust-powered SDK and Web3 Cloud architecture.

In this **6-week hackathon**, use any of the Polkadot ecosystem's SDKs, APIs, Tools, and Infrastructure to build apps or proofs of concept to compete for a **$40K prize pool**. 

**Our motto: *radically open, radically useful.***

### Hackathon Themes

<div align="center">

| 🎨 User-centric Apps | ⛓️ Build a Blockchain | 🔧 Polkadot Tinkerers |
|:---:|:---:|:---:|
| Build apps that prioritize the user's interests and have real-world impact using the decentralized Polkadot Technology Stack | Seamlessly build and deploy custom blockchains to the Polkadot Cloud for novel Web3 use cases | Tinker with Polkadot's libraries, apps, privacy tech, on-chain compute, and cross-chain magic |

</div>

**DotSage fits perfectly into the "User-centric Apps" theme**, making Polkadot knowledge accessible to everyone through AI and on-chain community feedback.

---

## 🚀 Features

- 🤖 **AI-Powered Answers** - Get concise, source-linked answers powered by Groq's LLM
- ⛓️ **On-Chain Storage** - Questions and votes stored permanently on Polkadot via ink! smart contracts
- 🗳️ **Community Voting** - Vote on answer usefulness and surface trending questions
- 🔍 **Explore Trending** - Discover what the community finds confusing
- 💼 **Wallet Integration** - Seamless connection with Polkadot.js Extension, Talisman, and more
- 📚 **Grounded in Docs** - Answers are grounded in official Polkadot documentation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Landing Page │  │  Ask Page    │  │ Explore Page  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│         ┌──────────────────▼──────────────────┐             │
│         │   @polkadot/api & api-contract      │             │
│         │   Wallet Integration                │             │
│         └──────────────────┬──────────────────┘             │
└────────────────────────────┼─────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                      │
        ▼                    ▼                      ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Backend API  │   │ ink! Contract │   │  Polkadot.js  │
│  (Node/TS)    │   │  (Rust/WASM) │   │   Extension   │
│               │   │               │   │               │
│  • Groq LLM   │   │  • Questions  │   │  • Signing    │
│  • Doc Search │   │  • Votes      │   │  • Accounts   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Tech Stack

<div align="center">

| Layer | Technology |
|:---:|:---|
| **Frontend** | Next.js 14, React, TypeScript |
| **Blockchain** | @polkadot/api, @polkadot/api-contract |
| **Smart Contracts** | ink! (Rust), WebAssembly |
| **Backend** | Node.js, Express, TypeScript |
| **AI** | Groq API (Llama 3.3) |
| **Wallet** | Polkadot.js Extension, Talisman |

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Rust** + `cargo-contract` for ink! (follow [Polkadot docs](https://docs.substrate.io/))
- **Node.js** v18+ (use `nvm` to match your environment)
- **Polkadot.js Extension** ([Install here](https://polkadot.js.org/extension/))
- **GROQ_API_KEY** ([Get free key](https://console.groq.com/))

### 🎯 One-Command Start (Recommended)

```bash
cd dotsage
./start.sh
```

This will start:
- ✅ Backend server on http://localhost:8788
- ✅ Frontend server on http://localhost:3000

Press `Ctrl+C` to stop both servers.

### 📦 Manual Setup

#### 1. Install Dependencies

```bash
# Frontend
cd dotsage/app
npm install

# Backend
cd ../backend
npm install
```

#### 2. Configure Backend

Create `dotsage/backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8788
```

#### 3. Deploy Smart Contract

```bash
cd dotsage/contracts
cargo +nightly contract build
cargo +nightly contract instantiate --suri "//Alice" --constructor new --url ws://127.0.0.1:9944 target/ink/dotsage_questions.contract
```

See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

#### 4. Configure Frontend

Create `dotsage/app/.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:9944
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
```

#### 5. Start Servers

```bash
# Terminal 1: Backend
cd dotsage/backend
npm run dev

# Terminal 2: Frontend
cd dotsage/app
npm run dev
```

---

## 📁 Project Structure

```
dotsage/
├── 📱 app/                    # Next.js frontend
│   ├── src/
│   │   ├── pages/            # Routes (index, ask, explore)
│   │   ├── lib/              # Polkadot integration
│   │   └── styles/           # Global styles
│   └── package.json
├── ⚙️ backend/                # Express API server
│   ├── src/
│   │   ├── index.ts          # API routes
│   │   └── llm.ts            # Groq AI integration
│   └── package.json
├── 🔷 contracts/              # ink! smart contracts
│   ├── lib.rs                # Contract logic
│   └── Cargo.toml
├── 📸 assets/                # Images and screenshots
│   ├── images/               # App screenshots
│   └── promo-bts/            # Hackathon assets
├── 📚 docs/                  # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── ONCHAIN_SETUP.md
│   └── GROQ_PRICING_GUIDE.md
└── 🚀 start.sh               # Startup script
```

---

## 🔗 How It Uses Polkadot

<div align="center">

![Polkadot Integration](./assets/promo-bts/polkadot-asset-hub.png)

</div>

- **ink! Smart Contracts** - Deployed on contracts-enabled Polkadot SDK chains (Westend, parachains)
- **@polkadot/api** - Frontend integration for reading/writing contract state
- **@polkadot/api-contract** - Contract method calls and queries
- **Wallet Integration** - Polkadot.js Extension, Talisman, SubWallet support
- **On-Chain Storage** - Questions, votes, and metadata stored permanently on-chain

### Supported Wallets

<div align="center">

![Polkadot.js Extension](./assets/promo-bts/polkadotJS-extension.png)
![Talisman](./assets/promo-bts/talisman.png)
![Polkadot Wallets](./assets/promo-bts/polkadot-wallets.png)

</div>

---

## 🛠️ Development

### Running Locally

1. **Start contracts node** (if testing locally):
   ```bash
   substrate-contracts-node --dev --tmp
   ```

2. **Deploy contract** (see [ONCHAIN_SETUP.md](./docs/ONCHAIN_SETUP.md))

3. **Start backend**:
   ```bash
   cd dotsage/backend
   npm run dev
   ```

4. **Start frontend**:
   ```bash
   cd dotsage/app
   npm run dev
   ```

### Environment Variables

**Backend** (`dotsage/backend/.env`):
```env
GROQ_API_KEY=your_groq_api_key
PORT=8788
```

**Frontend** (`dotsage/app/.env.local`):
```env
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:9944
NEXT_PUBLIC_CONTRACT_ADDRESS=5F...
```

---

## 📖 Documentation

- 📘 [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Complete setup instructions
- ⛓️ [On-Chain Setup](./docs/ONCHAIN_SETUP.md) - Contract deployment guide
- 💰 [Groq Pricing Guide](./docs/GROQ_PRICING_GUIDE.md) - AI API costs

---

## 🎯 Future Work

- [ ] OpenGov integration for canonical answer proposals
- [ ] Better search/ranking and broader document coverage
- [ ] Multi-language support
- [ ] Full doc crawler instead of static snippets
- [ ] Real-time question notifications
- [ ] Answer quality scoring system

---

## 🤝 Contributing

This project was built for the Polkadot Hackathon. Contributions, issues, and feature requests are welcome!

---

## 📄 License

This project is part of the Polkadot Hackathon submission.

---

## 🙏 Acknowledgments

- **Polkadot** - For the amazing SDK and infrastructure
- **ink!** - For making smart contracts accessible
- **Groq** - For fast and affordable AI inference
- **Polkadot.js** - For excellent developer tools

---

<div align="center">

**Built with ❤️ for the Polkadot Hackathon**

[Demo Videos](#-demo-videos) • [Quick Start](#-quick-start) • [Documentation](./docs/DEPLOYMENT_GUIDE.md)

</div>
