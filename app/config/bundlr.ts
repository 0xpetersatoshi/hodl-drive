import Bundlr from "@bundlr-network/client";

const PRIVATE_KEY = process.env.APP_PRIVATE_KEY;
const NETWORK = "https://devnet.bundlr.network";
const PROVIDER_URL = "https://rpc-mumbai.maticvigil.com";
const CURRENCY = "matic";

export const GRAPHQL_ENDPOINT = `${NETWORK}/graphql`;

// Initailze the bundlr SDK
export const bundlr = new Bundlr(NETWORK, CURRENCY, PRIVATE_KEY, {
  providerUrl: PROVIDER_URL,
});
