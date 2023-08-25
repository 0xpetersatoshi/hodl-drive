"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { TransactionEdge } from "@/app/types";
import Transaction from "../transaction/transaction.component";

const Uploads = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [uploads, setUploads] = useState<TransactionEdge[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      if (!isDisconnected && !isConnecting) {
        try {
          const response = await fetch(`/api/v0/uploads/address/${address}`, {
            next: {
              revalidate: 0,
            },
          });
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
      {isConnecting || isDisconnected ? (
        <div className="bg-red-600 text-white p-4 rounded-md">
          Wallet is not connected. Please connect your wallet to access this
          page.
        </div>
      ) : (
        uploads.map((item) => (
          <Transaction key={item.node.id} id={item.node.id} />
        ))
      )}
    </div>
  );
};

export default Uploads;
