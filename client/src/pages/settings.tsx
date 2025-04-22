import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/context/web3-context";
import { AlertCircle, Save, ChevronRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { isConnected, walletAddress, BSC_EXPLORER_URL } = useWeb3();
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("usd");
  const [gas, setGas] = useState("normal");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your preferences and wallet settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">Enable Notifications</Label>
                  <p className="text-sm text-gray-400">Get notified about transactions and burns</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">Theme Preference</Label>
                <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">System</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">Currency Display</Label>
                <RadioGroup value={currency} onValueChange={setCurrency} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="usd" id="usd" />
                    <Label htmlFor="usd">USD</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eur" id="eur" />
                    <Label htmlFor="eur">EUR</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gbp" id="gbp" />
                    <Label htmlFor="gbp">GBP</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">Gas Price Preference</Label>
                <RadioGroup value={gas} onValueChange={setGas} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="slow" id="slow" />
                    <Label htmlFor="slow">Slow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fast" id="fast" />
                    <Label htmlFor="fast">Fast</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button className="w-full" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected && walletAddress ? (
                <>
                  <div>
                    <Label className="text-sm text-gray-400">Connected Wallet</Label>
                    <p className="font-mono text-sm break-all mt-1">{walletAddress}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-400">Network</Label>
                    <p className="mt-1">Binance Smart Chain (BSC)</p>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <a href={`${BSC_EXPLORER_URL}/address/${walletAddress}`} target="_blank" rel="noopener noreferrer">
                      View on BSCScan
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="mb-4">No wallet connected</p>
                  <Button>Connect Wallet</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>About TokenBurn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-400">Token Contract</Label>
                <p className="font-mono text-xs break-all mt-1">0xfa4C07636B53D868E514777B9d4005F1e9c6c40B</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Version</Label>
                <p className="mt-1">1.0.0</p>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
