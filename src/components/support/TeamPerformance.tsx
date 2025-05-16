import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, MessageSquare, PhoneCall } from "lucide-react";

export function TeamPerformance() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-sm font-medium mb-1">Avg. Tickets per Agent</div>
          <div className="text-2xl font-bold">8.4</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-sm font-medium mb-1">Avg. Resolution Time</div>
          <div className="text-2xl font-bold">3h 42m</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-sm font-medium mb-1">First Response SLA</div>
          <div className="text-2xl font-bold">97.8%</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-sm font-medium mb-1">CSAT Score</div>
          <div className="text-2xl font-bold">4.7/5</div>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/30">
          <div className="col-span-3">Agent</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Tickets</div>
          <div className="col-span-3">SLA Compliance</div>
          <div className="col-span-2">CSAT</div>
        </div>
        
        <div className="divide-y">
          {agentPerformanceData.map((agent, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-3 flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.role}</div>
                </div>
              </div>
              
              <div className="col-span-2">
                <AgentStatusBadge status={agent.status} />
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <div className="font-medium">{agent.tickets.active}</div>
                  <div className="text-xs text-muted-foreground">
                    ({agent.tickets.closed} closed today)
                  </div>
                </div>
              </div>
              
              <div className="col-span-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{agent.sla.percentage}%</span>
                    <SLAIndicator status={getSLAStatus(agent.sla.percentage)} />
                  </div>
                  <Progress value={agent.sla.percentage} className="h-2" />
                </div>
              </div>
              
              <div className="col-span-2">
                <div className="font-medium">{agent.csat}/5</div>
                <div className="text-xs text-muted-foreground">
                  {agent.responses} responses
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentStatusBadge({ status }) {
  switch (status) {
    case "online":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
          Online
        </Badge>
      );
    case "busy":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <PhoneCall className="h-3 w-3 mr-1" />
          On Call
        </Badge>
      );
    case "away":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Away
        </Badge>
      );
    case "offline":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
          Offline
        </Badge>
      );
    default:
      return null;
  }
}

function SLAIndicator({ status }) {
  switch (status) {
    case "excellent":
      return <span className="text-green-500">Excellent</span>;
    case "good":
      return <span className="text-blue-500">Good</span>;
    case "average":
      return <span className="text-amber-500">Average</span>;
    case "poor":
      return <span className="text-red-500">Poor</span>;
    default:
      return null;
  }
}

function getSLAStatus(percentage) {
  if (percentage >= 95) return "excellent";
  if (percentage >= 90) return "good";
  if (percentage >= 85) return "average";
  return "poor";
}

const agentPerformanceData = [
  {
    name: "Sarah Chen",
    role: "Senior Support Specialist",
    status: "online",
    tickets: { active: 7, closed: 12 },
    sla: { percentage: 98 },
    csat: 4.9,
    responses: 42
  },
  {
    name: "Michael Johnson",
    role: "Technical Support Engineer",
    status: "busy",
    tickets: { active: 5, closed: 8 },
    sla: { percentage: 95 },
    csat: 4.7,
    responses: 35
  },
  {
    name: "Alex Wong",
    role: "Customer Support Agent",
    status: "online",
    tickets: { active: 9, closed: 6 },
    sla: { percentage: 87 },
    csat: 4.5,
    responses: 28
  },
  {
    name: "Emily Davis",
    role: "Product Specialist",
    status: "away",
    tickets: { active: 4, closed: 10 },
    sla: { percentage: 92 },
    csat: 4.8,
    responses: 31
  },
  {
    name: "James Wilson",
    role: "Customer Success Manager",
    status: "online",
    tickets: { active: 6, closed: 9 },
    sla: { percentage: 96 },
    csat: 4.9,
    responses: 38
  },
  {
    name: "Olivia Martinez",
    role: "Support Specialist",
    status: "offline",
    tickets: { active: 0, closed: 7 },
    sla: { percentage: 94 },
    csat: 4.6,
    responses: 25
  }
];