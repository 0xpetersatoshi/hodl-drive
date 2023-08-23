import Bundlr from "@bundlr-network/client";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NETWORK = "https://devnet.bundlr.network";
const PROVIDER_URL = "https://rpc-mumbai.maticvigil.com";
const CURRENCY = "matic";
const AMOUNT_TO_FUND = 0.5;

export const GRAPHQL_ENDPOINT = `${NETWORK}/graphql`;

// Initailze the bundlr SDK
export const bundlr = new Bundlr(NETWORK, CURRENCY, PRIVATE_KEY, {
  providerUrl: PROVIDER_URL,
});

// Convert to atomic units
const fundAmountAtomic = bundlr.utils.toAtomic(AMOUNT_TO_FUND);

export const fundNode = async () => {
  const fundTx = await bundlr.fund(fundAmountAtomic);
  console.log(fundTx);
};
