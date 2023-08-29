const SCHEMA_VERSION = "1.0";
const UPLOADER_ADDRESS = process.env.APP_UPLOADER_ADDRESS as string;
const CRYPTO_ALGORITHM = "AES-GCM";
const INDEXED_DB_OBJECT_ID = "encryptionKey";
const INDEXED_DB_NAME = process.env.NEXT_PUBLIC_INDEXED_DB_NAME as string;
const INDEXED_DB_OBJECT_STORE = process.env
  .NEXT_PUBLIC_INDEXED_DB_OBJECT_STORE as string;
const WALLET_CONNECT_PROJECT_NAME = process.env
  .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME as string;
const WALLET_CONNECT_PROJECT_ID = process.env
  .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;
const GITHUB_USERNAME = process.env.NEXT_PUBLIC_APP_GITHUB_USERNAME as string;

export const config = {
  CRYPTO_ALGORITHM,
  GITHUB_USERNAME,
  INDEXED_DB_NAME,
  INDEXED_DB_OBJECT_STORE,
  INDEXED_DB_OBJECT_ID,
  SCHEMA_VERSION,
  WALLET_CONNECT_PROJECT_NAME,
  WALLET_CONNECT_PROJECT_ID,
  UPLOADER_ADDRESS,
};

export * from "./bundlr";
