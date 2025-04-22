import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatTokenAmount } from "@/lib/web3";
import { Loader2, Coins, Flame, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TokenStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/token/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
              </div>
              <Skeleton className="h-8 w-32 mb-1 bg-gray-700" />
              <Skeleton className="h-4 w-40 bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Failed to load token statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Supply",
      value: formatTokenAmount(stats.totalSupply),
      change: "-0.15% since last month",
      changeColor: "text-primary",
      icon: Coins,
      iconBg: "bg-blue-500 bg-opacity-20",
      iconColor: "text-primary"
    },
    {
      title: "Burned Tokens",
      value: formatTokenAmount(stats.burnedTokens),
      change: "+3.2% since last month",
      changeColor: "text-destructive",
      icon: Flame,
      iconBg: "bg-red-500 bg-opacity-20",
      iconColor: "text-destructive"
    },
    {
      title: "Current Price",
      value: stats.price,
      change: "+1.8% since yesterday",
      changeColor: "text-green-500",
      icon: DollarSign,
      iconBg: "bg-green-500 bg-opacity-20",
      iconColor: "text-green-500"
    },
    {
      title: "Holders",
      value: stats.holders.toLocaleString(),
      change: "+258 new holders this week",
      changeColor: "text-purple-500",
      icon: Users,
      iconBg: "bg-purple-500 bg-opacity-20",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="text-gray-400 text-sm">{card.title}</div>
              <div className={`w-8 h-8 rounded-full ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-xs">
              <span className={card.changeColor}>{card.change.split(" ")[0]}</span>
              {" " + card.change.split(" ").slice(1).join(" ")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
