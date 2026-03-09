# hodl-drive

A decentralized web3 storage solution built on top of [Arweave](https://www.arweave.org/) and [Bundlr Network](https://bundlr.network/).

## Overview

This is an experimental [nextjs](https://nextjs.org/docs) app that does the following:

- generates and manages [AES-GCM](https://www.cryptosys.net/pki/manpki/pki_aesgcmauthencryption.html) encryption keys
- encrypts and decrypts files on the client side
- uses the [Bundlr Network SDK](https://docs.bundlr.network/developer-docs/sdk) to upload encrypted files to [Arweave](https://www.arweave.org/)
- uses the [Bundlr Network GraphQL service](https://docs.bundlr.network/developer-docs/graphql) to query and retrieve uploads
- [Rainbowkit SDK](https://www.rainbowkit.com/) to allow users to connect their wallet and associate their uploads to a wallet address

## Prerequisites

This project includes a [Nix flake](https://nixos.wiki/wiki/Flakes) that provides all required dependencies (Node.js, pnpm, Chromium for E2E tests). Enter the dev shell with:

```bash
nix develop
```

If you're not using Nix, make sure you have Node.js and pnpm installed.

## Installing and Running

1. Install dependencies:

    ```bash
    pnpm install
    ```

2. Run app:

    > Note: This project uses [doppler](https://www.doppler.com/) to manage secrets and config variables but you can also just create `.env` file to manage environment variables. The `pnpm doppler-dev` script has been added for usage with doppler.

    ```bash
    source .env
    pnpm dev

    # or if you configured doppler
    pnpm doppler-dev
    ```

## Testing

### Unit Tests

Unit tests use [Vitest](https://vitest.dev/) and cover utilities, API routes, and the encryption key context.

```bash
pnpm test              # run once
pnpm test:watch        # watch mode
pnpm test:coverage     # with coverage report
```

### E2E Tests

E2E tests use [Playwright](https://playwright.dev/) with Chromium and cover full user flows across pages — navigation, key management, uploads, wallet-gated interactions, and cross-page state persistence.

```bash
pnpm test:e2e          # headless
pnpm test:e2e:ui       # interactive UI mode
```

#### Playwright Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `PLAYWRIGHT_CHROMIUM_PATH` | Path to a Chromium executable. Required on NixOS since Playwright's bundled Chromium won't work. | Playwright's bundled Chromium |
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | Set to `1` to skip downloading Playwright's bundled browsers. | unset |

The Nix dev shell (`nix develop`) sets both of these automatically. On non-NixOS systems, Playwright's bundled Chromium is used by default and no extra configuration is needed.

The Playwright config also injects test-specific values for `NEXT_PUBLIC_*` env vars so E2E tests don't require a `.env` file.
