import { config } from "@/app/config";
import { UploadData } from "@/app/types";

const decryptData = async (
  encryptedData: string,
  iv: string,
  keyBuffer: Uint8Array
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
      keyBuffer,
      config.CRYPTO_ALGORITHM,
      true,
      ["decrypt"]
    );

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: config.CRYPTO_ALGORITHM,
        iv: ivBuffer,
      },
      cryptoKey,
      encryptedDataBuffer
    );

    return new Uint8Array(decryptedBuffer);
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

const encryptData = async (
  dataBuffer: Uint8Array,
  keyBuffer: Uint8Array
): Promise<UploadData> => {
  try {
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      config.CRYPTO_ALGORITHM,
      true,
      ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: config.CRYPTO_ALGORITHM,
        iv: iv,
      },
      cryptoKey,
      dataBuffer
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const base64Encrypted = btoa(String.fromCharCode(...encryptedArray));

    const base64Iv = btoa(String.fromCharCode(...iv));

    return { data: base64Encrypted, iv: base64Iv };
  } catch (error: any) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

export { decryptData, encryptData };
