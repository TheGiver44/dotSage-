#!/bin/bash

# DotSage Startup Script
# This script starts both the backend and frontend servers

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting DotSage...${NC}"

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/app"

# Check if backend .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: Backend .env file not found.${NC}"
    echo -e "${YELLOW}   Create $BACKEND_DIR/.env with GROQ_API_KEY=your_key${NC}"
    echo -e "${YELLOW}   Continuing anyway...${NC}"
fi

# Check if contracts node is running
CONTRACTS_NODE_RUNNING=false
if lsof -ti:9944 > /dev/null 2>&1; then
    CONTRACTS_NODE_RUNNING=true
    echo -e "${GREEN}✅ Contracts node detected on port 9944${NC}"
else
    echo -e "${YELLOW}⚠️  Contracts node not detected on port 9944${NC}"
    echo -e "${YELLOW}   To start the contracts node, run in a separate terminal:${NC}"
    echo -e "${YELLOW}   ${NC}substrate-contracts-node --dev --tmp"
    echo -e "${YELLOW}   Or install it first:${NC}"
    echo -e "${YELLOW}   ${NC}cargo +nightly install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --tag v0.42.0"
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}📦 Starting backend server (port 8788)...${NC}"
cd "$BACKEND_DIR"
npm run dev > /tmp/dotsage-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}   Backend PID: $BACKEND_PID${NC}"

# Wait a bit for backend to start
sleep 2

# Start frontend
echo -e "${GREEN}🌐 Starting frontend server (port 3000)...${NC}"
cd "$FRONTEND_DIR"
npm run dev > /tmp/dotsage-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   Frontend PID: $FRONTEND_PID${NC}"

# Wait a bit for frontend to start
sleep 3

echo -e "\n${GREEN}✅ DotSage is running!${NC}"
echo -e "${GREEN}   Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}   Backend:  http://localhost:8788${NC}"
if [ "$CONTRACTS_NODE_RUNNING" = false ]; then
    echo -e "${YELLOW}   ⚠️  Contracts node: NOT RUNNING${NC}"
    echo -e "${YELLOW}      Start it in another terminal: substrate-contracts-node --dev --tmp${NC}"
else
    echo -e "${GREEN}   Contracts node: Running on ws://127.0.0.1:9944${NC}"
fi
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

