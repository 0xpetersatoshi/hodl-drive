"use client";

import UploadForm from "./components/upload-form/upload-form.component";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <UploadForm />
    </main>
  );
}
