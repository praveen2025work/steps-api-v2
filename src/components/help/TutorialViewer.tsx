import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, Download, BookOpen, PlayCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tutorial } from '@/types/documentation-types';

interface TutorialViewerProps {
  tutorial: Tutorial;
  onBack: () => void;
}

export default function TutorialViewer({ tutorial, onBack }: TutorialViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const handleNextStep = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const markStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  };
  
  const progress = Math.round((completedSteps.length / tutorial.steps.length) * 100);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tutorials
        </Button>
        <div className="flex items-center">
          <Badge>{tutorial.level}</Badge>
          <span className="ml-4 text-sm text-muted-foreground flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {tutorial.duration}
          </span>
        </div>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">{tutorial.title}</h1>
        <p className="text-muted-foreground mt-1">{tutorial.description}</p>
      </div>
      
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6">
        {/* Steps sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
              <Progress value={progress} className="h-2" />
              <CardDescription>{progress}% complete</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="px-4 py-2">
                  {tutorial.steps.map((step, index) => (
                    <Button
                      key={index}
                      variant={currentStep === index ? "secondary" : "ghost"}
                      className="w-full justify-start mb-1 relative pl-8"
                      onClick={() => setCurrentStep(index)}
                    >
                      {completedSteps.includes(index) ? (
                        <CheckCircle className="h-4 w-4 absolute left-2 text-green-500" />
                      ) : (
                        <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center absolute left-2 text-xs">
                          {index + 1}
                        </span>
                      )}
                      <span className="truncate">{step.title}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:w-3/4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{tutorial.steps[currentStep].title}</CardTitle>
                <Badge variant="outline">Step {currentStep + 1} of {tutorial.steps.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="instructions">
                <TabsList>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  {tutorial.steps[currentStep].videoUrl && (
                    <TabsTrigger value="video">Video</TabsTrigger>
                  )}
                  {tutorial.steps[currentStep].resources && (
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="instructions" className="min-h-[400px]">
                  <ScrollArea className="h-[400px] pr-4">
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert" 
                      dangerouslySetInnerHTML={{ __html: tutorial.steps[currentStep].content }}
                    />
                  </ScrollArea>
                </TabsContent>
                
                {tutorial.steps[currentStep].videoUrl && (
                  <TabsContent value="video" className="min-h-[400px]">
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2">Video tutorial would play here</p>
                        <Button variant="outline" className="mt-4">
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Play Video
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )}
                
                {tutorial.steps[currentStep].resources && (
                  <TabsContent value="resources" className="min-h-[400px]">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Additional Resources</h3>
                        <div className="grid gap-2">
                          {tutorial.steps[currentStep].resources?.map((resource, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{resource.title}</h4>
                                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                onClick={markStepComplete}
                disabled={completedSteps.includes(currentStep)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </Button>
              {currentStep < tutorial.steps.length - 1 ? (
                <Button onClick={handleNextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={onBack}>
                  Finish Tutorial
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}