vi.mock("@/app/config/bundlr", () => ({
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

vi.mock("@/app/config", () => ({
  config: {
    SCHEMA_VERSION: "1.0",
    UPLOADER_ADDRESS: "0xUploaderAddress",
  },
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

vi.mock("@/app/utils/query", () => ({
  fetchGraphQL: vi.fn(),
}));

vi.mock("@/app/graphql", () => ({
  getTxByAddress: "query getTxByAddress { ... }",
}));

import { GET } from "./route";
import { fetchGraphQL } from "@/app/utils/query";
import { NextRequest } from "next/server";

const mockFetchGraphQL = fetchGraphQL as ReturnType<typeof vi.fn>;

describe("GET /api/v0/uploads/address/[address]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with transaction list", async () => {
    const txData = {
      transactions: {
        edges: [
          { node: { id: "tx-1" } },
          { node: { id: "tx-2" } },
        ],
      },
    };
    mockFetchGraphQL.mockResolvedValue({ errors: null, data: txData });

    const req = new NextRequest("http://localhost/api/v0/uploads/address/0xUser");
    const res = await GET(req, { params: { address: "0xUser" } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual(txData);
  });

  it("passes correct filter tags, owners, limit, and order", async () => {
    mockFetchGraphQL.mockResolvedValue({ errors: null, data: {} });

    const req = new NextRequest("http://localhost/api/v0/uploads/address/0xUser");
    await GET(req, { params: { address: "0xUser" } });

    expect(mockFetchGraphQL).toHaveBeenCalledWith(
      expect.any(String),
      "getTxByAddress",
      {
        owners: "0xUploaderAddress",
        tags: [
          { name: "address", values: "0xUser" },
          { name: "schemaVersion", values: "1.0" },
        ],
        limit: 100,
        order: "DESC",
      }
    );
  });

  it("returns 500 when fetchGraphQL returns errors", async () => {
    mockFetchGraphQL.mockResolvedValue({
      errors: [{ message: "Internal server error" }],
      data: null,
    });

    const req = new NextRequest("http://localhost/api/v0/uploads/address/0xUser");
    const res = await GET(req, { params: { address: "0xUser" } });
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toEqual([{ message: "Internal server error" }]);
  });
});
