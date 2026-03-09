import { test, expect } from "@playwright/test";
import { injectConnectedWallet, waitForWalletConnected, waitForEncryptionKey } from "./fixtures/wallet";
import {
  mockUploadAPI,
  mockTxDetailAPI,
  mockUploadsListAPI,
  mockArweaveData,
} from "./fixtures/api-mock";

test.describe("Cross-Flow", () => {
  test("full journey: generate key → upload → view uploads", async ({
    page,
  }) => {
    await injectConnectedWallet(page);
    await mockUploadAPI(page);
    await mockTxDetailAPI(page);
    await mockUploadsListAPI(page);
    await mockArweaveData(page);

    // Step 1: Generate encryption key
    await page.goto("/keys");
    await page.getByRole("button", { name: "Generate Key" }).click();
    await expect(
      page.getByRole("button", { name: "Download Key" })
    ).toBeVisible();

    // Step 2: Upload a file
    await page.goto("/upload");
    await waitForWalletConnected(page);
    await waitForEncryptionKey(page);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-doc.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("test content"),
    });
    await page.getByRole("button", { name: "Upload data" }).click();

    // Should see transaction card
    await expect(page.getByText("Arweave ID:")).toBeVisible({ timeout: 10000 });

    // Step 3: View uploads
    await page.getByRole("link", { name: "View All Uploads" }).click();
    await expect(page).toHaveURL("/uploads");

    // Should see the uploads list
    await expect(page.getByText("Arweave ID:").first()).toBeVisible({ timeout: 10000 });
  });

  test("key generated on /keys is available on /upload", async ({ page }) => {
    await injectConnectedWallet(page);
    await mockUploadAPI(page);
    await mockTxDetailAPI(page);
    await mockArweaveData(page);

    // Generate key
    await page.goto("/keys");
    await page.getByRole("button", { name: "Generate Key" }).click();
    await expect(
      page.getByRole("button", { name: "Download Key" })
    ).toBeVisible();

    // Navigate to upload and try uploading — should NOT get "Key buffer is null" error
    await page.goto("/upload");
    await waitForWalletConnected(page);
    await waitForEncryptionKey(page);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("content"),
    });
    await page.getByRole("button", { name: "Upload data" }).click();

    // Should show success (transaction card), not key error
    await expect(page.getByText("Key buffer is null")).not.toBeVisible();
    await expect(page.getByText("Arweave ID:")).toBeVisible({ timeout: 10000 });
  });

  test("disconnected wallet shows errors on both /upload and /uploads", async ({
    page,
  }) => {
    // No wallet injected

    // /upload: submit form to trigger error
    await page.goto("/upload");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("content"),
    });
    await page.getByRole("button", { name: "Upload data" }).click();
    await expect(page.getByText("Wallet is not connected")).toBeVisible();

    // /uploads: should show error immediately
    await page.goto("/uploads");
    await expect(page.getByText("Wallet is not connected")).toBeVisible();
  });

  test("landing page step links all work", async ({ page }) => {
    await page.goto("/");

    // The landing page has links inside cards for each step
    const mainContent = page.locator("main");

    await mainContent.getByRole("link", { name: "Manage Keys" }).click();
    await expect(page).toHaveURL("/keys");
    await page.goto("/");

    // Step 3: Upload
    await mainContent.getByRole("link", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");
    await page.goto("/");

    // Step 4: MyDrive
    await mainContent.getByRole("link", { name: "MyDrive" }).click();
    await expect(page).toHaveURL("/uploads");
  });

  test("generate key, download it, re-upload it", async ({ page }) => {
    await page.goto("/keys");

    // Generate and download key
    await page.getByRole("button", { name: "Generate Key" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download Key" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("encryption-key.bin");

    // Save the downloaded file to a temp path
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Open a new context (fresh IndexedDB) to simulate a new session
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto("http://localhost:3000/keys");

    // Upload the previously downloaded key file
    const keyFileInput = newPage.locator('input[type="file"]');
    await keyFileInput.setInputFiles(downloadPath!);

    // Verify key was loaded by checking IndexedDB (search all databases)
    await expect(async () => {
      const hasKey = await newPage.evaluate(async () => {
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

    await newContext.close();
  });
});
