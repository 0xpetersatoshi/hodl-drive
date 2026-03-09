"use client";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import UploadForm from "@/app/components/upload-form/upload-form.component";

const Page = () => {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How It Works</AlertTitle>
        <AlertDescription>
          Any file you choose to upload will be encrypted (client-side) using
          the encryption key you generated or uploaded under the{" "}
          <Link href="/keys" className="underline font-medium">
            Manage Keys
          </Link>{" "}
          section. You will be able to view a list of all your uploads from the{" "}
          <Link href="/uploads" className="underline font-medium">
            MyDrive
          </Link>{" "}
          section.
        </AlertDescription>
      </Alert>
      <UploadForm />
    </div>
  );
};

export default Page;
