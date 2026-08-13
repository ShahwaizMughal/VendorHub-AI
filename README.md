# VendorHub AI

AI-powered B2B sourcing platform built with the MERN Stack.

> Find the Right Supplier. Faster. Smarter.

See `docs/VendorHub_AI_SRS.md` for the full specification and `docs/PHASE_1_REPORT.md` for the current integration status — this README covers setup only.

## Repository layout

```
VendorHub-AI/
├── client/     # React (Vite) SPA
├── server/     # Express REST API
├── shared/     # constants.js shared by client & server
├── docs/       # SRS + phase integration reports
└── .env.example  (lives at repo root — see note below)
```

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongod` or MongoDB Atlas)

### 1. Environment variables

There is **one** `.env` file, at the **repo root** (not inside `server/`) — `server/src/config/env.js` resolves it three directories up.

```bash
cp .env.example .env
# then fill in at minimum: MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

The client has its own separate env file:
```bash
cp client/.env.example client/.env
```

### 2. Install & run the server

```bash
cd server
npm install
npm run dev      # http://localhost:5000
```

### 3. Install & run the client

```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

### 4. Lint & test

```bash
cd server && npm run lint && npm test
cd client && npm run lint && npm run build
```

**Note on `npm test`:** the DB-backed integration tests use `mongodb-memory-server`, which downloads a `mongod` binary on first run. This requires normal internet access — it works on a standard dev machine or CI runner, but will fail/hang in network-restricted sandboxes. The middleware unit tests (`src/middleware/__tests__`) have no such dependency and always run.

## Current integration status

This repo is being brought into full SRS compliance in tracked phases. See `docs/PHASE_1_REPORT.md` (and later phase reports as they're added) for exactly what's implemented, what's integrated, what's tested, and what's still outstanding — don't assume "code exists somewhere" means "it's wired up and working." Phase 0/1 found several cases where it wasn't.

Per-developer implementation notes some contributors left behind are preserved as-is: see `README-DEV4.md`.
