import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useEncryptionKey } from "@/app/contexts/keys";
import Transaction from "../transaction/transaction.component";
import { encryptData, encryptDataInChunks } from "@/app/utils";
import { config } from "@/app/config";
import { ArweaveData } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [contentType, setContentType] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
    });
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isConnecting || isDisconnected) {
        const message =
          "Wallet is not connected. Please connect before uploading.";
        setError(message);
        return;
      }

      if (!keyBuffer) {
        const message =
          "Key buffer is null; encryption key not generated or uploaded";
        setError(message);
        return;
      }

      if (file && keyBuffer) {
        const dataBuffer = new Uint8Array(await readFileAsArrayBuffer(file));

        const encryptedFileData = await encryptDataInChunks(
          dataBuffer,
          keyBuffer
        );

        const metadata = JSON.stringify({ filename, contentType });
        const metadataBuffer = new TextEncoder().encode(metadata);
        const encryptedMetadata = await encryptData(metadataBuffer, keyBuffer);

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

        console.log(`Response status code: ${response.status}`);
        const jsonResponse = await response.json();

        if (response.status !== 200) {
          setError(`API Error: ${jsonResponse.error}`);
          return;
        }

        if (jsonResponse.id) {
          setTransactionId(jsonResponse.id);
        }
      } else {
        if (!file) {
          setError("No file to upload.");
        } else {
          setError(
            "Encryption key missing. Please upload or generate under 'Manage Keys'"
          );
        }
        return;
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
    setError("");
  };

  return (
    <div>
      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ) : error ? (
        <div className="flex flex-col items-center gap-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={resetForm}>Try Upload Again</Button>
        </div>
      ) : transactionId ? (
        <div>
          <Transaction id={transactionId} />
          <div className="flex justify-center items-center gap-4 mt-4">
            <Button onClick={resetForm} variant="outline">
              Upload Another
            </Button>
            <Button asChild>
              <Link href="/uploads">View All Uploads</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={handleUpload}
              className="flex flex-col items-center gap-4"
            >
              <input
                type="file"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                onChange={handleFileChange}
                required
              />
              <Button type="submit">Upload data</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadForm;
