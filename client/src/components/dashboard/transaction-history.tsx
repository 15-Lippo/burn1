import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, formatAddress, getExplorerLink, formatDate } from "@/lib/web3";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, ArrowRightLeft, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/components/ui/link";

export default function TransactionHistory() {
  const [page, setPage] = useState(0);
  const pageSize = 3;

  const { data, isLoading } = useQuery({
    queryKey: ['/api/transactions', page, pageSize],
    queryFn: () => fetchTransactions(pageSize, page * pageSize),
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-48 bg-gray-700" />
            <Skeleton className="h-8 w-24 bg-gray-700" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 font-medium">Transaction</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">From</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-750">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                        <div>
                          <Skeleton className="h-5 w-16 mb-1 bg-gray-700" />
                          <Skeleton className="h-3 w-32 bg-gray-700" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3"><Skeleton className="h-5 w-20 bg-gray-700" /></td>
                    <td className="py-3"><Skeleton className="h-5 w-24 bg-gray-700" /></td>
                    <td className="py-3"><Skeleton className="h-5 w-24 bg-gray-700" /></td>
                    <td className="py-3"><Skeleton className="h-6 w-20 rounded-full bg-gray-700" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Skeleton className="h-5 w-48 bg-gray-700" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-lg bg-gray-700" />
              <Skeleton className="h-8 w-8 rounded-lg bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Transaction History</h3>
            <Button variant="ghost" size="sm" disabled>
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
          
          <div className="py-12 text-center">
            <p className="text-gray-400">No transactions found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data: transactions, pagination } = data;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "burn":
        return {
          icon: Flame,
          bgColor: "bg-red-500 bg-opacity-20",
          textColor: "text-destructive"
        };
      case "transfer":
        return {
          icon: ArrowRightLeft,
          bgColor: "bg-blue-500 bg-opacity-20",
          textColor: "text-primary"
        };
      case "receive":
        return {
          icon: ArrowRightLeft,
          bgColor: "bg-purple-500 bg-opacity-20",
          textColor: "text-accent"
        };
      default:
        return {
          icon: ArrowRightLeft,
          bgColor: "bg-gray-500 bg-opacity-20",
          textColor: "text-gray-400"
        };
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "burn":
      case "transfer":
        return "text-destructive";
      case "receive":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "burn":
      case "transfer":
        return "-";
      case "receive":
        return "+";
      default:
        return "";
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Transaction History</h3>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 font-medium">Transaction</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">From</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {transactions.map((tx) => {
                const { icon: Icon, bgColor, textColor } = getTransactionIcon(tx.type);
                const amountColor = getAmountColor(tx.type);
                const amountPrefix = getAmountPrefix(tx.type);
                
                return (
                  <tr key={tx.id} className="hover:bg-gray-750">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
                          <Icon className={`${textColor} text-xs`} />
                        </div>
                        <div>
                          <div className="font-medium capitalize">{tx.type}</div>
                          <div className="font-mono text-xs text-gray-400 truncate max-w-[100px] md:max-w-xs">
                            <Link
                              href={getExplorerLink("tx", tx.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors"
                            >
                              {tx.txHash}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 ${amountColor}`}>{amountPrefix}{parseInt(tx.amount).toLocaleString()}</td>
                    <td className="py-3 text-gray-400">{formatDate(tx.timestamp)}</td>
                    <td className="py-3 font-mono text-xs text-gray-400 truncate max-w-[80px] md:max-w-[120px]">
                      <Link
                        href={getExplorerLink("address", tx.walletAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {formatAddress(tx.walletAddress)}
                      </Link>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-xs">
                        {tx.status === "confirmed" ? "Confirmed" : tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing {Math.min(pageSize, transactions.length)} of {pagination.total} transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={pagination.remaining <= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
