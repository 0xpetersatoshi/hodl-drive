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
});
