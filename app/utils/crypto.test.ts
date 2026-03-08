// Mock the config modules to prevent Bundlr SDK instantiation side effect
vi.mock("@/app/config/bundlr", () => ({
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

vi.mock("@/app/config", () => ({
  config: {
    CRYPTO_ALGORITHM: "AES-GCM",
  },
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

import { decryptData, encryptData, encryptDataInChunks } from "./crypto";

const generateKey = () => window.crypto.getRandomValues(new Uint8Array(32));

describe("encryptData / decryptData", () => {
  it("round-trips with compression", async () => {
    const key = generateKey();
    const original = new TextEncoder().encode("Hello, encrypted world!");
    const encrypted = await encryptData(original, key, true);
    const decrypted = await decryptData(encrypted.data, encrypted.iv, key, true);

    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });

  it("round-trips without compression", async () => {
    const key = generateKey();
    const original = new TextEncoder().encode("No compression here.");
    const encrypted = await encryptData(original, key, false);
    const decrypted = await decryptData(
      encrypted.data,
      encrypted.iv,
      key,
      false
    );

    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });

  it("fails to decrypt with wrong key", async () => {
    const key1 = generateKey();
    const key2 = generateKey();
    const original = new TextEncoder().encode("Secret data");
    const encrypted = await encryptData(original, key1, false);

    await expect(
      decryptData(encrypted.data, encrypted.iv, key2, false)
    ).rejects.toThrow("Decryption failed");
  });

  it("produces different ciphertext for same plaintext (random IVs)", async () => {
    const key = generateKey();
    const original = new TextEncoder().encode("Same input twice");
    const encrypted1 = await encryptData(original, key, false);
    const encrypted2 = await encryptData(original, key, false);

    expect(encrypted1.iv).not.toBe(encrypted2.iv);
    expect(encrypted1.data).not.toBe(encrypted2.data);
  });

  it("handles empty data", async () => {
    const key = generateKey();
    const original = new Uint8Array(0);
    const encrypted = await encryptData(original, key, false);
    const decrypted = await decryptData(
      encrypted.data,
      encrypted.iv,
      key,
      false
    );

    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });
});

describe("encryptDataInChunks", () => {
  const CHUNK_SIZE = 256 * 256; // 65536 bytes, matches source

  it("produces correct number of chunks", async () => {
    const key = generateKey();

    // Exactly 1 chunk
    const data1 = new Uint8Array(CHUNK_SIZE);
    const chunks1 = await encryptDataInChunks(data1, key, false);
    expect(chunks1).toHaveLength(1);

    // Just over 1 chunk -> 2 chunks
    const data2 = new Uint8Array(CHUNK_SIZE + 1);
    const chunks2 = await encryptDataInChunks(data2, key, false);
    expect(chunks2).toHaveLength(2);

    // Small data -> 1 chunk
    const data3 = new Uint8Array(100);
    const chunks3 = await encryptDataInChunks(data3, key, false);
    expect(chunks3).toHaveLength(1);
  });

  it("round-trips: encrypt in chunks, decrypt each, reassemble", async () => {
    const key = generateKey();
    // Create data spanning multiple chunks
    const original = new Uint8Array(CHUNK_SIZE * 2 + 500);
    // Fill in chunks to avoid getRandomValues 65536-byte limit
    for (let i = 0; i < original.length; i += 65536) {
      const end = Math.min(i + 65536, original.length);
      window.crypto.getRandomValues(original.subarray(i, end));
    }

    const chunks = await encryptDataInChunks(original, key, false);
    expect(chunks).toHaveLength(3);

    // Decrypt each chunk and reassemble
    const decryptedParts: Uint8Array[] = [];
    for (const chunk of chunks) {
      const part = await decryptData(chunk.data, chunk.iv, key, false);
      decryptedParts.push(part);
    }

    const totalLength = decryptedParts.reduce((sum, p) => sum + p.length, 0);
    const reassembled = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of decryptedParts) {
      reassembled.set(part, offset);
      offset += part.length;
    }

    expect(Array.from(reassembled)).toEqual(Array.from(original));
  });

  it("uses unique IVs for each chunk", async () => {
    const key = generateKey();
    const data = new Uint8Array(CHUNK_SIZE * 3);
    const chunks = await encryptDataInChunks(data, key, false);

    const ivs = chunks.map((c) => c.iv);
    const uniqueIvs = new Set(ivs);
    expect(uniqueIvs.size).toBe(ivs.length);
  });
});
