"use client";

import Link from "next/link";
import { FC } from "react";

const Home: FC = () => {
  return (
    <div className="dark:bg-gray-900 dark:text-white min-h-screen py-12">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to HODL Drive</h1>
        <p className="text-xl mb-8">
          Your decentralized storage solution, powered by Arweave.
        </p>
      </section>

      {/* How to Use Section */}
      <section className="text-center mt-12">
        <h2 className="text-3xl font-semibold mb-8">How to Use HODL Drive</h2>

        {/* Step 1 */}
        <div className="mb-8">
          <h3 className="text-2xl font-medium mb-4">Step 1: Manage Keys</h3>
          <p className="mb-4">
            Create or upload your existing encryption key by clicking on{" "}
            <Link href="/keys">
              <button className="text-blue-500 dark:text-blue-300">
                Manage Keys
              </button>
            </Link>
            .
          </p>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <h3 className="text-2xl font-medium mb-4">Step 2: Connect Wallet</h3>
          <p className="mb-4">
            Connect your Ethereum wallet to associate your file uploads with
            your wallet address.
          </p>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <h3 className="text-2xl font-medium mb-4">Step 3: Upload File</h3>
          <p className="mb-4">
            Click on{" "}
            <Link href="/upload">
              <button className="text-blue-500 dark:text-blue-300">
                Upload
              </button>
            </Link>{" "}
            to upload a file. Your files will be client-side encrypted and
            securely stored on Arweave.
          </p>
        </div>

        {/* Step 4 */}
        <div className="mb-8">
          <h3 className="text-2xl font-medium mb-4">Step 4: Access MyDrive</h3>
          <p className="mb-4">
            Go to{" "}
            <Link href="/uploads">
              <button className="text-blue-500 dark:text-blue-300">
                MyDrive
              </button>
            </Link>{" "}
            to access and manage your uploaded files.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
