vi.mock("../config/bundlr", () => ({
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

vi.mock("../config", () => ({
  config: {
    CRYPTO_ALGORITHM: "AES-GCM",
  },
  GRAPHQL_ENDPOINT: "https://test.bundlr.network/graphql",
  bundlr: {},
}));

import { fetchGraphQL } from "./query";

describe("fetchGraphQL", () => {
  const mockResponse = { data: { transactions: [] } };

  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a POST request with correct body structure", async () => {
    const query = "query { transactions { edges { node { id } } } }";
    const variables = { address: "0x123" };
    const operationName = "GetTransactions";

    await fetchGraphQL(query, operationName, variables);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          query,
          variables,
          operationName,
        }),
      })
    );
  });

  it("uses correct headers and cache settings", async () => {
    await fetchGraphQL("query { test }");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
    );
  });

  it("uses the provided endpoint", async () => {
    const customEndpoint = "https://custom.endpoint/graphql";
    await fetchGraphQL("query { test }", "", {}, customEndpoint);

    expect(fetch).toHaveBeenCalledWith(customEndpoint, expect.any(Object));
  });

  it("uses default endpoint when none provided", async () => {
    await fetchGraphQL("query { test }");

    expect(fetch).toHaveBeenCalledWith(
      "https://test.bundlr.network/graphql",
      expect.any(Object)
    );
  });

  it("parses and returns the JSON response", async () => {
    const result = await fetchGraphQL("query { test }");

    expect(result).toEqual(mockResponse);
  });

  it("propagates fetch network errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch")
    );

    await expect(fetchGraphQL("query { test }")).rejects.toThrow(
      "Failed to fetch"
    );
  });

  it("returns error object when response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const result = await fetchGraphQL("query { test }");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("500");
    expect(result.data).toBeNull();
  });

  it("returns GraphQL error responses without throwing", async () => {
    const errorResponse = {
      errors: [{ message: "Field 'foo' not found" }],
      data: null,
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(errorResponse),
    } as Response);

    const result = await fetchGraphQL("query { foo }");

    expect(result).toEqual(errorResponse);
    expect(result.errors).toHaveLength(1);
    expect(result.data).toBeNull();
  });
});
