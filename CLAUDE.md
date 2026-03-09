# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — Start dev server (requires env vars via `source .env` or Doppler)
- `pnpm doppler-dev` — Start dev server with Doppler secrets injection
- `pnpm build` — Production build
- `pnpm lint` — Run ESLint (next lint, flat config via `eslint.config.mjs`)
- `pnpm test` — Run tests once (Vitest)
- `pnpm test:watch` — Run tests in watch mode
- `pnpm test:coverage` — Run tests with coverage report
- `pnpm test:e2e` — Run Playwright e2e tests

## Environment Variables

Server-side (prefixed with `APP_`):
- `APP_UPLOADER_ADDRESS` — Bundlr uploader wallet address
- `APP_PRIVATE_KEY` — Private key for Bundlr SDK transactions

Client-side (prefixed with `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_INDEXED_DB_NAME`, `NEXT_PUBLIC_INDEXED_DB_OBJECT_STORE` — IndexedDB config for encryption key storage
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME`, `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` — WalletConnect/RainbowKit config
- `NEXT_PUBLIC_APP_GITHUB_USERNAME` — GitHub username for sidebar footer link

## Architecture

Next.js 16 App Router project (Turbopack) with client-side encryption for decentralized file storage on Arweave via Bundlr Network. Uses `pnpm` as package manager.

### Tech Stack

- **Next.js 16** with Turbopack (React 19)
- **Tailwind CSS v4** — CSS-first config via `@import "tailwindcss"` in `globals.css`, no `tailwind.config.ts`
- **shadcn/ui** — Component library in `components/ui/`, configured via `components.json`
- **Lucide React** — Icon library (replaced Font Awesome)
- **next-themes** — Dark/light mode support via `ThemeProvider`
- **Wagmi v2 + RainbowKit v2 + Viem v2** — Wallet connection and blockchain interaction
- **@tanstack/react-query** — Required by Wagmi v2

### Layout: Google Drive-Style Sidebar

The app uses a sidebar + header + content area layout (inspired by Google Drive):

- `AppSidebar` (`app/components/app-sidebar.tsx`) — Left sidebar with nav links (Home, MyDrive, Upload, Manage Keys) and GitHub footer
- `AppHeader` (`app/components/app-header.tsx`) — Top header with sidebar trigger, ConnectButton, and dark/light mode toggle
- `SidebarProvider` + `SidebarInset` from shadcn sidebar component wraps the layout

### Data Flow

1. **Key Management**: User generates or uploads an AES-GCM-256 encryption key, stored in browser IndexedDB and shared via `EncryptionKeyContext`
2. **Upload**: Files are read as ArrayBuffer → compressed with pako (gzip) → encrypted in chunks (64KB) using Web Crypto API → JSON payload sent to `/api/v0/upload` → server-side Bundlr SDK uploads to Arweave devnet
3. **Download**: Transaction metadata fetched via Bundlr GraphQL → encrypted data fetched from `arweave.net` → chunks decrypted and decompressed client-side → file download triggered

### Provider Stack (app/layout.tsx)

`ThemeProvider` → `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` → `EncryptionKeyProvider` → `TooltipProvider` → `SidebarProvider` → page content

### Key Directories

- `app/api/v0/` — Next.js route handlers (server-side, interact with Bundlr SDK)
- `app/components/` — App-level React components (`*.component.tsx` naming for domain components, plain `.tsx` for layout)
- `components/ui/` — shadcn/ui components (Button, Card, Alert, Sidebar, etc.)
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `hooks/` — Custom hooks (e.g., `use-mobile.ts`)
- `app/contexts/keys.tsx` — EncryptionKey context (IndexedDB persistence)
- `app/config/` — App config constants and Bundlr SDK initialization (server-side Bundlr instance)
- `app/utils/` — Client-side crypto (encrypt/decrypt), compression (pako), and GraphQL query helper
- `app/graphql/` — Bundlr GraphQL query strings
- `app/types/` — TypeScript types organized by `api/` and `data/` subdirectories

### Routes

- `/` — Landing page with usage instructions (Card grid)
- `/keys` — Encryption key management (generate/upload/download)
- `/upload` — File upload form (requires wallet + encryption key)
- `/uploads` — List user's uploaded files by wallet address (responsive grid)

### API Endpoints

- `POST /api/v0/upload` — Upload encrypted data to Arweave via Bundlr (auto-funds wallet if needed)
- `GET /api/v0/upload/tx/[id]` — Get transaction details by Bundlr tx ID
- `GET /api/v0/uploads/address/[address]` — List transactions by wallet address (filtered by schemaVersion tag)

### Important Details

- Bundlr is configured for **devnet** (uploads are not permanent)
- Path alias `@/*` maps to project root
- Encryption uses Web Crypto API (AES-GCM) — all crypto operations happen client-side
- The server never sees unencrypted data; it only relays encrypted payloads to Bundlr
- Wallet connection supports mainnet, Polygon, Optimism, Arbitrum, Base, and Zora chains
- E2e tests use `window.__TEST_WALLET__` injection with wagmi `mock()` connector for wallet simulation
