import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Shield, Command, ArrowRight, Wand2, PlayCircle, Library, Zap } from 'lucide-react';

const ExperimentalFeaturesPage = () => {
  const router = useRouter();

  const features = [
    {
      title: 'AI Workflow Assistant',
      description: 'Get AI-powered insights and recommendations for your workflows',
      icon: <Sparkles className="h-6 w-6" />,
      href: '/experimental/ai-assistant',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Predictive Analytics',
      description: 'AI-powered predictions and insights for your workflows',
      icon: <TrendingUp className="h-6 w-6" />,
      href: '/experimental/predictive-analytics',
      color: 'bg-green-500/10 text-green-500'
    },

    {
      title: 'Natural Language Commands',
      description: 'Control your workflows using natural language commands',
      icon: <Command className="h-6 w-6" />,
      href: '/experimental/nlp-commands',
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      title: 'Workflow Automation Builder',
      description: 'Create intelligent automation rules to streamline your workflows',
      icon: <Wand2 className="h-6 w-6" />,
      href: '/experimental/workflow-automation',
      color: 'bg-indigo-500/10 text-indigo-500'
    },
    {
      title: 'Workflow Simulator',
      description: 'Simulate and analyze workflow execution to identify bottlenecks',
      icon: <PlayCircle className="h-6 w-6" />,
      href: '/experimental/workflow-simulator',
      color: 'bg-rose-500/10 text-rose-500'
    },
    {
      title: 'Workflow Template Library',
      description: 'Create, manage, and use workflow templates to standardize processes',
      icon: <Library className="h-6 w-6" />,
      href: '/experimental/template-library',
      color: 'bg-teal-500/10 text-teal-500'
    },
    {
      title: 'Integrated Business Rules Engine',
      description: 'Create, manage, and execute business rules and processes with an integrated rules engine',
      icon: <Zap className="h-6 w-6" />,
      href: '/experimental/business-rules-engine',
      color: 'bg-amber-500/10 text-amber-500'
    }
  ];

  return (
    <DashboardLayout title="Experimental Features">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Experimental Features
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Cutting-edge features powered by AI, automation, and advanced workflow tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.title === 'AI Workflow Assistant' && 
                    'Get personalized recommendations to optimize your workflows, identify bottlenecks, and improve efficiency using advanced AI algorithms.'}
                  {feature.title === 'Predictive Analytics' && 
                    'Leverage machine learning to forecast workflow completion times, detect potential bottlenecks before they occur, and identify anomalies in your processes.'}
                  {feature.title === 'Blockchain Audit Trail' && 
                    'Ensure the integrity of your workflow data with an immutable audit trail secured by blockchain technology, providing tamper-proof records for compliance and auditing.'}
                  {feature.title === 'Natural Language Commands' && 
                    'Control your workflows using simple English commands. Just type what you want to do, and the AI will understand and execute the appropriate actions.'}
                  {feature.title === 'Workflow Automation Builder' && 
                    'Create conditional automation rules that trigger actions based on workflow events, status changes, or schedules to reduce manual intervention and streamline processes.'}
                  {feature.title === 'Workflow Simulator' && 
                    'Test and analyze workflow execution in a simulated environment to identify bottlenecks, optimize resource allocation, and ensure SLA compliance before deployment.'}
                  {feature.title === 'Workflow Template Library' && 
                    'Build a library of standardized workflow templates with pre-configured stages, parameters, and automation rules to ensure consistency and accelerate workflow creation.'}
                  {feature.title === 'Integrated Business Rules Engine' && 
                    'Create and manage sophisticated business rules and processes with our integrated engine. Combine the best features of Drools, PEGA, and Appian in a single unified interface. Define rules, design process flows, execute and monitor processes, all without external dependencies.'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => router.push(feature.href)}
                >
                  Explore {feature.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="p-4 bg-muted rounded-lg mt-8">
          <h3 className="font-medium mb-2">About Experimental Features</h3>
          <p className="text-sm text-muted-foreground">
            These features are in beta and are provided for exploration and feedback. They showcase cutting-edge 
            technologies that can enhance your workflow management experience. While functional, they may evolve 
            based on user feedback and technological advancements.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExperimentalFeaturesPage;