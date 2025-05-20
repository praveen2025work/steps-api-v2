import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Command, Zap, MessageSquare, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommandResult {
  id: string;
  command: string;
  result: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
}

interface CommandSuggestion {
  command: string;
  description: string;
}

const commandSuggestions: CommandSuggestion[] = [
  { 
    command: "Show PnL status for today", 
    description: "Displays the current status of today's PnL workflow" 
  },
  { 
    command: "Complete data validation stage for Rates workflow", 
    description: "Marks the data validation stage as complete in the Rates workflow" 
  },
  { 
    command: "Create new support ticket for eRates data issue", 
    description: "Opens a new support ticket for an eRates data issue" 
  },
  { 
    command: "Show bottlenecks in current workflows", 
    description: "Analyzes and displays current workflow bottlenecks" 
  },
  { 
    command: "Generate summary report for yesterday's PnL", 
    description: "Creates a summary report for yesterday's PnL workflow" 
  },
  { 
    command: "Reassign approval task from John to Sarah", 
    description: "Transfers an approval task from John to Sarah" 
  },
  { 
    command: "Show all overdue tasks", 
    description: "Lists all tasks that are past their due date" 
  },
  { 
    command: "Predict completion time for current workflows", 
    description: "Uses AI to predict when current workflows will complete" 
  }
];

export const NLPCommandCenter = () => {
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<CommandSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter suggestions based on current input
    if (currentCommand.trim()) {
      const filtered = commandSuggestions.filter(suggestion => 
        suggestion.command.toLowerCase().includes(currentCommand.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [currentCommand]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCommand.trim()) return;
    
    // Add command to history as pending
    const newCommand: CommandResult = {
      id: Date.now().toString(),
      command: currentCommand,
      result: 'Processing...',
      status: 'pending',
      timestamp: new Date()
    };
    
    setCommandHistory(prev => [newCommand, ...prev]);
    setCurrentCommand('');
    setShowSuggestions(false);
    
    // Simulate processing time
    setTimeout(() => {
      // Generate a response based on the command
      let response = '';
      let status: 'success' | 'error' = 'success';
      
      if (currentCommand.toLowerCase().includes('pnl') && currentCommand.toLowerCase().includes('status')) {
        response = 'Daily Named PnL workflow is currently at 75% completion. Data validation is complete, and risk assessment is in progress. Expected completion time: 2:30 PM.';
      } else if (currentCommand.toLowerCase().includes('complete') && currentCommand.toLowerCase().includes('validation')) {
        response = 'Data validation stage for Rates workflow has been marked as complete. The workflow has progressed to the Risk Assessment stage.';
      } else if (currentCommand.toLowerCase().includes('support ticket') || currentCommand.toLowerCase().includes('create') && currentCommand.toLowerCase().includes('ticket')) {
        response = 'Support ticket #ST-2025-05-042 has been created for eRates data issue. Assigned to the Data Support team with Medium priority.';
      } else if (currentCommand.toLowerCase().includes('bottleneck')) {
        response = 'Analysis complete. Current bottlenecks: 1) Manager Approval stage in PnL workflow (waiting for 45 minutes), 2) Data Validation in eRates workflow (resource constraint).';
      } else if (currentCommand.toLowerCase().includes('report') && currentCommand.toLowerCase().includes('yesterday')) {
        response = 'Summary report for yesterday\'s PnL has been generated and sent to your email. The workflow completed successfully with 2 exceptions that were resolved.';
      } else if (currentCommand.toLowerCase().includes('reassign') || currentCommand.toLowerCase().includes('assign')) {
        response = 'Approval task has been reassigned from John to Sarah. Notification sent to Sarah.';
      } else if (currentCommand.toLowerCase().includes('overdue')) {
        response = 'Found 3 overdue tasks: 1) Final approval for Rates (2 hours overdue), 2) Data reconciliation for eRates (1 hour overdue), 3) Compliance check for PnL (30 minutes overdue).';
      } else if (currentCommand.toLowerCase().includes('predict') && currentCommand.toLowerCase().includes('completion')) {
        response = 'Based on current progress and historical patterns: PnL workflow - 2:30 PM, Rates workflow - 3:15 PM, eRates workflow - 4:00 PM.';
      } else {
        response = 'I\'m sorry, I couldn\'t understand that command. Please try rephrasing or use one of the suggested commands.';
        status = 'error';
      }
      
      // Update the command in history
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === newCommand.id 
            ? { ...cmd, result: response, status: status } 
            : cmd
        )
      );
    }, 1500);
  };

  const selectSuggestion = (suggestion: string) => {
    setCurrentCommand(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Natural Language Command Center
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Control your workflows using natural language commands
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="command">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="command" className="flex items-center gap-2">
            <Command className="h-4 w-4" />
            Command Center
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Command Guide
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="command">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Natural Language Command Interface
              </CardTitle>
              <CardDescription>
                Control your workflows and get information using simple English commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCommandSubmit} className="relative mb-6">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    placeholder="Type a command (e.g., 'Show PnL status for today')"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    className="pr-12"
                    onFocus={() => {
                      if (currentCommand && filteredSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-1 top-1 h-8 w-8"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">Send command</span>
                  </Button>
                </div>
                
                {/* Command suggestions */}
                {showSuggestions && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg"
                  >
                    <ul className="py-1">
                      {filteredSuggestions.map((suggestion, index) => (
                        <li 
                          key={index}
                          className="px-3 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => selectSuggestion(suggestion.command)}
                        >
                          <div className="font-medium">{suggestion.command}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Command History</h3>
                
                {commandHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Command className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No commands yet. Try typing a command above.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-4">
                      {commandHistory.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                              <Command className="h-3 w-3 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.command}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-7 p-3 rounded-md bg-muted">
                            {item.status === 'pending' ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {item.status === 'success' ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <div className="text-red-500">Error:</div>
                                  )}
                                </div>
                                <p>{item.result}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Command Guide</CardTitle>
              <CardDescription>
                Learn how to use natural language commands to control your workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">How It Works</h3>
                  <p className="text-sm text-muted-foreground">
                    The Natural Language Command Center uses AI to understand your instructions in plain English. 
                    Simply type what you want to do, and the system will interpret your request and execute the 
                    appropriate action or provide the information you need.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Example Commands</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commandSuggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <p className="font-medium text-primary">{suggestion.command}</p>
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Command Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-1.5 rounded-full">
                          <Command className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium">Status Queries</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Check the status of workflows, tasks, or processes
                        <br />
                        <span className="italic">Example: "Show PnL status for today"</span>
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-1.5 rounded-full">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium">Actions</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Perform actions like completing stages or creating tickets
                        <br />
                        <span className="italic">Example: "Complete data validation stage"</span>
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-1.5 rounded-full">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium">Predictions</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Get AI-powered predictions about your workflows
                        <br />
                        <span className="italic">Example: "Predict completion time for workflows"</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};