import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Users, 
  MessageSquare,
  PhoneCall,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { SupportTicketList } from "./SupportTicketList";
import { TeamPerformance } from "./TeamPerformance";

export function SupportDashboard() {
  const [ticketFilter, setTicketFilter] = useState("all");
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header with Reference Image */}
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
            <Image 
              src="https://assets.co.dev/19129c8d-1c91-4384-9bc0-e0d1fdc82154/img_7408-4ea2942.heic"
              alt="Support Dashboard Overview"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Support Operations Center</h2>
                <p className="max-w-md">Real-time monitoring and management of support activities and SLA compliance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Open Tickets" 
          value="42" 
          description="8 critical" 
          trend="+5% from yesterday"
          trendDirection="up"
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <MetricCard 
          title="Avg. Response Time" 
          value="28m" 
          description="SLA: 30m" 
          trend="-12% from last week"
          trendDirection="down"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard 
          title="SLA Compliance" 
          value="94%" 
          description="Target: 95%" 
          trend="+2% from last week"
          trendDirection="up"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard 
          title="Team Availability" 
          value="85%" 
          description="12/14 agents active" 
          trend="-5% from yesterday"
          trendDirection="down"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Ticket Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Active Tickets</span>
              <div className="flex space-x-2">
                <Badge variant={ticketFilter === "all" ? "default" : "outline"} onClick={() => setTicketFilter("all")} className="cursor-pointer">All</Badge>
                <Badge variant={ticketFilter === "critical" ? "default" : "outline"} onClick={() => setTicketFilter("critical")} className="cursor-pointer">Critical</Badge>
                <Badge variant={ticketFilter === "sla" ? "default" : "outline"} onClick={() => setTicketFilter("sla")} className="cursor-pointer">SLA Risk</Badge>
              </div>
            </CardTitle>
            <CardDescription>Manage and track support tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <SupportTicketList filter={ticketFilter} />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline">View All Tickets</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
            <CardDescription>Ticket sources last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChannelItem 
                icon={<MessageSquare className="h-5 w-5 text-blue-500" />} 
                name="Chat" 
                count={24} 
                percentage={48} 
                color="bg-blue-500" 
              />
              <ChannelItem 
                icon={<PhoneCall className="h-5 w-5 text-green-500" />} 
                name="Phone" 
                count={15} 
                percentage={30} 
                color="bg-green-500" 
              />
              <ChannelItem 
                icon={<Mail className="h-5 w-5 text-amber-500" />} 
                name="Email" 
                count={11} 
                percentage={22} 
                color="bg-amber-500" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Agent productivity and SLA adherence</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamPerformance />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, description, trend, trendDirection, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="flex items-center mt-2 text-xs">
          {trendDirection === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
          )}
          <span className={trendDirection === "up" ? "text-red-500" : "text-green-500"}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ChannelItem({ icon, name, count, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="text-sm font-medium">{count} tickets</div>
      </div>
      <Progress value={percentage} className={`h-2 ${color}`} />
      <div className="text-xs text-muted-foreground text-right">{percentage}%</div>
    </div>
  );
}