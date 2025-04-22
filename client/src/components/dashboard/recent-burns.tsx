import { useQuery } from "@tanstack/react-query";
import { formatAddress, getExplorerLink, timeAgo } from "@/lib/web3";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

export default function RecentBurns() {
  const { data: burns, isLoading } = useQuery({
    queryKey: ['/api/burns'],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-gray-700 pb-3">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-5 w-24 mb-1 bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
              </div>
              <Skeleton className="h-4 w-20 bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!burns || burns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No burn transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {burns.slice(0, 3).map((burn) => (
        <div key={burn.id} className="border-b border-gray-700 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium">{parseInt(burn.amount).toLocaleString()} Tokens</div>
              <div className="flex items-center text-xs text-gray-400">
                <div className="font-mono truncate max-w-[120px] md:max-w-[160px]">
                  {formatAddress(burn.walletAddress)}
                </div>
                <Link
                  href={getExplorerLink("tx", burn.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="text-xs text-gray-400">{timeAgo(burn.timestamp)}</div>
          </div>
        </div>
      ))}
      
      <div className="text-center mt-4">
        <Link href="/history" className="text-primary text-sm hover:underline">
          View All Burns
        </Link>
      </div>
    </div>
  );
}
