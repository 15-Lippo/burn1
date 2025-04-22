import TokenStats from "@/components/dashboard/token-stats";
import BurnChart from "@/components/dashboard/burn-chart";
import SupplyChart from "@/components/dashboard/supply-chart";
import BurnForm from "@/components/dashboard/burn-form";
import RecentBurns from "@/components/dashboard/recent-burns";
import TransactionHistory from "@/components/dashboard/transaction-history";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Token stats cards */}
      <TokenStats />
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BurnChart />
        <SupplyChart />
      </div>
      
      {/* Burn tokens section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-5">
          <h3 className="font-bold text-lg mb-4">Burn Tokens</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-4">
                Burning tokens permanently removes them from circulation, potentially increasing the value of remaining tokens by reducing supply.
              </p>
              
              <BurnForm />
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium mb-3">Recent Burns</h4>
              <RecentBurns />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction history */}
      <TransactionHistory />
    </div>
  );
}
