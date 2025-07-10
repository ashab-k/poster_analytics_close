import { Transaction, TransactionsByChain } from "@/types/Transactions";
import React from "react";
import { Hash, DollarSign, Wallet, Clock, Tag } from "lucide-react";
import { TRANSACTION_TYPE_COLORS } from "@/constants/chains";

interface Props {
  tx: Transaction;
  index: number;
  chainId: string;
  filteredTransactions: TransactionsByChain;
}

const TransactionItems = ({
  tx,
  index,
  chainId,
  filteredTransactions,
}: Props) => {
  const formatHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div>
      <div
        className={`grid grid-cols-1 md:grid-cols-5 gap-4 px-4 py-4 ${
          index < filteredTransactions[chainId].length - 1 ? "border-b" : ""
        }`}
      >
        {/* Transaction Type */}
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              TRANSACTION_TYPE_COLORS[tx.type] || "bg-gray-100 text-gray-800"
            }`}
          >
            {tx.type}
          </span>
          {tx.amount && (
            <span className="ml-2 flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" /> {tx.amount}
            </span>
          )}
        </div>

        {/* Hash */}
        <div className="flex items-center">
          <Hash className="h-4 w-4 mr-1 text-gray-400" />
          <a
            href={`https://etherscan.io/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            {formatHash(tx.hash)}
          </a>
        </div>

        {/* User */}
        <div className="flex items-center">
          <Wallet className="h-4 w-4 mr-1 text-gray-400" />
          {tx.username ? (
            <span>
              {tx.username} ({formatHash(tx.user || "")})
            </span>
          ) : (
            <span>{formatHash(tx.user || "Unknown")}</span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          <span>{formatDate(tx.createdAt)}</span>
        </div>

        {/* Additional Details */}
        <div className="flex flex-wrap gap-2">
          {tx.contract && (
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-1" />
              <span>Contract: {formatHash(tx.contract)}</span>
            </div>
          )}

          {tx.contractType && (
            <div className="px-2 py-1 bg-gray-100 rounded-md text-xs">
              {tx.contractType}
            </div>
          )}

          {tx.platform && (
            <div className="px-2 py-1 bg-gray-100 rounded-md text-xs">
              {tx.platform}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionItems;
