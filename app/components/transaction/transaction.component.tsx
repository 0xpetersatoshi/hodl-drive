import React, { useEffect, useState } from "react";
import { TransactionNode } from "@/app/types";
import { decryptData } from "@/app/utils";
import { useEncryptionKey } from "@/app/contexts/keys";
import type { ArweaveData, Metadata, UploadData } from "@/app/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, ExternalLink, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TransactionProps = {
  id: string;
};

const Transaction: React.FC<TransactionProps> = ({ id }) => {
  const [transaction, setTransaction] = useState<TransactionNode | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [encryptedFileData, setEncryptedFileData] = useState<
    UploadData[] | null
  >(null);
  const { keyBuffer } = useEncryptionKey();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/v0/upload/tx/${id}`, {
          cache: "no-store",
        });
        const jsonResponse = await response.json();

        if (response.status === 200) {
          const node = jsonResponse.data.transactions.edges[0].node;
          setTransaction(node);

          const arweaveResponse = await fetch(`https://arweave.net/${node.id}`);
          const arweaveData: ArweaveData = await arweaveResponse.json();
          const { data, iv } = arweaveData.metadata;

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

          setEncryptedFileData(arweaveData.file.chunks);
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
        const decryptedChunks: Uint8Array[] = [];
        for (const chunk of encryptedFileData) {
          const decryptedData = await decryptData(
            chunk.data,
            chunk.iv,
            keyBuffer as Uint8Array
          );

          decryptedChunks.push(decryptedData);
        }

        const totalLength = decryptedChunks.reduce(
          (acc, val) => acc + val.length,
          0
        );
        const combinedData = new Uint8Array(totalLength);

        let offset = 0;
        for (const chunk of decryptedChunks) {
          combinedData.set(chunk, offset);
          offset += chunk.length;
        }

        const blob = new Blob([combinedData], {
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

  const arweaveUrl = `https://arweave.net/${transaction?.id}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span>Arweave ID:</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate max-w-[200px] font-mono text-sm">
                {transaction?.id}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{transaction?.id}</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>Uploaded At:</strong>{" "}
          {transaction ? new Date(transaction.timestamp).toLocaleString() : ""}
        </div>
        <div className="truncate">
          <strong>Arweave URL: </strong>
          <a
            href={arweaveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {arweaveUrl}
          </a>
        </div>
        <div>
          <strong>Filename:</strong> {metadata?.filename}
        </div>
        <div className="flex items-center gap-2">
          <strong>Content-Type:</strong>
          {metadata?.contentType && (
            <Badge variant="secondary">{metadata.contentType}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button size="sm" onClick={downloadFile}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(arweaveUrl)
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={arweaveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Arweave
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

export default Transaction;
