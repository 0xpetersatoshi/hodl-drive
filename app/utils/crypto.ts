import { config } from "@/app/config";
import { UploadData } from "@/app/types";
import { compressData, decompressData } from ".";

const CHUNK_SIZE = 256 * 256;

// Helper to convert Uint8Array to a proper ArrayBuffer for Web Crypto API
// Required because TS 5.9 is strict about Uint8Array<ArrayBufferLike> vs ArrayBuffer
function toBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

const decryptData = async (
  encryptedData: string,
  iv: string,
  keyBuffer: Uint8Array,
  decompress = true
): Promise<Uint8Array> => {
  try {
    // Convert base64 encoded encrypted data and IV back to Uint8Array
    const encryptedDataBuffer = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );
    const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    // Import the encryption key into the Web Crypto API
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      toBuffer(keyBuffer),
      config.CRYPTO_ALGORITHM,
      true,
      ["decrypt"]
    );

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: config.CRYPTO_ALGORITHM,
        iv: toBuffer(ivBuffer),
      },
      cryptoKey,
      toBuffer(encryptedDataBuffer)
    );

    const data = new Uint8Array(decryptedBuffer);

    if (decompress) {
      return decompressData(data);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

const encryptData = async (
  dataBuffer: Uint8Array,
  keyBuffer: Uint8Array,
  compress = true
): Promise<UploadData> => {
  try {
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      toBuffer(keyBuffer),
      config.CRYPTO_ALGORITHM,
      true,
      ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const dataToEncrypt = compress ? compressData(dataBuffer) : dataBuffer;

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: config.CRYPTO_ALGORITHM,
        iv: toBuffer(iv),
      },
      cryptoKey,
      toBuffer(dataToEncrypt)
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const base64Encrypted = btoa(String.fromCharCode(...encryptedArray));

    const base64Iv = btoa(String.fromCharCode(...iv));

    return { data: base64Encrypted, iv: base64Iv };
  } catch (error: any) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

const encryptDataInChunks = async (
  dataBuffer: Uint8Array,
  keyBuffer: Uint8Array,
  compress = true
): Promise<UploadData[]> => {
  try {
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      toBuffer(keyBuffer),
      config.CRYPTO_ALGORITHM,
      true,
      ["encrypt"]
    );

    const chunkedData: UploadData[] = [];

    for (let i = 0; i < dataBuffer.length; i += CHUNK_SIZE) {
      const chunk = dataBuffer.subarray(i, i + CHUNK_SIZE);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const dataToEncrypt = compress ? compressData(chunk) : chunk;

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: config.CRYPTO_ALGORITHM,
          iv: toBuffer(iv),
        },
        cryptoKey,
        toBuffer(dataToEncrypt)
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);
      const base64Encrypted = btoa(String.fromCharCode(...encryptedArray));
      const base64Iv = btoa(String.fromCharCode(...iv));

      chunkedData.push({ data: base64Encrypted, iv: base64Iv });
    }

    return chunkedData;
  } catch (error: any) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

export { decryptData, encryptData, encryptDataInChunks };
