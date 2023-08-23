"use client";

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState("");
  const [address, setAddress] = useState("");

  const upload = async () => {
    try {
      const response = await fetch("/api/v0/upload", {
        method: "POST",
        body: JSON.stringify({ data, address }),
        headers: { "Content-Type": "application/json" },
      });

      const jsonResponse = await response.json();
      console.log(`response: ${JSON.stringify(jsonResponse, null, " ")}`);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <input
        type="text"
        className="text-black px-2 py-1"
        placeholder="Add data to your HODL Drive"
        onChange={(e) => setData(e.target.value)}
      />

      <input
        type="text"
        className="text-black px-2 py-1"
        placeholder="Add your wallet address"
        onChange={(e) => setAddress(e.target.value)}
      />

      <button className="text-black bg-white mt-2 px-12" onClick={upload}>
        Upload data
      </button>
    </main>
  );
}
