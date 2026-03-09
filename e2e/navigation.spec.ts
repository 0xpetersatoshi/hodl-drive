import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sidebar links navigate correctly", async ({ page }) => {
    await page.goto("/");

    const sidebar = page.locator("[data-sidebar='sidebar']");

    // Upload link (scoped to sidebar to avoid page content links)
    await sidebar.getByRole("link", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");

    // MyDrive link
    await sidebar.getByRole("link", { name: "MyDrive" }).click();
    await expect(page).toHaveURL("/uploads");

    // Manage Keys link
    await sidebar.getByRole("link", { name: "Manage Keys" }).click();
    await expect(page).toHaveURL("/keys");

    // Logo → home
    await sidebar.getByRole("link", { name: /HODL Drive/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("header shows Connect Wallet button", async ({ page }) => {
    await page.goto("/");

    // RainbowKit may render multiple Connect Wallet elements for responsive layout
    await expect(page.getByText("Connect Wallet").first()).toBeVisible();
  });

  test("sidebar toggle works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // On mobile, sidebar should not be visible by default
    const sidebar = page.locator("[data-sidebar='sidebar']");
    await expect(sidebar).not.toBeInViewport();

    // Click the sidebar trigger button
    await page.locator("button[data-sidebar='trigger']").click();

    // Sidebar should now be visible
    await expect(sidebar).toBeVisible();

    // Click a link to navigate
    await sidebar.getByRole("link", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");
  });
});
