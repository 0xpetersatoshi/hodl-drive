export const getTxByAddress = `query getTxByAddress($owners: [String!]) {
    transactions(owners: $owners limit: 100) {
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
            signature
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
