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
