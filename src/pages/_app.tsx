import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set light mode as default based on theme update
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    setMounted(true);
  }, []);

  // Prevent flash while theme loads
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Component {...pageProps} />
      <Toaster />
    </div>
  )
}