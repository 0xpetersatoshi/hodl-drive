import { test, expect } from "@playwright/test";
import { injectConnectedWallet, waitForWalletConnected, waitForEncryptionKey } from "./fixtures/wallet";
import {
  mockUploadAPI,
  mockTxDetailAPI,
  mockArweaveData,
} from "./fixtures/api-mock";
import { MOCK_TX_ID } from "./fixtures/test-data";

test.describe("Upload Page", () => {
  test("shows file input and Upload data button", async ({ page }) => {
    await page.goto("/upload");

    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upload data" })
    ).toBeVisible();
  });

  test("shows wallet not connected error on submit without wallet", async ({
    page,
  }) => {
    await page.goto("/upload");

    // Set a file so the form can be submitted
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello world"),
    });

    await page.getByRole("button", { name: "Upload data" }).click();

    await expect(page.getByText("Wallet is not connected")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try Upload Again" })
    ).toBeVisible();
  });

  test("shows encryption key error on submit without key", async ({
    page,
  }) => {
    await injectConnectedWallet(page);
    await page.goto("/upload");

    // Wait for wallet to be fully connected
    await waitForWalletConnected(page);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello world"),
    });

    await page.getByRole("button", { name: "Upload data" }).click();

    await expect(page.getByText("Key buffer is null")).toBeVisible();
  });

  test("successful upload shows transaction card", async ({ page }) => {
    await injectConnectedWallet(page);
    await mockUploadAPI(page);
    await mockTxDetailAPI(page);
    await mockArweaveData(page);

    // First generate an encryption key
    await page.goto("/keys");
    await page.getByRole("button", { name: "Generate Key" }).click();
    await expect(
      page.getByRole("button", { name: "Download Key" })
    ).toBeVisible();

    // Navigate to upload and wait for both wallet and key to be ready
    await page.goto("/upload");
    await waitForWalletConnected(page);
    await waitForEncryptionKey(page);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello world"),
    });

    await page.getByRole("button", { name: "Upload data" }).click();

    // Should show transaction card with Arweave ID
    await expect(page.getByText("Arweave ID:")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(MOCK_TX_ID).first()).toBeVisible();
    await expect(page.getByText("Arweave URL:")).toBeVisible();
  });

  test("Try Upload Again resets form to initial state", async ({ page }) => {
    await page.goto("/upload");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello world"),
    });

    await page.getByRole("button", { name: "Upload data" }).click();

    // Wait for error state
    await expect(
      page.getByRole("button", { name: "Try Upload Again" })
    ).toBeVisible();

    // Click retry
    await page.getByRole("button", { name: "Try Upload Again" }).click();

    // Should be back to form state
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upload data" })
    ).toBeVisible();
  });

  test("View All Uploads navigates to /uploads", async ({ page }) => {
    await injectConnectedWallet(page);
    await mockUploadAPI(page);
    await mockTxDetailAPI(page);
    await mockArweaveData(page);

    // Generate key first
    await page.goto("/keys");
    await page.getByRole("button", { name: "Generate Key" }).click();
    await expect(
      page.getByRole("button", { name: "Download Key" })
    ).toBeVisible();

    await page.goto("/upload");
    await waitForWalletConnected(page);
    await waitForEncryptionKey(page);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello world"),
    });

    await page.getByRole("button", { name: "Upload data" }).click();

    // Wait for success state
    await expect(
      page.getByRole("link", { name: "View All Uploads" })
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: "View All Uploads" }).click();
    await expect(page).toHaveURL("/uploads");
  });
});
