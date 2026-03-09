import { Page, expect } from "@playwright/test";
import { MOCK_ADDRESS } from "./test-data";

export async function injectConnectedWallet(
  page: Page,
  address: string = MOCK_ADDRESS
) {
  await page.addInitScript((addr) => {
    (window as any).__TEST_WALLET__ = { address: addr };
  }, address);
}

/**
 * Wait for the wallet mock to fully connect by checking for the
 * truncated address in the RainbowKit connect button.
 */
export async function waitForWalletConnected(page: Page) {
  // RainbowKit shows a button with the truncated address when connected (e.g. "0x12…5678")
  await expect(page.locator("button").filter({ hasText: /0x\w{2}…\w{4}/ }).first()).toBeVisible({
    timeout: 10000,
  });
}

/**
 * Wait for the encryption key to be loaded from IndexedDB into the
 * EncryptionKeyProvider context. Use after navigating to a page where
 * a previously-generated key needs to be available.
 *
 * Searches all IndexedDB databases for an "encryptionKey" entry so the
 * test works regardless of the DB/store names configured on the server.
 */
export async function waitForEncryptionKey(page: Page) {
  await expect(async () => {
    const hasKey = await page.evaluate(async () => {
      const databases = await indexedDB.databases();
      for (const dbInfo of databases) {
        if (!dbInfo.name) continue;
        const found = await new Promise<boolean>((resolve) => {
          const req = indexedDB.open(dbInfo.name!);
          req.onsuccess = () => {
            const db = req.result;
            const storeNames = Array.from(db.objectStoreNames);
            if (storeNames.length === 0) { db.close(); resolve(false); return; }
            for (const sn of storeNames) {
              try {
                const tx = db.transaction(sn, "readonly");
                const store = tx.objectStore(sn);
                const getReq = store.get("encryptionKey");
                getReq.onsuccess = () => { db.close(); resolve(!!getReq.result); };
                getReq.onerror = () => { db.close(); resolve(false); };
                return;
              } catch { continue; }
            }
            db.close();
            resolve(false);
          };
          req.onerror = () => resolve(false);
        });
        if (found) return true;
      }
      return false;
    });
    expect(hasKey).toBe(true);
  }).toPass({ timeout: 5000 });
}
