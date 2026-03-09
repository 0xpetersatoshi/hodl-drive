export const MOCK_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

export const MOCK_TX_ID = "tx-abc123def456";
export const MOCK_TX_ID_2 = "tx-xyz789ghi012";

export const MOCK_TIMESTAMP = 1700000000000;

export const MOCK_UPLOAD_RESPONSE = {
  id: MOCK_TX_ID,
  url: `https://arweave.net/${MOCK_TX_ID}`,
};

function makeTxNode(id: string, address: string, timestamp: number) {
  return {
    id,
    address,
    currency: "ethereum",
    tags: [{ name: "schemaVersion", value: "1.0" }],
    receipt: null,
    timestamp,
    signature: "mock-signature",
  };
}

export const MOCK_TX_DETAIL_RESPONSE = {
  data: {
    transactions: {
      edges: [{ node: makeTxNode(MOCK_TX_ID, MOCK_ADDRESS, MOCK_TIMESTAMP) }],
    },
  },
};

export const MOCK_UPLOADS_LIST_RESPONSE = {
  data: {
    transactions: {
      edges: [
        { node: makeTxNode(MOCK_TX_ID, MOCK_ADDRESS, MOCK_TIMESTAMP) },
        {
          node: makeTxNode(MOCK_TX_ID_2, MOCK_ADDRESS, MOCK_TIMESTAMP + 1000),
        },
      ],
    },
  },
};

export const MOCK_UPLOADS_EMPTY_RESPONSE = {
  data: {
    transactions: {
      edges: [],
    },
  },
};

// Random bytes that will fail decryption — Transaction component catches this gracefully
export const MOCK_ARWEAVE_DATA = {
  file: {
    chunks: [{ data: "bW9jayBkYXRh", iv: "bW9jayBpdg==" }],
  },
  metadata: { data: "bW9jayBtZXRhZGF0YQ==", iv: "bW9jayBtZXRhIGl2" },
  schemaVersion: "1.0",
};
