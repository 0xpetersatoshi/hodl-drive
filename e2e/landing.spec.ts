import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("displays welcome heading and devnet warning", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Welcome to HODL Drive" })
    ).toBeVisible();

    const warning = page.locator("section.bg-red-600");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("devnet");
  });

  test("shows all four how-to-use steps", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Step 1: Manage Keys" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Step 2: Connect Wallet" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Step 3: Upload File" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Step 4: Access MyDrive" })
    ).toBeVisible();
  });

  test("step links navigate to correct pages", async ({ page }) => {
    await page.goto("/");

    // Step 1: Manage Keys → /keys
    await page.getByRole("button", { name: "Manage Keys" }).click();
    await expect(page).toHaveURL("/keys");

    await page.goto("/");

    // Step 3: Upload → /upload
    await page.getByRole("button", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");

    await page.goto("/");

    // Step 4: MyDrive → /uploads
    await page.getByRole("button", { name: "MyDrive" }).click();
    await expect(page).toHaveURL("/uploads");
  });
});
