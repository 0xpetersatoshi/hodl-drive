import React, { useState, useEffect, useRef } from "react";
import { config } from "@/app/config";
import { useEncryptionKey } from "@/app/contexts/keys";
import { Button } from "@/components/ui/button";
import { KeyRound, Download, Upload } from "lucide-react";

const KeyManager = () => {
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const { keyBuffer, setKeyBuffer } = useEncryptionKey();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initIndexedDB = () => {
    const openRequest = indexedDB.open(config.INDEXED_DB_NAME, 1);

    openRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(config.INDEXED_DB_OBJECT_STORE, { keyPath: "id" });
    };
  };

  const storeKeyInIndexedDB = (key: Uint8Array) => {
    const openRequest = indexedDB.open(config.INDEXED_DB_NAME);

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction(config.INDEXED_DB_OBJECT_STORE, "readwrite");
      const store = tx.objectStore(config.INDEXED_DB_OBJECT_STORE);

      const request = store.put({ id: config.INDEXED_DB_OBJECT_ID, key });

      request.onsuccess = () => {
        console.log("Key successfully stored in IndexedDB");
      };

      request.onerror = () => {
        console.error("Could not store key in IndexedDB:", request.error);
      };

      tx.oncomplete = () => {
        console.log("Transaction completed");
        db.close();
      };

      tx.onerror = (event) => {
        console.error("Transaction failed:", event);
      };
    };

    openRequest.onerror = () => {
      console.error("Could not open IndexedDB:", openRequest.error);
    };
  };

  const generateEncryptionKey = async () => {
    const key = await window.crypto.subtle.generateKey(
      {
        name: config.CRYPTO_ALGORITHM,
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
    const newKeyBuffer = new Uint8Array(exportedKey);

    updateKey(newKeyBuffer);
    setShowDownloadButton(true);
  };

  const downloadKey = () => {
    if (keyBuffer) {
      const blob = new Blob([new Uint8Array(keyBuffer)], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "encryption-key.bin";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleKeyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const uploadedKeyBuffer = new Uint8Array(
          event.target.result as ArrayBuffer
        );
        updateKey(uploadedKeyBuffer);
      }
    };
    reader.readAsArrayBuffer(file);
    setShowDownloadButton(false);
  };

  const updateKey = (newKeyBuffer: Uint8Array) => {
    setKeyBuffer(newKeyBuffer);
    storeKeyInIndexedDB(newKeyBuffer);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Initialize IndexedDB when the component mounts
  useEffect(() => {
    initIndexedDB();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={generateEncryptionKey} className="w-64">
        <KeyRound className="mr-2 h-4 w-4" />
        Generate Key
      </Button>
      {keyBuffer && showDownloadButton && (
        <Button onClick={downloadKey} variant="secondary" className="w-64">
          <Download className="mr-2 h-4 w-4" />
          Download Key
        </Button>
      )}
      <Button onClick={triggerFileInput} variant="outline" className="w-64">
        <Upload className="mr-2 h-4 w-4" />
        Upload Key
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleKeyUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default KeyManager;
