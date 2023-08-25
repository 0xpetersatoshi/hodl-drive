import { useState } from "react";
import { useAccount } from "wagmi";
import { useEncryptionKey } from "@/app/contexts/keys";
import { config } from "@/app/config";
import SingleTransaction from "../transaction/transaction.component";
import { encryptData } from "@/app/utils";

const UploadForm = () => {
  const [data, setData] = useState("");
  const [filename, setFilename] = useState("");
  const [contentType, setContentType] = useState("text/plain");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { keyBuffer } = useEncryptionKey();
  const { address, isConnecting, isDisconnected } = useAccount();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      const encryptedFileData = await encryptData(data, keyBuffer);
      const encryptedMetadata = await encryptData(
        JSON.stringify({
          filename,
          contentType,
        }),
        keyBuffer
      );

      const dataToUpload = {
        file: encryptedFileData,
        metadata: encryptedMetadata,
      };

      const response = await fetch("/api/v0/upload", {
        method: "POST",
        body: JSON.stringify({
          data: JSON.stringify(dataToUpload),
          address,
          contentType,
        }),
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
          <form
            action=""
            onSubmit={handleUpload}
            className="flex flex-col items-center justify-between"
          >
            <input
              type="text"
              className="bg-gray-800 px-2 py-1 rounded text-white placeholder-gray-500 focus:ring focus:ring-opacity-50 focus:ring-gray-600 m-2"
              placeholder="Add data to your Drive"
              onChange={(e) => setData(e.target.value)}
              required
            />

            <input
              type="text"
              className="bg-gray-800 px-2 py-1 rounded text-white placeholder-gray-500 focus:ring focus:ring-opacity-50 focus:ring-gray-600 m-2"
              placeholder="Enter a filename"
              onChange={(e) => setFilename(e.target.value)}
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700 mt-2 px-12 py-1 rounded"
            >
              Upload data
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
