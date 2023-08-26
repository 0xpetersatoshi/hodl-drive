import { TransactionEdge } from "..";

type Transactions = {
  edges: TransactionEdge[];
};

type BundlrData = {
  transactions: Transactions;
};

type BundlrApiResponse = {
  status: number;
  data: BundlrData;
};

export type { BundlrApiResponse };
