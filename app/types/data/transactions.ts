type Tag = {
  name: string;
  value: string;
};

type TransactionNode = {
  id: string;
  address: string;
  currency: string;
  tags: Tag[];
  receipt: null;
  timestamp: number;
  signature: string;
};

type TransactionEdge = {
  node: TransactionNode;
};

export type { TransactionEdge };
