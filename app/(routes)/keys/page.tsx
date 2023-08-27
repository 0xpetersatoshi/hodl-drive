"use client";

import Link from "next/link";
import KeyManager from "../../components/key-manager/key-manager.component";

const Page = () => {
  return (
    <div className="bg-black dark:text-white min-h-screen py-12">
      {/* Add this section for the warning box */}
      <section className="bg-red-600 text-white p-4 rounded-lg mb-2 mx-auto max-w-2xl">
        <h2 className="font-bold text-2xl mb-2">Warning:</h2>
        <p className="text-lg">
          Store your encryption key in a secure location. This key encrypts your
          files on the client-side before uploading to Arweave. You will need to
          upload this encryption key any time you want to come back and access
          your files from{" "}
          <Link href="/uploads">
            <button className="text-blue-300 dark:text-blue-600">
              MyDrive
            </button>
          </Link>{" "}
          as it is used to decrypt your uploads.
        </p>
      </section>
      <div className="bg-black p-4 text-white flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Manage Encryption Keys
        </h1>
        <KeyManager />
      </div>
    </div>
  );
};

export default Page;
