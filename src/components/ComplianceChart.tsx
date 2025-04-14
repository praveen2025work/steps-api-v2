import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ComplianceChartProps {
  complianceRate: number;
}

const ComplianceChart = ({ complianceRate }: ComplianceChartProps) => {
  // Define compliance level thresholds
  const getComplianceLevel = (rate: number) => {
    if (rate >= 90) return { label: "High", color: "bg-green-500" };
    if (rate >= 75) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Low", color: "bg-red-500" };
  };

  const level = getComplianceLevel(complianceRate);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Regulatory Compliance Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{complianceRate}%</p>
              <p className="text-sm text-muted-foreground">Overall compliance</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${level.color}/10 ${level.color} text-white text-xs font-medium`}>
              {level.label}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Documentation</span>
              <span>98%</span>
            </div>
            <Progress value={98} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Process Adherence</span>
              <span>92%</span>
            </div>
            <Progress value={92} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Reporting</span>
              <span>96%</span>
            </div>
            <Progress value={96} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Audit Readiness</span>
              <span>90%</span>
            </div>
            <Progress value={90} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceChart;