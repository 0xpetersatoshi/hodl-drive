import React, { useEffect, useState } from "react";
import { TransactionNode } from "@/app/types";
import { decryptData } from "@/app/utils";
import { useEncryptionKey } from "@/app/contexts/keys";
import type { ArweaveData, Metadata, UploadData } from "@/app/types";

type TransactionProps = {
  id: string;
};

const Transaction: React.FC<TransactionProps> = ({ id }) => {
  const [transaction, setTransaction] = useState<TransactionNode | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [encryptedFileData, setEncryptedFileData] = useState<UploadData | null>(
    null
  );
  const { keyBuffer } = useEncryptionKey();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/v0/upload/tx/${id}`, {
          next: { revalidate: 0 },
        });
        const jsonResponse = await response.json();

        if (response.status === 200) {
          const node = jsonResponse.data.transactions.edges[0].node;
          setTransaction(node);

          const arweaveResponse = await fetch(`https://arweave.net/${node.id}`);
          const arweaveData: ArweaveData = await arweaveResponse.json();
          const { data, iv } = arweaveData.metadata;

          // Decrypt the metadata
          const decryptedMetadataBuffer = await decryptData(
            data,
            iv,
            keyBuffer as Uint8Array
          );

          const decryptedMetadataString = new TextDecoder().decode(
            decryptedMetadataBuffer
          );
          const metadata = JSON.parse(decryptedMetadataString);
          setMetadata(metadata);

          // Save encrypted data from response
          setEncryptedFileData(arweaveData.file);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    };

    fetchTransaction();
  }, [id, keyBuffer]);

  const downloadFile = async () => {
    if (encryptedFileData && metadata) {
      try {
        const decryptedData = await decryptData(
          encryptedFileData.data,
          encryptedFileData.iv,
          keyBuffer as Uint8Array
        );

        // Create Blob from decrypted data
        const blob = new Blob([decryptedData.buffer], {
          type: metadata.contentType,
        });

        const link = document.createElement("a");
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.download = metadata.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-black mb-4 w-full">
      <div className="bg-gray-800 p-6 m-1 rounded shadow-md w-full md:w-1/2 lg:w-1/3 xl:w-1/4 text-white">
        <div className="flex flex-row mb-4">
          <strong className="whitespace-nowrap">Arweave ID:</strong>
          <div className="flex flex-row truncate w-1/2">
            <span className="whitespace-nowrap mr-1"> </span>
            <span className="truncate">{transaction?.id}</span>
          </div>
        </div>

        <div className="mb-4">
          <strong>Uploaded At:</strong>{" "}
          {transaction ? new Date(transaction.timestamp).toLocaleString() : ""}
        </div>

        <div className="mb-4 truncate w-full md:w-3/4 lg:w-2/3">
          <strong>Arweave URL: </strong>
          <a
            href={`https://arweave.net/${transaction?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 overflow-ellipsis"
          >
            https://arweave.net/{transaction?.id}
          </a>
        </div>
        <div className="mb-4">
          <strong>Filename:</strong> {metadata?.filename}
        </div>
        <div className="mb-4">
          <strong>Content-Type:</strong> {metadata?.contentType}
        </div>
        <button
          className="bg-blue-600 text-white hover:bg-blue-700 mt-2 px-6 py-1 rounded"
          onClick={downloadFile}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default Transaction;
