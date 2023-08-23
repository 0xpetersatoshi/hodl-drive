"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import UploadForm from "./components/upload-form/upload-form.component";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="mb-12">
        <ConnectButton />
      </div>
      <div>
        <UploadForm />
      </div>
    </main>
  );
}
