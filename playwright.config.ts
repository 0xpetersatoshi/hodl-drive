import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        },
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_INDEXED_DB_NAME: "hodl-drive-test",
      NEXT_PUBLIC_INDEXED_DB_OBJECT_STORE: "encryption-keys-test",
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME: "HODL Drive Test",
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: "test-project-id",
      NEXT_PUBLIC_APP_GITHUB_USERNAME: "test-user",
    },
  },
});
