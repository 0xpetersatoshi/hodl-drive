"use-client";

import { useState } from "react";

const UploadForm = () => {
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
    <div className="flex flex-col items-center justify-between">
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
    </div>
  );
};

export default UploadForm;
