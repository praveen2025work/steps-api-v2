import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Sample applications data
const applications = [
  { id: "APP-001", name: "eRates" },
  { id: "APP-002", name: "PnL System" },
  { id: "APP-003", name: "Risk Analytics" },
  { id: "APP-004", name: "Trade Capture" },
  { id: "APP-005", name: "Settlements" }
];

// Sample teams data
const teams = [
  { name: "PnL Team" },
  { name: "Rates Team" },
  { name: "FX Team" },
  { name: "Technical Support" },
  { name: "Operations" },
  { name: "Compliance" },
  { name: "Risk Team" }
];

interface CreateSupportIssueProps {
  processId: string;
  processName: string;
  application?: string;
  businessDate?: string;
  onIssueCreated?: () => void;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
}

export function CreateSupportIssue({
  processId,
  processName,
  application = "",
  businessDate = new Date().toISOString().split('T')[0],
  onIssueCreated,
  buttonVariant = "outline",
  buttonSize = "sm",
  buttonClassName = ""
}: CreateSupportIssueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New issue template
  const [newIssue, setNewIssue] = useState({
    processId: processId,
    title: `Issue with ${processName}`,
    team: "",
    priority: "",
    application: application,
    businessDate: businessDate,
    estimatedFixTime: "",
    description: ""
  });
  
  // Handle creating a new issue
  const handleCreateIssue = () => {
    setIsSubmitting(true);
    
    // Validate required fields
    if (!newIssue.processId || !newIssue.title || !newIssue.team || !newIssue.priority || !newIssue.application) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    
    setTimeout(() => {
      // In a real application, this would send the data to an API
      
      // Reset form
      setNewIssue({
        processId: processId,
        title: `Issue with ${processName}`,
        team: "",
        priority: "",
        application: application,
        businessDate: businessDate,
        estimatedFixTime: "",
        description: ""
      });
      
      setIsOpen(false);
      setIsSubmitting(false);
      toast.success("Support issue created successfully");
      
      // Call the callback if provided
      if (onIssueCreated) {
        onIssueCreated();
      }
    }, 800); // Simulate network delay
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize} 
          className={buttonClassName}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Report Process Issue</DialogTitle>
          <DialogDescription>
            Create a support issue for this process.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="processId" className="text-right text-sm">
              Process ID *
            </label>
            <Input 
              id="processId" 
              className="col-span-3" 
              value={newIssue.processId}
              onChange={(e) => setNewIssue({...newIssue, processId: e.target.value})}
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right text-sm">
              Issue Title *
            </label>
            <Input 
              id="title" 
              className="col-span-3" 
              placeholder="Brief description of the issue" 
              value={newIssue.title}
              onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="application" className="text-right text-sm">
              Application *
            </label>
            <Select
              value={newIssue.application}
              onValueChange={(value) => setNewIssue({...newIssue, application: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                {applications.map(app => (
                  <SelectItem key={app.id} value={app.name}>{app.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="team" className="text-right text-sm">
              Team *
            </label>
            <Select
              value={newIssue.team}
              onValueChange={(value) => setNewIssue({...newIssue, team: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.name} value={team.name}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="priority" className="text-right text-sm">
              Priority *
            </label>
            <Select
              value={newIssue.priority}
              onValueChange={(value) => setNewIssue({...newIssue, priority: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="businessDate" className="text-right text-sm">
              Business Date *
            </label>
            <Input 
              id="businessDate" 
              className="col-span-3" 
              type="date" 
              value={newIssue.businessDate}
              onChange={(e) => setNewIssue({...newIssue, businessDate: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="estimatedFixTime" className="text-right text-sm">
              Est. Fix Time
            </label>
            <Input 
              id="estimatedFixTime" 
              className="col-span-3" 
              placeholder="e.g. 2h 30m" 
              value={newIssue.estimatedFixTime}
              onChange={(e) => setNewIssue({...newIssue, estimatedFixTime: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right text-sm">
              Description
            </label>
            <Textarea 
              id="description" 
              className="col-span-3 min-h-[100px]"
              placeholder="Detailed description of the issue"
              value={newIssue.description}
              onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleCreateIssue} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Submit Issue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}