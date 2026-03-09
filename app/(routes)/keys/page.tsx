"use client";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import KeyManager from "../../components/key-manager/key-manager.component";

const Page = () => {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Store your encryption key in a secure location. This key encrypts your
          files on the client-side before uploading to Arweave. You will need to
          upload this encryption key any time you want to come back and access
          your files from{" "}
          <Link href="/uploads" className="underline font-medium">
            MyDrive
          </Link>{" "}
          as it is used to decrypt your uploads.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Manage Encryption Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
