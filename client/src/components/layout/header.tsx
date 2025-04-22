import { useLocation } from "wouter";
import { Shield } from "lucide-react";
import WalletButton from "@/components/wallet/wallet-button";

export default function Header() {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/audit":
        return "Smart Contract Audit";
      case "/burn":
        return "Burn Tokens";
      case "/history":
        return "Transaction History";
      case "/settings":
        return "Settings";
      default:
        return "SecureChain";
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 md:p-6 flex items-center justify-between">
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-lg font-bold">SecureChain</h1>
      </div>
      
      <h2 className="text-xl font-bold hidden md:block">{getPageTitle()}</h2>
      
      <WalletButton />
    </header>
  );
}
