# hodl-drive

A decentralized web3 storage solution built on top of [Arweave](https://www.arweave.org/) and [Bundlr Network](https://bundlr.network/).

## Overview

This is an experimental [nextjs](https://nextjs.org/docs) app that does the following:

- generates and manages [AES-GCM](https://www.cryptosys.net/pki/manpki/pki_aesgcmauthencryption.html) encryption keys
- encrypts and decrypts files on the client side
- uses the [Bundlr Network SDK](https://docs.bundlr.network/developer-docs/sdk) to upload encrypted files to [Arweave](https://www.arweave.org/)
- uses the [Bundlr Network GraphQL service](https://docs.bundlr.network/developer-docs/graphql) to query and retrieve uploads
- [Rainbowkit SDK](https://www.rainbowkit.com/) to allow users to connect their wallet and associate their uploads to a wallet address

## Installing and Running

1. Install dependencies:

    ```{bash}
    yarn install
    ```

2. Run app:

    > Note: This project uses [doppler](https://www.doppler.com/) to manage secrets and config variables but you can also just create `.env` file to manage environment variables. The `yarn doppler-dev` script has been added for usage with doppler.

    ```{bash}
    source .env
    yarn dev

    # or if you configured doppler
    yarn doppler-dev
    ```
