import "fake-indexeddb/auto";

vi.mock("@/app/config/bundlr", () => ({
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

vi.mock("@/app/config", () => ({
  config: {
    INDEXED_DB_NAME: "test-db",
    INDEXED_DB_OBJECT_STORE: "test-store",
    INDEXED_DB_OBJECT_ID: "encryptionKey",
  },
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useEncryptionKey, EncryptionKeyProvider } from "./keys";

describe("EncryptionKeyContext", () => {
  beforeEach(() => {
    // Clear IndexedDB between tests
    indexedDB = new IDBFactory();
  });

  it("useEncryptionKey throws outside provider", () => {
    expect(() => {
      renderHook(() => useEncryptionKey());
    }).toThrow("useEncryptionKey must be used within a EncryptionKeyProvider");
  });

  it("provides null keyBuffer when IndexedDB is empty", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EncryptionKeyProvider>{children}</EncryptionKeyProvider>
    );

    const { result } = renderHook(() => useEncryptionKey(), { wrapper });

    // Initial state should be null
    expect(result.current.keyBuffer).toBeNull();

    // After IndexedDB fetch completes, should still be null
    await waitFor(() => {
      expect(result.current.keyBuffer).toBeNull();
    });
  });

  it("loads existing key from IndexedDB on mount", async () => {
    const testKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

    // Pre-populate IndexedDB with a key
    await new Promise<void>((resolve, reject) => {
      const openReq = indexedDB.open("test-db");
      openReq.onupgradeneeded = () => {
        const db = openReq.result;
        db.createObjectStore("test-store", { keyPath: "id" });
      };
      openReq.onsuccess = () => {
        const db = openReq.result;
        const tx = db.transaction(["test-store"], "readwrite");
        const store = tx.objectStore("test-store");
        store.put({ id: "encryptionKey", key: Array.from(testKey) });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      openReq.onerror = () => reject(openReq.error);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EncryptionKeyProvider>{children}</EncryptionKeyProvider>
    );

    const { result } = renderHook(() => useEncryptionKey(), { wrapper });

    await waitFor(() => {
      expect(result.current.keyBuffer).not.toBeNull();
    });

    expect(Array.from(result.current.keyBuffer!)).toEqual(
      Array.from(testKey)
    );
  });
});
