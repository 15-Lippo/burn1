import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, formatAddress, getExplorerLink, formatDate } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, ArrowRightLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Link } from "@/components/ui/link";

export default function History() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['/api/transactions', page, pageSize, filter, searchQuery],
    queryFn: () => fetchTransactions(pageSize, page * pageSize),
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would implement address search functionality
    console.log("Search query:", searchQuery);
  };

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
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
        <p className="text-gray-400">
          View and track all transactions for the token
        </p>
      </div>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>All Transactions</CardTitle>
            
            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  placeholder="Search address..."
                  className="w-full md:w-64 pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full"
                  type="submit"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              <Select 
                value={filter} 
                onValueChange={setFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="burn">Burns</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                  <SelectItem value="receive">Receives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="burns">Burns</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading transactions...</p>
                </div>
              ) : !data || !data.data || data.data.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No transactions found</p>
                </div>
              ) : (
                <>
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
                        {data.data.map((tx) => {
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
                      Showing {Math.min(pageSize, data.data.length)} of {data.pagination.total} transactions
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
                        disabled={data.pagination.remaining <= 0}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="burns">
              <div className="text-center py-8">
                <p className="text-gray-400">Filtered burn transactions will appear here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="transfers">
              <div className="text-center py-8">
                <p className="text-gray-400">Filtered transfer transactions will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
