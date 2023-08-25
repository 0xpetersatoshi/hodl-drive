import { useState } from "react";
import { useAccount } from "wagmi";
import { useEncryptionKey } from "@/app/contexts/keys";
import { config } from "@/app/config";
import SingleTransaction from "../transaction/transaction.component";

const UploadForm = () => {
  const [data, setData] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { keyBuffer } = useEncryptionKey();
  const { address, isConnecting, isDisconnected } = useAccount();

  const encryptData = async (data: string) => {
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyBuffer as Uint8Array,
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

  const upload = async () => {
    try {
      if (isConnecting || isDisconnected) {
        const message =
          "Wallet is not connected. Please connect before uploading.";
        alert(message);
        throw new Error(message);
      }
      console.log(`connected address: ${address}`);

      if (!keyBuffer) {
        const message =
          "Key buffer is null; encryption key not generated or uploaded";
        alert(message);
        throw new Error(message);
      }

      const result = await encryptData(data);
      console.log("Encrypted Data:", result.encryptedData);
      console.log("IV:", result.iv);

      const response = await fetch("/api/v0/upload", {
        method: "POST",
        body: JSON.stringify({ data: JSON.stringify(result), address }),
        headers: { "Content-Type": "application/json" },
      });

      const jsonResponse = await response.json();
      console.log(`response: ${JSON.stringify(jsonResponse, null, " ")}`);

      if (jsonResponse.id) {
        setTransactionId(jsonResponse.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {transactionId ? (
        <SingleTransaction id={transactionId} />
      ) : (
        <div className="flex flex-col items-center justify-between bg-black p-4 rounded text-white">
          <input
            type="text"
            className="bg-gray-800 px-2 py-1 rounded text-white placeholder-gray-500 focus:ring focus:ring-opacity-50 focus:ring-gray-600"
            placeholder="Add data to your Drive"
            onChange={(e) => setData(e.target.value)}
          />

          <button
            className="bg-blue-600 text-white hover:bg-blue-700 mt-2 px-12 py-1 rounded"
            onClick={upload}
          >
            Upload data
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
