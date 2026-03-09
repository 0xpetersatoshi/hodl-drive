import { test, expect } from "@playwright/test";
import { injectConnectedWallet, waitForWalletConnected } from "./fixtures/wallet";
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
    await page.getByRole("button", { name: "View All Uploads" }).click();
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

    // The landing page has buttons inside links for each step
    // Step 1: Manage Keys (inside the step section, not navbar)
    const mainContent = page.locator("div.flex-grow");

    await mainContent.getByRole("button", { name: "Manage Keys" }).click();
    await expect(page).toHaveURL("/keys");
    await page.goto("/");

    // Step 3: Upload
    await mainContent.getByRole("button", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");
    await page.goto("/");

    // Step 4: MyDrive
    await mainContent.getByRole("button", { name: "MyDrive" }).click();
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
    const fileInput = newPage.locator('input[type="file"]');
    await fileInput.setInputFiles(downloadPath!);

    // Verify key was loaded by checking the context has a key buffer
    // Wait for async IndexedDB operations to complete, then check via evaluate
    await expect(async () => {
      const hasKey = await newPage.evaluate(async () => {
        return new Promise<boolean>((resolve) => {
          const dbName = "hodl-drive-test";
          const req = indexedDB.open(dbName);
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

    await newContext.close();
  });
});
