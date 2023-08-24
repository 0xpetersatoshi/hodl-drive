"use client";

import KeyManager from "../components/key-manager/key-manager.component";

const Page = () => {
  return (
    <div className="bg-black p-4 min-h-screen text-white flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Manage Encryption Keys
      </h1>
      <KeyManager />
    </div>
  );
};

export default Page;
