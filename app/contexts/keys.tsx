"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "@/app/config";

type EncryptionKeyContextProps = {
  keyBuffer: Uint8Array | null;
  setKeyBuffer: React.Dispatch<React.SetStateAction<Uint8Array | null>>;
};

const EncryptionKeyContext = createContext<EncryptionKeyContextProps | null>(
  null
);

export const useEncryptionKey = () => {
  const context = useContext(EncryptionKeyContext);
  if (!context) {
    throw new Error(
      "useEncryptionKey must be used within a EncryptionKeyProvider"
    );
  }
  return context;
};

export const EncryptionKeyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [keyBuffer, setKeyBuffer] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const fetchKeyFromIndexedDB = async () => {
      const openRequest = indexedDB.open(config.INDEXED_DB_NAME);

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction(
          [config.INDEXED_DB_OBJECT_STORE],
          "readonly"
        );
        const objectStore = transaction.objectStore(
          config.INDEXED_DB_OBJECT_STORE
        );

        const keyRequest = objectStore.get(config.INDEXED_DB_OBJECT_ID);

        keyRequest.onsuccess = () => {
          if (keyRequest.result) {
            // Assuming the object has a key property which is the actual key buffer
            const fetchedKey = new Uint8Array(keyRequest.result.key);
            setKeyBuffer(fetchedKey);
          } else {
            // No key was found, set to null
            setKeyBuffer(null);
          }
        };

        keyRequest.onerror = () => {
          console.error(
            "Could not fetch encryption key from IndexedDB:",
            keyRequest.error
          );
          setKeyBuffer(null);
        };
      };

      openRequest.onerror = () => {
        console.error("Could not open IndexedDB:", openRequest.error);
      };
    };

    fetchKeyFromIndexedDB();
  }, []);

  return (
    <EncryptionKeyContext.Provider value={{ keyBuffer, setKeyBuffer }}>
      {children}
    </EncryptionKeyContext.Provider>
  );
};
