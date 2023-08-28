"use client";

import Link from "next/link";
import UploadForm from "@/app/components/upload-form/upload-form.component";

const Page = () => {
  return (
    <div className="dark:bg-gray-900 dark:text-white min-h-screen py-12">
      <section className="bg-gray-700 text-white p-4 rounded-lg mb-2 mx-auto max-w-2xl">
        <h2 className="font-bold text-2xl mb-2">How It Works:</h2>
        <p className="text-lg">
          Any file you choose to upload will be encrypted (client-side) using
          the encryption key you generated or uploaded under the{"  "}
          <Link href="/keys">
            <button className="text-blue-300 dark:text-blue-600">
              Manage Keys
            </button>
          </Link>{" "}
          section. You will be able to view a list of all your uploads from the{" "}
          <Link href="/uploads">
            <button className="text-blue-300 dark:text-blue-600">
              Uploads
            </button>
          </Link>{" "}
          section.
        </p>
      </section>
      <UploadForm />
    </div>
  );
};

export default Page;
