"use client";
import React, { useState } from "react";
import TransactionItems from "./TransactionItems";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Transaction, TransactionsByChain } from "@/types/Transactions";
import { CHAIN_NAMES } from "@/constants/chains";

interface Props {
  chainIds: string[];
  filteredTransactions: TransactionsByChain;
}

const INITIAL_LOAD_COUNT = 100;
const LOAD_INCREMENT = 100;

const TransactionList = ({ chainIds, filteredTransactions }: Props) => {
  const [expandedChains, setExpandedChains] = useState<Set<string>>(new Set());
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>(
    {}
  );

  const handleShowMore = (chainId: string) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [chainId]: (prev[chainId] || INITIAL_LOAD_COUNT) + LOAD_INCREMENT,
    }));
  };
  const toggleChain = (chainId: string) => {
    const newSet = new Set(expandedChains);
    if (newSet.has(chainId)) {
      newSet.delete(chainId);
    } else {
      newSet.add(chainId);
    }
    setExpandedChains(newSet);
  };

  return (
    <div>
      {chainIds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-lg text-gray-500">
            No transactions found matching your filters.
          </p>
        </div>
      ) : (
        chainIds.map((chainId: string) => {
          const transactions = filteredTransactions[chainId] || [];
          const visibleCount = visibleCounts[chainId] || INITIAL_LOAD_COUNT;
          const showLoadMore = visibleCount < transactions.length;
          console.log("chain");

          return (
            <div
              key={chainId}
              className="bg-white rounded-lg shadow-md mb-4 overflow-hidden"
            >
              {/* Chain Header */}
              <div
                className="flex items-center justify-between px-6 py-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleChain(chainId)}
              >
                <div className="flex items-center">
                  <div>
                    <h3 className="text-lg text-gray-900 font-bold">
                      {CHAIN_NAMES[Number(chainId)] || `Chain ${chainId}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {transactions.length} transactions
                    </p>
                  </div>
                </div>
                <div>
                  {expandedChains.has(chainId) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Transaction List */}
              {expandedChains.has(chainId) && (
                <div className="px-4 py-2">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b">
                    <div>Transaction</div>
                    <div>Hash</div>
                    <div>User</div>
                    <div>Date</div>
                    <div>Details</div>
                  </div>

                  {/* Transaction Items */}
                  {transactions
                    .slice(0, visibleCount)
                    .map((tx: Transaction, index: number) => (
                      <TransactionItems
                        key={index}
                        tx={tx}
                        index={index}
                        filteredTransactions={filteredTransactions}
                        chainId={chainId}
                      />
                    ))}

                  {/* Show More Button */}
                  {showLoadMore && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() => handleShowMore(chainId)}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Show more
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TransactionList;
