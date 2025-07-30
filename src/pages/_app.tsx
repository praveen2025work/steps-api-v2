import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useState, ErrorInfo } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { DateProvider } from '@/contexts/DateContext';
import { ApiEnvironmentProvider } from '@/contexts/ApiEnvironmentContext';
import { BreadcrumbProvider } from '@/contexts/BreadcrumbContext';
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

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Add global error handler with proper cleanup
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // Show a toast notification for the error
      toast.error('An error occurred', {
        description: 'The application encountered an error. Some features may not work correctly.',
      });
    };
    
    // Add unhandled promise rejection handler with proper cleanup
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      // Show a toast notification for the rejection
      toast.error('An async operation failed', {
        description: 'A background process failed to complete. Please try again.',
      });
    };
    
    // Add React error handler
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
                <BreadcrumbProvider>
                  <div className="min-h-screen">
                    <Component {...pageProps} />
                    <Toaster />
                  </div>
                </BreadcrumbProvider>
              </ApiEnvironmentProvider>
            </DateProvider>
          </NotificationsProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}