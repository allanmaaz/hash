# Consensus — Permissioned vs Permissionless Blockchains

Minimal, Apple-inspired interactive prototype comparing **Permissionless** and **Permissioned** blockchain architectures.

**Live Demo:** https://hash.allanmaazimdad.workers.dev  
**Repository:** https://github.com/allanmaaz/hash

---

## Features

- **Permissionless Simulator** — Open node entry (`+ Join Node`), Proof-of-Work mining (`00…` SHA-256 prefix), fork simulation, and probabilistic finality.
- **Permissioned Simulator** — Certificate Authority admission gate (`+ Request Access` → `Approve` / `Reject`), X.509 MSP identity inspection, leader rotation, and PBFT quorum finality.
- **Live SHA-256 Ledger** — Real Web Crypto `SHA-256` block chaining with inline tamper detection and cascading validation (`Re-seal`).
- **Architecture Matrix** — Side-by-side comparison with priority filters (`Public Audit`, `Data Privacy`, `High TPS`).
- **Adaptive Theme & Mobile-Ready** — Automatic light/dark mode (`color-scheme: light dark`) and responsive layout for desktop and mobile.

## Stack

- React 19 + Vite
- Web Crypto API (`SHA-256`)
- Cloudflare Workers Static Assets

## Run Locally

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
npx wrangler deploy
```
