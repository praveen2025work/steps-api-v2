import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Sample data for processing time trends
const processingTimeData = [
  {
    name: "Week 1",
    dataCollection: 12,
    validation: 9,
    substantiation: 18,
    reconciliation: 14,
    approval: 6,
    reporting: 8,
    finalization: 4,
  },
  {
    name: "Week 2",
    dataCollection: 11,
    validation: 8,
    substantiation: 17,
    reconciliation: 13,
    approval: 5,
    reporting: 7,
    finalization: 3,
  },
  {
    name: "Week 3",
    dataCollection: 10,
    validation: 8,
    substantiation: 16,
    reconciliation: 12,
    approval: 5,
    reporting: 7,
    finalization: 3,
  },
  {
    name: "Week 4",
    dataCollection: 10,
    validation: 8,
    substantiation: 15,
    reconciliation: 12,
    approval: 5,
    reporting: 7,
    finalization: 3,
  },
  {
    name: "Week 5",
    dataCollection: 10,
    validation: 8,
    substantiation: 15,
    reconciliation: 12,
    approval: 5,
    reporting: 7,
    finalization: 3,
  },
  {
    name: "Week 6",
    dataCollection: 9,
    validation: 7,
    substantiation: 14,
    reconciliation: 11,
    approval: 4,
    reporting: 6,
    finalization: 3,
  },
  {
    name: "Week 7",
    dataCollection: 9,
    validation: 7,
    substantiation: 14,
    reconciliation: 11,
    approval: 4,
    reporting: 6,
    finalization: 3,
  },
  {
    name: "Week 8",
    dataCollection: 8,
    validation: 7,
    substantiation: 13,
    reconciliation: 10,
    approval: 4,
    reporting: 6,
    finalization: 3,
  },
];

const chartConfig = {
  dataCollection: {
    label: "Data Collection",
    color: "#4f46e5", // indigo-600
  },
  validation: {
    label: "Validation",
    color: "#0891b2", // cyan-600
  },
  substantiation: {
    label: "Substantiation",
    color: "#059669", // emerald-600
  },
  reconciliation: {
    label: "Reconciliation",
    color: "#d97706", // amber-600
  },
  approval: {
    label: "Approval",
    color: "#dc2626", // red-600
  },
  reporting: {
    label: "Reporting",
    color: "#7c3aed", // violet-600
  },
  finalization: {
    label: "Finalization",
    color: "#2563eb", // blue-600
  },
};

export function ProcessingTimeTrends() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Processing Time Trends</CardTitle>
          <CardDescription>Average processing times by stage (minutes)</CardDescription>
        </div>
        <LineChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <RechartsLineChart
              data={processingTimeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="dataCollection"
                stroke={chartConfig.dataCollection.color}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="validation"
                stroke={chartConfig.validation.color}
              />
              <Line
                type="monotone"
                dataKey="substantiation"
                stroke={chartConfig.substantiation.color}
              />
              <Line
                type="monotone"
                dataKey="reconciliation"
                stroke={chartConfig.reconciliation.color}
              />
              <Line
                type="monotone"
                dataKey="approval"
                stroke={chartConfig.approval.color}
              />
              <Line
                type="monotone"
                dataKey="reporting"
                stroke={chartConfig.reporting.color}
              />
              <Line
                type="monotone"
                dataKey="finalization"
                stroke={chartConfig.finalization.color}
              />
            </RechartsLineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}