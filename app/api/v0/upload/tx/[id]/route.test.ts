vi.mock("@/app/config/bundlr", () => ({
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

vi.mock("@/app/config", () => ({
  config: {
    SCHEMA_VERSION: "1.0",
  },
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

vi.mock("@/app/utils/query", () => ({
  fetchGraphQL: vi.fn(),
}));

vi.mock("@/app/graphql", () => ({
  getTxById: "query getTxById($txIds: [String!]) { transactions(ids: $txIds) { edges { node { id } } } }",
}));

import { GET } from "./route";
import { fetchGraphQL } from "@/app/utils/query";
import { getTxById } from "@/app/graphql";
import { NextRequest } from "next/server";

const mockFetchGraphQL = fetchGraphQL as ReturnType<typeof vi.fn>;

describe("GET /api/v0/upload/tx/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with transaction data", async () => {
    const txData = {
      transactions: {
        edges: [{ node: { id: "tx-123", address: "0xABC" } }],
      },
    };
    mockFetchGraphQL.mockResolvedValue({ errors: null, data: txData });

    const req = new NextRequest("http://localhost/api/v0/upload/tx/tx-123");
    const res = await GET(req, { params: { id: "tx-123" } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual(txData);
  });

  it("passes correct query and variables to fetchGraphQL", async () => {
    mockFetchGraphQL.mockResolvedValue({ errors: null, data: {} });

    const req = new NextRequest("http://localhost/api/v0/upload/tx/my-tx-id");
    await GET(req, { params: { id: "my-tx-id" } });

    expect(mockFetchGraphQL).toHaveBeenCalledWith(
      getTxById,
      "getTxById",
      { txIds: "my-tx-id" }
    );
  });

  it("returns 500 when fetchGraphQL returns errors", async () => {
    mockFetchGraphQL.mockResolvedValue({
      errors: [{ message: "Transaction not found" }],
      data: null,
    });

    const req = new NextRequest("http://localhost/api/v0/upload/tx/bad-id");
    const res = await GET(req, { params: { id: "bad-id" } });
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toEqual([{ message: "Transaction not found" }]);
  });
});
