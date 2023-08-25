import Transaction from "../transaction/transaction.component";
import { TransactionNode } from "@/app/types";

type TransactionListProps = {
  transactions: TransactionNode[];
};

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div>
      {transactions.map((transaction) => (
        <Transaction key={transaction.id} id={transaction.id} />
      ))}
    </div>
  );
};

export default TransactionList;
