"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { TransactionEdge } from "../types";

const Page = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [uploads, setUploads] = useState<TransactionEdge[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      if (!isDisconnected && !isConnecting) {
        try {
          const response = await fetch(`/api/v0/uploads/address/${address}`);
          const data = await response.json();
          console.log(`data: ${data}`);

          if (response.status === 200) {
            setUploads(data.data.transactions.edges);
          }
        } catch (error) {
          console.error("Error fetching uploads:", error);
        }
      }
    };

    fetchUploads();
  }, [address, isConnecting, isDisconnected]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      {uploads.map((item) => (
        <div
          key={item.node.id}
          className="bg-gray-800 p-6 m-4 rounded shadow-md w-1/2 text-white"
        >
          <div className="flex flex-row mb-4">
            <strong className="whitespace-nowrap">Arweave ID:</strong>
            <div className="flex flex-row truncate w-1/2">
              <span className="whitespace-nowrap mr-1"> </span>
              <span className="truncate">{item.node.id}</span>
            </div>
          </div>

          <div className="mb-4">
            <strong>Uploaded At:</strong>{" "}
            {new Date(item.node.timestamp).toLocaleString()}
          </div>

          <div className="mb-4 truncate w-3/4">
            <strong>Download URL: </strong>
            <a
              href={`https://arweave.net/${item.node.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 overflow-ellipsis"
            >
              https://arweave.net/{item.node.id}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Page;
