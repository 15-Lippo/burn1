import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";

export default function SupplyChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/token/stats'],
  });

  useEffect(() => {
    if (!chartRef.current || !stats) return;
    
    // Clean up previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const totalSupply = parseInt(stats.totalSupply, 10);
    const burnedTokens = parseInt(stats.burnedTokens, 10);
    const circulatingSupply = totalSupply - burnedTokens;
    
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Circulating Supply", "Burned Supply"],
        datasets: [
          {
            data: [circulatingSupply, burnedTokens],
            backgroundColor: ["#3B82F6", "#EF4444"],
            borderColor: "rgba(0, 0, 0, 0)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#9CA3AF",
              padding: 20,
              font: {
                size: 12,
              },
            },
          },
        },
      },
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stats]);

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32 bg-gray-700" />
            <Skeleton className="h-6 w-48 bg-gray-700" />
          </div>
          <Skeleton className="h-60 w-full bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Supply Reduction</h3>
          </div>
          <div className="h-60 flex items-center justify-center">
            <p className="text-gray-400">Failed to load supply data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate burn percentage
  const totalSupply = BigInt(stats.totalSupply);
  const burnedTokens = BigInt(stats.burnedTokens);
  const burnPercentage = Number(burnedTokens * BigInt(1000) / totalSupply) / 10;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Supply Reduction</h3>
          <div className="text-xs font-semibold px-3 py-1 bg-destructive rounded-full">
            -{burnPercentage.toFixed(1)}% of Initial Supply
          </div>
        </div>
        <div className="h-60">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
