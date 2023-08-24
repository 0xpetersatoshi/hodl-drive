import React, { useEffect, useState } from "react";
import { TransactionNode } from "@/app/types";

interface SingleTransactionProps {
  id: string;
}

const SingleTransaction: React.FC<SingleTransactionProps> = ({ id }) => {
  const [transaction, setTransaction] = useState<TransactionNode | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/v0/upload/tx/${id}`);
        const data = await response.json();

        if (response.status === 200) {
          setTransaction(data.data.transactions.edges[0].node);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    };

    fetchTransaction();
  }, [id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      {transaction ? (
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
            <strong>Download URL: </strong>
            <a
              href={`https://arweave.net/${transaction.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 overflow-ellipsis"
            >
              https://arweave.net/{transaction.id}
            </a>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default SingleTransaction;
