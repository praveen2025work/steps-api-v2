import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Sample data for SEA compliance by region
const regionComplianceData = [
  {
    name: "Americas",
    compliance: 94,
    target: 95,
    color: "#4f46e5", // indigo-600
  },
  {
    name: "India",
    compliance: 92,
    target: 95,
    color: "#0891b2", // cyan-600
  },
  {
    name: "Asia",
    compliance: 100,
    target: 95,
    color: "#059669", // emerald-600
  },
  {
    name: "Shanghai",
    compliance: 95,
    target: 95,
    color: "#d97706", // amber-600
  },
  {
    name: "Europe",
    compliance: 97,
    target: 95,
    color: "#7c3aed", // violet-600
  },
];

const chartConfig = {
  compliance: {
    label: "Compliance %",
    color: "#4f46e5", // indigo-600
  },
  target: {
    label: "Target %",
    color: "#dc2626", // red-600
  },
};

export function SEAComplianceByRegion() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>SEA Compliance by Region</CardTitle>
          <CardDescription>Performance across different regions</CardDescription>
        </div>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <RechartsBarChart
              data={regionComplianceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[85, 100]} label={{ value: 'Compliance %', angle: -90, position: 'insideLeft' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="compliance" name="Compliance %" radius={[4, 4, 0, 0]}>
                {regionComplianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar dataKey="target" name="Target %" fill={chartConfig.target.color} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}