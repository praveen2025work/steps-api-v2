import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
      <div className="min-h-screen">
        <Component {...pageProps} />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}