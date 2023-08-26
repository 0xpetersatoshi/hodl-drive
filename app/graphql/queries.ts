export const getTxByAddress = `query getTxByAddress($owners: [String!], $tags: [TagFilter!], $limit: Int, $order: SortOrder) {
  transactions(owners: $owners tags: $tags limit: $limit order: $order) {
    edges {
      node {
        id
        address
        currency
        tags {
          name
          value
        }
        receipt {
          timestamp
        }
        timestamp
        signature
      }
    }
  }
}`;

export const getTxById = `query getTxById($txIds: [String!]) {
    transactions(ids: $txIds limit: 1) {
      edges {
        node {
          id
          address
          currency
          tags {
            name
            value
          }
          receipt {
            timestamp
          }
          timestamp
          signature
        }
      }
    }
  }
  `;
