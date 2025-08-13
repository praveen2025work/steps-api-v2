import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useState, ErrorInfo } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { DateProvider } from '@/contexts/DateContext';
import { ApiEnvironmentProvider } from '@/contexts/ApiEnvironmentContext';
import { UserProvider } from '@/contexts/UserContext';
import { BreadcrumbProvider, useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useDate } from '@/contexts/DateContext';
import { workflowService } from '@/services/workflowService';
import { toast } from 'sonner';

// Create a class component for error boundary
import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('React Error Boundary caught an error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // You could also log to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md p-8 border rounded-lg shadow-lg bg-card">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Something went wrong</h2>
            <p className="mb-4 text-muted-foreground">
              The application encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom error handler to catch and log unhandled errors
const errorHandler = (error: Error, info: { componentStack: string }) => {
  console.error('Application Error:', error);
  console.error('Component Stack:', info.componentStack);
};

// This component will contain the refresh logic
const GlobalRefreshLogic = () => {
  const { state: breadcrumbState, setNodes: setBreadcrumbNodes } = useBreadcrumb();
  const { selectedDate } = useDate();

  useEffect(() => {
    const formatDateForApi = (date: Date): string => {
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const refreshPercentages = async () => {
      if (breadcrumbState.nodes.length === 0) {
        return;
      }

      console.log('--- Starting Breadcrumb Refresh ---');
      
      const dateString = formatDateForApi(selectedDate);
      const updatedNodes = [...breadcrumbState.nodes];
      let changed = false;

      const appResponse = await workflowService.getAllWorkflowApplications({ date: dateString });
      const allApplications = appResponse.success ? appResponse.data : [];

      for (let i = 0; i < updatedNodes.length; i++) {
        const node = updatedNodes[i];
        
        if (node.isWorkflowInstance) {
          continue;
        }

        try {
          let newPercentage: number | undefined = undefined;

          if (node.level === 0) {
            const appData = allApplications.find(app => app.appId === node.appId);
            if (appData) {
              newPercentage = appData.percentageCompleted;
              console.log(`[Refresh] App '${node.name}': ${newPercentage}%`);
            }
          } else {
            const parentNode = updatedNodes[i - 1];
            if (parentNode && !parentNode.isWorkflowInstance) {
              console.log(`[Refresh] Fetching children for parent '${parentNode.name}'`);
              const nodesResponse = await workflowService.getWorkflowNodes({
                date: dateString,
                appId: parentNode.appId!,
                configId: parentNode.configId!,
                currentLevel: parentNode.currentLevel!,
                nextLevel: parentNode.nextLevel!
              });

              if (nodesResponse.success) {
                const nodeData = nodesResponse.data.find(n => n.configId === node.configId);
                if (nodeData) {
                  newPercentage = nodeData.percentageCompleted;
                  console.log(`[Refresh] Node '${node.name}': ${newPercentage}%`);
                }
              } else {
                console.error(`[Refresh] Failed to fetch nodes for parent ${parentNode.name}:`, nodesResponse.error);
              }
            }
          }

          if (newPercentage !== undefined && node.completionPercentage !== newPercentage) {
            updatedNodes[i] = { ...node, completionPercentage: newPercentage };
            changed = true;
          }
        } catch (error) {
          console.error(`[Refresh] Failed to refresh percentage for node ${node.name}:`, error);
        }
      }

      if (changed) {
        console.log('[Refresh] Breadcrumb nodes updated with new percentages.');
        setBreadcrumbNodes(updatedNodes);
      }
      console.log('--- Finished Breadcrumb Refresh ---');
    };

    const intervalId = setInterval(refreshPercentages, 60000);

    const handleManualRefresh = () => {
      toast.info('Refreshing workflow data...');
      refreshPercentages().then(() => {
        toast.success('Workflow data refreshed successfully.');
      }).catch((error) => {
        toast.error('Refresh failed', {
          description: error.message || 'Could not refresh workflow data.',
        });
      });
    };
    
    window.addEventListener('app:refresh', handleManualRefresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('app:refresh', handleManualRefresh);
    };
  }, [breadcrumbState.nodes, selectedDate, setBreadcrumbNodes]);

  return null; // This component does not render anything
};

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      toast.error('An error occurred', {
        description: 'The application encountered an error. Some features may not work correctly.',
      });
    };
    
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      toast.error('An async operation failed', {
        description: 'A background process failed to complete. Please try again.',
      });
    };
    
    const handleReactError = (event: Event) => {
      if (event.type === 'error' && (event as any).error?.message?.includes('React')) {
        console.error('React error caught:', (event as any).error);
      }
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    window.addEventListener('error', handleReactError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      window.removeEventListener('error', handleReactError);
    };
  }, []);

  // Prevent flash while theme loads
  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SidebarProvider>
          <NotificationsProvider>
            <DateProvider>
              <ApiEnvironmentProvider>
                <UserProvider>
                  <BreadcrumbProvider>
                    <GlobalRefreshLogic />
                    <div className="min-h-screen">
                      <Component {...pageProps} />
                      <Toaster />
                    </div>
                  </BreadcrumbProvider>
                </UserProvider>
              </ApiEnvironmentProvider>
            </DateProvider>
          </NotificationsProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}