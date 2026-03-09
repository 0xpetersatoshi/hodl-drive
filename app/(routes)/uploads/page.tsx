"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BundlrApiResponse, TransactionNode } from "@/app/types";
import TransactionList from "@/app/components/transaction-list/transaction-list.component";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

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
            cache: "no-store",
          });
          if (!response.ok) return;
          const bundlrData: BundlrApiResponse = await response.json();

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
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {isConnecting || isDisconnected ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Wallet is not connected. Please connect your wallet to access this
            page.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hasNoUploads ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No files uploaded to drive.
          </CardContent>
        </Card>
      ) : (
        <TransactionList transactions={uploads} />
      )}
    </div>
  );
};

export default Page;
