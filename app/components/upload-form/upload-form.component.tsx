import { useState } from "react";
import SingleTransaction from "../transaction/transaction.component";
import { useAccount } from "wagmi";

const UploadForm = () => {
  const [data, setData] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { address, isConnecting, isDisconnected } = useAccount();

  const upload = async () => {
    try {
      if (isConnecting || isDisconnected) {
        const message =
          "Wallet is not connected. Please connect before uploading.";
        console.error(message);
        alert(message);
        throw new Error(message);
      }
      console.log(`connected address: ${address}`);

      const response = await fetch("/api/v0/upload", {
        method: "POST",
        body: JSON.stringify({ data, address }),
        headers: { "Content-Type": "application/json" },
      });

      const jsonResponse = await response.json();
      console.log(`response: ${JSON.stringify(jsonResponse, null, " ")}`);

      if (jsonResponse.id) {
        setTransactionId(jsonResponse.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {transactionId ? (
        <SingleTransaction id={transactionId} />
      ) : (
        <div className="flex flex-col items-center justify-between bg-black p-4 rounded text-white">
          <input
            type="text"
            className="bg-gray-800 px-2 py-1 rounded text-white placeholder-gray-500 focus:ring focus:ring-opacity-50 focus:ring-gray-600"
            placeholder="Add data to your Drive"
            onChange={(e) => setData(e.target.value)}
          />

          <button
            className="bg-blue-600 text-white hover:bg-blue-700 mt-2 px-12 py-1 rounded"
            onClick={upload}
          >
            Upload data
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
