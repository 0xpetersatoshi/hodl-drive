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
