import { Link, useLocation } from "wouter";
import { ChartLine, History, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: ChartLine, current: location === "/" },
    { name: "Audit", href: "/audit", icon: Shield, current: location === "/audit" },
    { name: "History", href: "/history", icon: History, current: location === "/history" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2">
      <ul className="flex justify-around">
        {navigation.map((item) => (
          <li key={item.name}>
            <Link href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center p-2",
                  item.current ? "text-white" : "text-gray-400"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
