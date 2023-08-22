import { GRAPHQL_ENDPOINT } from "../config";

export const fetchGraphQL = async (
  operationsDoc: any,
  operationName: any = "",
  variables: any = {},
  endpoint = GRAPHQL_ENDPOINT,
  headers: any = {
    "Content-Type": "application/json",
  }
): Promise<any> => {
  const result = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
    headers: headers,
  });

  return await result.json();
};
