import Transaction from "../transaction/transaction.component";
import { TransactionNode } from "@/app/types";

type TransactionListProps = {
  transactions: TransactionNode[];
};

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {transactions.map((transaction) => (
        <Transaction key={transaction.id} id={transaction.id} />
      ))}
    </div>
  );
};

export default TransactionList;
