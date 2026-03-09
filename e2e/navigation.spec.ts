import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navbar links navigate correctly", async ({ page }) => {
    await page.goto("/");

    const navbar = page.locator("div.bg-custom-navbar-color");

    // Upload link (scoped to navbar to avoid page content links)
    await navbar.getByRole("link", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");

    // MyDrive link
    await navbar.getByRole("link", { name: "MyDrive" }).click();
    await expect(page).toHaveURL("/uploads");

    // Manage Keys link
    await navbar.getByRole("link", { name: "Manage Keys" }).click();
    await expect(page).toHaveURL("/keys");

    // Logo → home
    await navbar.getByRole("link", { name: /HODL Drive/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("navbar shows Connect Wallet button", async ({ page }) => {
    await page.goto("/");

    // RainbowKit may render multiple Connect Wallet elements for responsive layout
    await expect(page.getByText("Connect Wallet").first()).toBeVisible();
  });

  test("hamburger menu works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const navbar = page.locator("div.bg-custom-navbar-color");

    // The nav menu <ul> should have 'hidden' class on mobile
    const navMenu = navbar.locator("ul");
    await expect(navMenu).toHaveClass(/\bhidden\b/);

    // Click hamburger button
    await navbar.locator("button:has(i.fa-bars)").click();

    // Nav menu should now have 'block' class instead of 'hidden'
    await expect(navMenu).toHaveClass(/\bblock\b/);

    // Click a link to navigate
    await navbar.getByRole("link", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");
  });
});
