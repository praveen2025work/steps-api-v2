import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { DateProvider } from '@/contexts/DateContext';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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