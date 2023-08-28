"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BundlrApiResponse, TransactionNode } from "@/app/types";
import TransactionList from "@/app/components/transaction-list/transaction-list.component";
import Loading from "@/app/loading";

const Page = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [uploads, setUploads] = useState<TransactionNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoUploads, setHasNoUploads] = useState(true);

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
            if (nodes.length > 0) {
              setHasNoUploads(false);
            }
            setUploads(nodes);
          }
        } catch (error) {
          console.error("Error fetching uploads:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUploads();
  }, [address, isConnecting, isDisconnected]);

  return (
    <div className="bg-gray-900 flex flex-col items-center justify-center min-h-screen">
      {isConnecting || isDisconnected ? (
        <div className="bg-red-600 text-white p-4 rounded-md">
          Wallet is not connected. Please connect your wallet to access this
          page.
        </div>
      ) : isLoading ? (
        <Loading />
      ) : hasNoUploads ? (
        <div className="bg-gray-700 text-white p-4 rounded-md">
          No files uploaded to drive.
        </div>
      ) : (
        <TransactionList transactions={uploads} />
      )}
    </div>
  );
};

export default Page;
