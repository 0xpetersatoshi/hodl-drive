import Transaction from "../transaction/transaction.component";
import { TransactionNode } from "@/app/types";

type TransactionListProps = {
  transactions: TransactionNode[];
};

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className="bg-gray-900 flex flex-col items-center justify-center w-full p-4">
      {transactions.map((transaction) => (
        <Transaction key={transaction.id} id={transaction.id} />
      ))}
    </div>
  );
};

export default TransactionList;
