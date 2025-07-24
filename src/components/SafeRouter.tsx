import { useEffect, useState } from 'react';

interface SafeRouterProps {
  children: (router: {
    pathname: string;
    asPath: string;
    isReady: boolean;
    push: (url: string) => void;
  }) => React.ReactNode;
}

// Custom hook to safely use Next.js router
const useSafeRouter = () => {
  const [router, setRouter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initRouter = async () => {
      try {
        // Only try to use router in browser environment
        if (typeof window === 'undefined') {
          return;
        }

        // Check if Next.js is available
        if (!window.__NEXT_DATA__) {
          setError('Not in Next.js environment');
          return;
        }

        // Dynamically import useRouter to avoid SSR issues
        const { useRouter } = await import('next/router');
        
        // We can't call useRouter here because we're not in a component render
        // Instead, we'll try to access the router instance from Next.js internals
        const nextRouter = (window as any).__NEXT_ROUTER__;
        if (nextRouter) {
          setRouter(nextRouter);
        } else {
          setError('Router not mounted');
        }
      } catch (err) {
        setError(`Router initialization failed: ${err}`);
      }
    };

    initRouter();
  }, []);

  return { router, error };
};

/**
 * SafeRouter component that provides a safe wrapper around Next.js router
 * to prevent "Router was not mounted" errors
 */
export const SafeRouter: React.FC<SafeRouterProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { router, error } = useSafeRouter();

  const fallbackRouter = {
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    asPath: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
    isReady: false,
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render during SSR
  if (!isMounted) {
    return null;
  }

  // If we have an error or no router, use fallback
  if (error || !router) {
    if (error) {
      console.warn('SafeRouter using fallback due to error:', error);
    }
    return <>{children(fallbackRouter)}</>;
  }

  // Use the actual router if available
  const safeRouter = {
    pathname: router.pathname || fallbackRouter.pathname,
    asPath: router.asPath || fallbackRouter.asPath,
    isReady: router.isReady || false,
    push: router.push || fallbackRouter.push
  };

  return <>{children(safeRouter)}</>;
};

export default SafeRouter;