import { test, expect } from "@playwright/test";

test.describe("Key Management", () => {
  test("displays Generate Key and Upload Key buttons", async ({ page }) => {
    await page.goto("/keys");

    await expect(
      page.getByRole("button", { name: "Generate Key" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upload Key" })
    ).toBeVisible();

    // Download Key should not be visible initially
    await expect(
      page.getByRole("button", { name: "Download Key" })
    ).toBeHidden();
  });

  test("Generate Key shows Download Key button", async ({ page }) => {
    await page.goto("/keys");

    await page.getByRole("button", { name: "Generate Key" }).click();

    const downloadButton = page.getByRole("button", { name: "Download Key" });
    await expect(downloadButton).toBeVisible();
  });

  test("Download Key triggers file download", async ({ page }) => {
    await page.goto("/keys");

    await page.getByRole("button", { name: "Generate Key" }).click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download Key" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("encryption-key.bin");
  });

  test("Upload Key accepts a binary file", async ({ page }) => {
    await page.goto("/keys");

    // Create a mock key file (32 bytes for AES-256)
    const keyBytes = Buffer.alloc(32, 0xab);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "encryption-key.bin",
      mimeType: "application/octet-stream",
      buffer: keyBytes,
    });

    // No errors should appear — the page should still show the key manager
    await expect(
      page.getByRole("button", { name: "Generate Key" })
    ).toBeVisible();
  });

  test("encryption key persists across page navigation", async ({ page }) => {
    await page.goto("/keys");

    await page.getByRole("button", { name: "Generate Key" }).click();
    await expect(
      page.getByRole("button", { name: "Download Key" })
    ).toBeVisible();

    // Navigate away and back
    await page.goto("/upload");
    await page.goto("/keys");

    // Verify key is still in IndexedDB via evaluate
    const hasKey = await page.evaluate(async () => {
      return new Promise<boolean>((resolve) => {
        const dbName =
          (window as any).__NEXT_DATA__?.props?.pageProps?.dbName ||
          "hodl-drive-test";
        const req = indexedDB.open(dbName);
        req.onsuccess = () => {
          const db = req.result;
          const storeNames = Array.from(db.objectStoreNames);
          if (storeNames.length === 0) {
            resolve(false);
            return;
          }
          const tx = db.transaction(storeNames[0], "readonly");
          const store = tx.objectStore(storeNames[0]);
          const getReq = store.get("encryptionKey");
          getReq.onsuccess = () => resolve(!!getReq.result);
          getReq.onerror = () => resolve(false);
        };
        req.onerror = () => resolve(false);
      });
    });

    expect(hasKey).toBe(true);
  });
});
