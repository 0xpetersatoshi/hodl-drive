vi.mock("@/app/config/bundlr", () => ({
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {
    utils: {
      fromAtomic: vi.fn((val: any) => val),
      toAtomic: vi.fn((val: any) => val),
    },
    getLoadedBalance: vi.fn(),
    getPrice: vi.fn(),
    fund: vi.fn(),
    upload: vi.fn(),
  },
}));

vi.mock("@/app/config", () => ({
  config: {
    SCHEMA_VERSION: "1.0",
  },
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

import { POST } from "./route";
import { bundlr } from "@/app/config/bundlr";
import { NextRequest } from "next/server";

const createRequest = (body: Record<string, any>): NextRequest => {
  return new NextRequest("http://localhost/api/v0/upload", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
};

describe("POST /api/v0/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when address is missing", async () => {
    const req = createRequest({ data: "encrypted-data" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("No address or data");
  });

  it("returns 400 when data is missing", async () => {
    const req = createRequest({ address: "0x123" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("No address or data");
  });

  it("uploads successfully without funding when balance is sufficient", async () => {
    const mockBundlr = bundlr as any;
    // Balance (10) > price (5) — no funding needed
    mockBundlr.getLoadedBalance.mockResolvedValue(10);
    mockBundlr.getPrice.mockResolvedValue(5);
    mockBundlr.utils.fromAtomic.mockImplementation((val: any) => ({
      toNumber: () => Number(val),
      // Make comparison work: uploadPrice > balance uses valueOf
      valueOf: () => Number(val),
      [Symbol.toPrimitive]: () => Number(val),
    }));
    mockBundlr.upload.mockResolvedValue({ id: "tx-abc123" });

    const req = createRequest({ address: "0xWallet", data: "encrypted-payload" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe("tx-abc123");
    expect(json.message).toBe("https://arweave.net/tx-abc123");
    expect(mockBundlr.fund).not.toHaveBeenCalled();
    expect(mockBundlr.upload).toHaveBeenCalledWith(
      "encrypted-payload",
      expect.objectContaining({
        tags: expect.arrayContaining([
          { name: "Content-Type", value: "application/json" },
          { name: "address", value: "0xWallet" },
          { name: "schemaVersion", value: "1.0" },
        ]),
      })
    );
  });

  it("auto-funds wallet when balance is insufficient", async () => {
    const mockBundlr = bundlr as any;
    // Balance (2) < price (10) — funding needed
    mockBundlr.getLoadedBalance.mockResolvedValue(2);
    mockBundlr.getPrice.mockResolvedValue(10);
    mockBundlr.utils.fromAtomic.mockImplementation((val: any) => ({
      toNumber: () => Number(val),
      valueOf: () => Number(val),
      [Symbol.toPrimitive]: () => Number(val),
    }));
    mockBundlr.utils.toAtomic.mockReturnValue("8000000000");
    mockBundlr.fund.mockResolvedValue(undefined);
    mockBundlr.upload.mockResolvedValue({ id: "tx-funded" });

    const req = createRequest({ address: "0xWallet", data: "data" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mockBundlr.fund).toHaveBeenCalledWith("8000000000");
    expect(json.id).toBe("tx-funded");
  });

  it("returns 500 when bundlr.upload throws", async () => {
    const mockBundlr = bundlr as any;
    mockBundlr.getLoadedBalance.mockResolvedValue(100);
    mockBundlr.getPrice.mockResolvedValue(1);
    mockBundlr.utils.fromAtomic.mockImplementation((val: any) => ({
      toNumber: () => Number(val),
      valueOf: () => Number(val),
      [Symbol.toPrimitive]: () => Number(val),
    }));
    mockBundlr.upload.mockRejectedValue(new Error("Bundlr upload failed"));

    const req = createRequest({ address: "0xWallet", data: "data" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Bundlr upload failed");
  });
});
