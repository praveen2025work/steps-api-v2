import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Sample data for historical SEA performance
const historicalPerformanceData = [
  { date: "May 1", compliance: 95 },
  { date: "May 2", compliance: 96 },
  { date: "May 3", compliance: 94 },
  { date: "May 4", compliance: 95 },
  { date: "May 5", compliance: 97 },
  { date: "May 6", compliance: 96 },
  { date: "May 7", compliance: 95 },
  { date: "May 8", compliance: 94 },
  { date: "May 9", compliance: 93 },
  { date: "May 10", compliance: 95 },
  { date: "May 11", compliance: 96 },
  { date: "May 12", compliance: 97 },
  { date: "May 13", compliance: 98 },
  { date: "May 14", compliance: 96 },
  { date: "May 15", compliance: 0 }, // Major failure
  { date: "May 16", compliance: 92 },
  { date: "May 17", compliance: 94 },
  { date: "May 18", compliance: 95 },
  { date: "May 19", compliance: 96 },
  { date: "May 20", compliance: 97 },
  { date: "May 21", compliance: 98 },
  { date: "May 22", compliance: 97 },
  { date: "May 23", compliance: 96 },
  { date: "May 24", compliance: 95 },
  { date: "May 25", compliance: 94 },
  { date: "May 26", compliance: 96 },
  { date: "May 27", compliance: 97 },
  { date: "May 28", compliance: 98 },
  { date: "May 29", compliance: 99 },
  { date: "May 30", compliance: 97 },
];

const chartConfig = {
  compliance: {
    label: "Compliance %",
    color: "#4f46e5", // indigo-600
  },
  target: {
    label: "Target (95%)",
    color: "#dc2626", // red-600
  },
};

export function HistoricalSEAPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical SEA Performance</CardTitle>
        <CardDescription>SLA compliance over time (past 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <RechartsAreaChart
              data={historicalPerformanceData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <ReferenceLine y={95} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Target (95%)', position: 'right', fill: '#dc2626' }} />
              <Area
                type="monotone"
                dataKey="compliance"
                name="Compliance %"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#colorCompliance)"
              />
            </RechartsAreaChart>
          </ChartContainer>
        </div>
        <div className="mt-4 text-sm text-red-500">
          <p>Note: Major system failure on May 15, 2025 resulted in 0% SLA compliance</p>
        </div>
      </CardContent>
    </Card>
  );
}