import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BurnForm from "@/components/dashboard/burn-form";
import { useQuery } from "@tanstack/react-query";
import { formatTokenAmount } from "@/lib/web3";
import RecentBurns from "@/components/dashboard/recent-burns";
import { Flame } from "lucide-react";

export default function Burn() {
  const { data: stats } = useQuery({
    queryKey: ['/api/token/stats'],
  });

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Burn Tokens</h1>
        <p className="text-gray-400">
          Permanently remove tokens from circulation to reduce supply
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 md:col-span-2">
          <CardHeader>
            <CardTitle>Burn Your Tokens</CardTitle>
            <CardDescription>
              Tokens sent to the burn address are permanently removed from circulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BurnForm />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Burn Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Total Supply</p>
                <p className="text-xl font-bold">
                  {stats ? formatTokenAmount(stats.totalSupply) : "Loading..."}
                </p>
              </div>
              
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Total Burned</p>
                <p className="text-xl font-bold text-destructive">
                  {stats ? formatTokenAmount(stats.burnedTokens) : "Loading..."}
                </p>
              </div>
              
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Burn Address</p>
                <p className="text-sm font-mono text-gray-300 break-all">
                  0x000000000000000000000000000000000000dEaD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-destructive" />
            <CardTitle>Recent Burns</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <RecentBurns />
        </CardContent>
      </Card>
    </div>
  );
}
