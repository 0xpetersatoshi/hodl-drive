import { config } from "@/app/config";

const decryptData = async (
  encryptedData: string,
  iv: string,
  keyBuffer: Uint8Array
): Promise<string | null> => {
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

    // Convert decrypted ArrayBuffer to string
    const decryptedData = new TextDecoder().decode(
      new Uint8Array(decryptedBuffer)
    );
    return decryptedData;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

const encryptData = async (data: string, keyBuffer: Uint8Array) => {
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    config.CRYPTO_ALGORITHM,
    true,
    ["encrypt"]
  );

  const textBuffer = new TextEncoder().encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: config.CRYPTO_ALGORITHM,
      iv: iv,
    },
    cryptoKey,
    textBuffer
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const base64Encrypted = btoa(String.fromCharCode(...encryptedArray));

  const base64Iv = btoa(String.fromCharCode(...iv));

  return { encryptedData: base64Encrypted, iv: base64Iv };
};

export { decryptData, encryptData };
