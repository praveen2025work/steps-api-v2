import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  MoreHorizontal,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SupportTicketListProps {
  filter: string;
}

export function SupportTicketList({ filter }: SupportTicketListProps) {
  // Filter tickets based on the selected filter
  const filteredTickets = tickets.filter(ticket => {
    if (filter === "all") return true;
    if (filter === "critical") return ticket.priority === "Critical";
    if (filter === "sla") return ticket.slaStatus === "at-risk" || ticket.slaStatus === "breached";
    return true;
  });

  return (
    <div className="space-y-4">
      {filteredTickets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tickets match the selected filter
        </div>
      ) : (
        filteredTickets.map((ticket) => (
          <TicketItem key={ticket.id} ticket={ticket} />
        ))
      )}
    </div>
  );
}

function TicketItem({ ticket }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarImage src={ticket.customer.avatar} alt={ticket.customer.name} />
            <AvatarFallback>{ticket.customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium flex items-center">
              #{ticket.id} - {ticket.title}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {ticket.customer.name} • {ticket.timeAgo}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getPriorityVariant(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {ticket.category}
              </Badge>
              <SLAStatusBadge status={ticket.slaStatus} timeRemaining={ticket.timeRemaining} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {ticket.assignedTo ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.assignedTo.avatar} alt={ticket.assignedTo.name} />
              <AvatarFallback>{ticket.assignedTo.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Button size="sm" variant="outline" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              Assign
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Assign to Agent</DropdownMenuItem>
              <DropdownMenuItem>Change Priority</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Escalate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function SLAStatusBadge({ status, timeRemaining }) {
  if (status === "compliant") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        On Track
      </Badge>
    );
  } else if (status === "at-risk") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
        <Clock className="h-3 w-3 mr-1" />
        {timeRemaining} left
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        SLA Breached
      </Badge>
    );
  }
}

function getPriorityVariant(priority) {
  switch (priority) {
    case "Critical":
      return "destructive";
    case "High":
      return "default";
    case "Medium":
      return "secondary";
    case "Low":
      return "outline";
    default:
      return "outline";
  }
}

// Sample ticket data
const tickets = [
  {
    id: "T-4291",
    title: "Payment processing failure",
    customer: {
      name: "Acme Corporation",
      avatar: ""
    },
    timeAgo: "35 minutes ago",
    priority: "Critical",
    category: "Billing",
    slaStatus: "at-risk",
    timeRemaining: "1h 23m",
    assignedTo: {
      name: "Sarah Chen",
      avatar: ""
    }
  },
  {
    id: "T-4285",
    title: "Unable to access admin dashboard",
    customer: {
      name: "Global Industries",
      avatar: ""
    },
    timeAgo: "1 hour ago",
    priority: "High",
    category: "Technical",
    slaStatus: "at-risk",
    timeRemaining: "2h 05m",
    assignedTo: {
      name: "Michael Johnson",
      avatar: ""
    }
  },
  {
    id: "T-4278",
    title: "Feature request: Export to CSV",
    customer: {
      name: "Tech Solutions Inc",
      avatar: ""
    },
    timeAgo: "3 hours ago",
    priority: "Medium",
    category: "Feature Request",
    slaStatus: "compliant",
    timeRemaining: "",
    assignedTo: null
  },
  {
    id: "T-4270",
    title: "Login issues after password reset",
    customer: {
      name: "Stellar Enterprises",
      avatar: ""
    },
    timeAgo: "5 hours ago",
    priority: "High",
    category: "Account",
    slaStatus: "breached",
    timeRemaining: "",
    assignedTo: {
      name: "Alex Wong",
      avatar: ""
    }
  },
  {
    id: "T-4265",
    title: "Documentation clarification needed",
    customer: {
      name: "Innovative Labs",
      avatar: ""
    },
    timeAgo: "8 hours ago",
    priority: "Low",
    category: "Documentation",
    slaStatus: "compliant",
    timeRemaining: "",
    assignedTo: {
      name: "Emily Davis",
      avatar: ""
    }
  }
];