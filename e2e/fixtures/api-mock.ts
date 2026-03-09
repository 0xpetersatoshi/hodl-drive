import { Page } from "@playwright/test";
import {
  MOCK_UPLOAD_RESPONSE,
  MOCK_TX_DETAIL_RESPONSE,
  MOCK_UPLOADS_LIST_RESPONSE,
  MOCK_UPLOADS_EMPTY_RESPONSE,
  MOCK_ARWEAVE_DATA,
} from "./test-data";

export async function mockUploadAPI(
  page: Page,
  response = MOCK_UPLOAD_RESPONSE
) {
  await page.route("**/api/v0/upload", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    } else {
      route.continue();
    }
  });
}

export async function mockTxDetailAPI(
  page: Page,
  response = MOCK_TX_DETAIL_RESPONSE
) {
  await page.route("**/api/v0/upload/tx/*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

export async function mockUploadsListAPI(
  page: Page,
  response = MOCK_UPLOADS_LIST_RESPONSE
) {
  await page.route("**/api/v0/uploads/address/*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

export async function mockEmptyUploadsListAPI(page: Page) {
  await mockUploadsListAPI(page, MOCK_UPLOADS_EMPTY_RESPONSE);
}

export async function mockArweaveData(
  page: Page,
  data = MOCK_ARWEAVE_DATA
) {
  await page.route("**/arweave.net/*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
}

export async function mockAllAPIs(page: Page) {
  await mockUploadAPI(page);
  await mockTxDetailAPI(page);
  await mockUploadsListAPI(page);
  await mockArweaveData(page);
}
