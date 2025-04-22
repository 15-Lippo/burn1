import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ChartLine, History, Settings, Shield, FileWarning } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: ChartLine, current: location === "/" },
    { name: "Smart Contract Audit", href: "/audit", icon: Shield, current: location === "/audit" },
    { name: "Transaction History", href: "/history", icon: History, current: location === "/history" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-800 p-4 border-r border-gray-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold">SecureChain</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition",
                    item.current
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="px-4 py-3 bg-gray-700 rounded-lg mb-4">
          <div className="text-xs text-gray-400 mb-1">Token Contract</div>
          <div className="font-mono text-xs truncate text-gray-200">
            0xfa4C07636B53D868E514777B9d4005F1e9c6c40B
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-400">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <span>BSC Mainnet Connected</span>
        </div>
      </div>
    </aside>
  );
}
