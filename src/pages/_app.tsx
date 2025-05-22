import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { DateProvider } from '@/contexts/DateContext';

// Custom error handler to catch and log unhandled errors
const errorHandler = (error: Error, info: { componentStack: string }) => {
  console.error('Application Error:', error);
  console.error('Component Stack:', info.componentStack);
};

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Add global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });
    
    return () => {
      window.removeEventListener('error', () => {});
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, []);

  // Prevent flash while theme loads
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <NotificationsProvider>
          <DateProvider>
            <div className="min-h-screen">
              <Component {...pageProps} />
              <Toaster />
            </div>
          </DateProvider>
        </NotificationsProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}