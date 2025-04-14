import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface ApprovalItem {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  assignee: string;
}

interface PriorityApprovalsProps {
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  items: ApprovalItem[];
}

const PriorityApprovals = ({
  highPriority,
  mediumPriority,
  lowPriority,
  items
}: PriorityApprovalsProps) => {
  // Get priority badge configuration
  const getPriorityConfig = (priority: ApprovalItem["priority"]) => {
    switch (priority) {
      case "high":
        return {
          label: "High",
          icon: <AlertTriangle className="h-3 w-3" />,
          color: "bg-red-500/10 text-red-500 border-red-500/20"
        };
      case "medium":
        return {
          label: "Medium",
          icon: <Clock className="h-3 w-3" />,
          color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        };
      case "low":
        return {
          label: "Low",
          icon: <CheckCircle2 className="h-3 w-3" />,
          color: "bg-green-500/10 text-green-500 border-green-500/20"
        };
    }
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (name === "Unassigned") return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <p className="text-xl font-bold text-red-500">{highPriority}</p>
            <p className="text-sm text-red-500/80">High Priority</p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-xl font-bold text-yellow-500">{mediumPriority}</p>
            <p className="text-sm text-yellow-500/80">Medium Priority</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg">
            <p className="text-xl font-bold text-green-500">{lowPriority}</p>
            <p className="text-sm text-green-500/80">Low Priority</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {items.map((item) => {
            const config = getPriorityConfig(item.priority);
            
            return (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(item.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${config.color} border text-xs py-0 px-1.5 h-5`} variant="outline">
                        <span className="flex items-center gap-1">
                          {config.icon}
                          {config.label}
                        </span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.dueDate}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriorityApprovals;