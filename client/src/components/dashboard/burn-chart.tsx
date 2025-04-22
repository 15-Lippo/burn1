import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentBurns } from "@/lib/web3";
import { formatTokenAmount } from "@/lib/web3";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";

export default function BurnChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeRange, setTimeRange] = useState("7");
  
  const { data: burnData, isLoading } = useQuery({
    queryKey: ['/api/burns'],
  });

  useEffect(() => {
    if (!chartRef.current || !burnData) return;
    
    // Clean up previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Sample data for chart visualization
    // In a real implementation, this would be processed from the actual burn data
    const days = parseInt(timeRange);
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1) + i);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
    
    // Generate sample data with an upward trend
    // In a production app, this would use real data from the API
    const data = Array.from({ length: days }, (_, i) => {
      return Math.floor(120000 + (830000 / days) * i + Math.random() * 50000);
    });
    
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Tokens Burned",
            data,
            borderColor: "#EF4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: {
              color: "#9CA3AF",
            },
          },
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: {
              color: "#9CA3AF",
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
  }, [burnData, timeRange]);

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32 bg-gray-700" />
            <Skeleton className="h-10 w-32 bg-gray-700" />
          </div>
          <Skeleton className="h-60 w-full bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Burn History</h3>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px] bg-gray-700 text-gray-200 border-0">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-60">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
