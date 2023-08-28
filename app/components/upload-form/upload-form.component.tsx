import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useEncryptionKey } from "@/app/contexts/keys";
import Transaction from "../transaction/transaction.component";
import { encryptData, encryptDataInChunks } from "@/app/utils";
import { config } from "@/app/config";
import { ArweaveData } from "@/app/types";
import Loading from "@/app/loading";

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [contentType, setContentType] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { keyBuffer } = useEncryptionKey();
  const { address, isConnecting, isDisconnected } = useAccount();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setFilename(file.name);
      setContentType(file.type);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

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

      if (file && keyBuffer) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async () => {
          const dataBuffer = new Uint8Array(reader.result as ArrayBuffer);
          const encryptedFileData = await encryptDataInChunks(
            dataBuffer,
            keyBuffer
          );

          const metadata = JSON.stringify({ filename, contentType });
          const metadataBuffer = new TextEncoder().encode(metadata);
          const encryptedMetadata = await encryptData(
            metadataBuffer,
            keyBuffer
          );

          const arweaveData: ArweaveData = {
            file: {
              chunks: encryptedFileData,
            },
            metadata: encryptedMetadata,
            schemaVersion: config.SCHEMA_VERSION,
          };

          const response = await fetch("/api/v0/upload", {
            method: "POST",
            body: JSON.stringify({
              data: JSON.stringify(arweaveData),
              address,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const jsonResponse = await response.json();
          console.log(`response: ${JSON.stringify(jsonResponse, null, " ")}`);

          if (jsonResponse.id) {
            setTransactionId(jsonResponse.id);
          }
        };
      } else {
        const message = "No file to upload.";
        alert(message);
        throw new Error(message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFilename("");
    setContentType("");
    setTransactionId(null);
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : transactionId ? (
        <div>
          <Transaction id={transactionId} />
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              onClick={resetForm}
              className="bg-blue-600 text-white hover:bg-blue-700 w-40 py-1 rounded"
            >
              Upload Another
            </button>
            <Link href="/uploads">
              <button className="bg-blue-600 text-white hover:bg-blue-700 w-40 py-1 rounded">
                View All Uploads
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="dark:bg-gray-900 flex flex-col items-center justify-between p-4 rounded text-white">
          <form
            action=""
            onSubmit={handleUpload}
            className="flex flex-col items-center justify-between"
          >
            <input
              type="file"
              className="bg-gray-700 px-2 py-1 rounded text-white m-2"
              onChange={handleFileChange}
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
