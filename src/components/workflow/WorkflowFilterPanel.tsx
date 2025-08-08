import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export interface WorkflowFilters {
  status: string;
  processName: string;
}

interface WorkflowFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: WorkflowFilters;
  onFiltersChange: (filters: WorkflowFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function WorkflowFilterPanel({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
}: WorkflowFilterPanelProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleProcessNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFiltersChange({ ...filters, processName: e.target.value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Open filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Workflow</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="processName" className="text-right">
              Process Name
            </Label>
            <Input
              id="processName"
              value={filters.processName}
              onChange={handleProcessNameChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                <SelectItem value="NOT STARTED">Not Started</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onResetFilters}>
            Reset
          </Button>
          <SheetClose asChild>
            <Button onClick={onApplyFilters}>Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}