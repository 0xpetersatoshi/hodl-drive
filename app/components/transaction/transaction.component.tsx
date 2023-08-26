import React, { useEffect, useState } from "react";
import { TransactionNode } from "@/app/types";
import { decryptData } from "@/app/utils";
import { useEncryptionKey } from "@/app/contexts/keys";
import type { ArweaveData, Metadata } from "@/app/types";

type TransactionProps = {
  id: string;
};

const Transaction: React.FC<TransactionProps> = ({ id }) => {
  const [transaction, setTransaction] = useState<TransactionNode | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const { keyBuffer } = useEncryptionKey();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/v0/upload/tx/${id}`);
        const jsonResponse = await response.json();

        if (response.status === 200) {
          const node = jsonResponse.data.transactions.edges[0].node;
          setTransaction(node);

          const arweaveResponse = await fetch(`https://arweave.net/${node.id}`);
          const arweaveData: ArweaveData = await arweaveResponse.json();
          const { data, iv } = arweaveData.metadata;

          // Decrypt the metadata
          const decrypted = await decryptData(
            data,
            iv,
            keyBuffer as Uint8Array
          );

          const metadata = JSON.parse(decrypted as string);
          setMetadata(metadata);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    };

    fetchTransaction();
  }, [id, keyBuffer]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      {transaction && metadata ? (
        <div className="bg-gray-800 p-6 m-4 rounded shadow-md w-1/2 text-white">
          <div className="flex flex-row mb-4">
            <strong className="whitespace-nowrap">Arweave ID:</strong>
            <div className="flex flex-row truncate w-1/2">
              <span className="whitespace-nowrap mr-1"> </span>
              <span className="truncate">{transaction.id}</span>
            </div>
          </div>

          <div className="mb-4">
            <strong>Uploaded At:</strong>{" "}
            {new Date(transaction.timestamp).toLocaleString()}
          </div>

          <div className="mb-4 truncate w-3/4">
            <strong>Arweave URL: </strong>
            <a
              href={`https://arweave.net/${transaction.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 overflow-ellipsis"
            >
              https://arweave.net/{transaction.id}
            </a>
          </div>
          <div className="mb-4">
            <strong>Filename:</strong> {metadata.filename}
          </div>
          <div className="mb-4">
            <strong>Content-Type:</strong> {metadata.contentType}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Transaction;
