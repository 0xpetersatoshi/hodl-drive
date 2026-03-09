import { test, expect } from "@playwright/test";
import { injectConnectedWallet } from "./fixtures/wallet";
import {
  mockUploadsListAPI,
  mockEmptyUploadsListAPI,
  mockTxDetailAPI,
  mockArweaveData,
} from "./fixtures/api-mock";
import { MOCK_ADDRESS } from "./fixtures/test-data";

test.describe("Uploads Page (MyDrive)", () => {
  test("shows wallet not connected message without wallet", async ({
    page,
  }) => {
    await page.goto("/uploads");

    const errorBanner = page.locator("main").getByRole("alert");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("Wallet is not connected");
  });

  test("shows empty uploads message when no files exist", async ({ page }) => {
    await injectConnectedWallet(page);
    await mockEmptyUploadsListAPI(page);
    await page.goto("/uploads");

    await expect(
      page.getByText("No files uploaded to drive.")
    ).toBeVisible({ timeout: 10000 });
  });

  test("displays transaction list when uploads exist", async ({ page }) => {
    await injectConnectedWallet(page);
    await mockUploadsListAPI(page);
    await mockTxDetailAPI(page);
    await mockArweaveData(page);
    await page.goto("/uploads");

    // Wait for transactions to load — should render 2 transaction cards
    const arweaveIdLabels = page.getByText("Arweave ID:");
    await expect(arweaveIdLabels.first()).toBeVisible({ timeout: 10000 });
    await expect(arweaveIdLabels).toHaveCount(2);
  });

  test("fetches uploads for the correct wallet address", async ({ page }) => {
    await injectConnectedWallet(page);

    let fetchedUrl = "";
    await page.route("**/api/v0/uploads/address/*", (route) => {
      fetchedUrl = route.request().url();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { transactions: { edges: [] } } }),
      });
    });

    await page.goto("/uploads");

    // Wait for the fetch to complete
    await expect(
      page.getByText("No files uploaded to drive.")
    ).toBeVisible({ timeout: 10000 });

    // viem checksums addresses (mixed case), so compare case-insensitively
    expect(fetchedUrl.toLowerCase()).toContain(MOCK_ADDRESS.toLowerCase());
  });
});
