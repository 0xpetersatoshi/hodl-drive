import Transaction from "../transaction/transaction.component";
import { TransactionNode } from "@/app/types";

type TransactionListProps = {
  transactions: TransactionNode[];
};

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className="flex flex-col items-center justify-center bg-black w-full p-4">
      {transactions.map((transaction) => (
        <Transaction key={transaction.id} id={transaction.id} />
      ))}
    </div>
  );
};

export default TransactionList;
