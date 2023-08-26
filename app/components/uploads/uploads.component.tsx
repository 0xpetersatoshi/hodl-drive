"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BundlrApiResponse, TransactionNode } from "@/app/types";
import TransactionList from "../transaction-list/transaction-list.component";

const Uploads = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [uploads, setUploads] = useState<TransactionNode[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      if (!isDisconnected && !isConnecting) {
        try {
          const response = await fetch(`/api/v0/uploads/address/${address}`, {
            next: {
              revalidate: 0,
            },
          });
          const bundlrData: BundlrApiResponse = await response.json();
          console.log(`data: ${bundlrData}`);

          if (response.status === 200) {
            const nodes = bundlrData.data.transactions.edges.map(
              (edge) => edge.node
            );
            setUploads(nodes);
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
        <TransactionList transactions={uploads} />
      )}
    </div>
  );
};

export default Uploads;
