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
 */
export async function waitForEncryptionKey(page: Page) {
  await expect(async () => {
    const hasKey = await page.evaluate(async () => {
      return new Promise<boolean>((resolve) => {
        const req = indexedDB.open("hodl-drive-test");
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("encryption-keys-test")) {
            resolve(false);
            return;
          }
          const tx = db.transaction("encryption-keys-test", "readonly");
          const store = tx.objectStore("encryption-keys-test");
          const getReq = store.get("encryptionKey");
          getReq.onsuccess = () => resolve(!!getReq.result);
          getReq.onerror = () => resolve(false);
        };
        req.onerror = () => resolve(false);
      });
    });
    expect(hasKey).toBe(true);
  }).toPass({ timeout: 5000 });
}
