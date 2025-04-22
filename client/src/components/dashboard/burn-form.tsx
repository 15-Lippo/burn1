import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useWeb3 } from "@/context/web3-context";
import { useToast } from "@/hooks/use-toast";
import { recordBurnTransaction } from "@/lib/web3";
import { formatTokenAmount } from "@/lib/web3";

export default function BurnForm() {
  const { isConnected, walletAddress, balance, burnTokens, formatAmount } = useWeb3();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to burn tokens",
        variant: "destructive",
      });
      return;
    }
    
    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to burn",
        variant: "destructive",
      });
      return;
    }
    
    // Check balance
    const userBalance = balance ? Number(formatAmount(balance)) : 0;
    if (Number(amount) > userBalance) {
      toast({
        title: "Insufficient balance",
        description: `You only have ${userBalance} tokens available`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Execute burn transaction
      const txHash = await burnTokens(amount);
      
      // Record the burn in our system
      await recordBurnTransaction(
        walletAddress,
        formatAmount(amount),
        txHash
      );
      
      toast({
        title: "Tokens burned successfully",
        description: `You have burned ${amount} tokens`,
      });
      
      // Reset form
      setAmount("");
    } catch (error: any) {
      console.error("Burn error:", error);
      toast({
        title: "Failed to burn tokens",
        description: error.message || "An error occurred while burning tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Amount to Burn</label>
        <div className="relative">
          <Input
            type="text"
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => {
              // Only allow numbers and decimals
              const val = e.target.value;
              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                setAmount(val);
              }
            }}
            disabled={isLoading}
          />
          <div className="absolute right-3 top-3 text-gray-400">Tokens</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 flex justify-between">
        <span>Your Balance:</span>
        <span className="text-white font-medium">
          {isConnected && balance
            ? `${formatAmount(balance)} Tokens`
            : "-- Tokens"}
        </span>
      </div>
      
      <Button
        type="submit"
        variant="destructive"
        className="w-full py-6"
        disabled={!isConnected || isLoading}
      >
        <Flame className="mr-2 h-4 w-4" />
        <span>{isLoading ? "Processing..." : "Burn Tokens"}</span>
      </Button>
    </form>
  );
}
