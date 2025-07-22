import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface SafeRouterProps {
  children: (router: {
    pathname: string;
    asPath: string;
    isReady: boolean;
    push: (url: string) => void;
  }) => React.ReactNode;
}

/**
 * SafeRouter component that provides a safe wrapper around Next.js router
 * to prevent "Router was not mounted" errors
 */
export const SafeRouter: React.FC<SafeRouterProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [safeRouter, setSafeRouter] = useState({
    pathname: '/',
    asPath: '/',
    isReady: false,
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only use the actual router after component is mounted
  const router = isMounted ? useRouter() : null;

  useEffect(() => {
    if (router && isMounted) {
      try {
        setSafeRouter({
          pathname: router.pathname || '/',
          asPath: router.asPath || '/',
          isReady: router.isReady || false,
          push: router.push || ((url: string) => {
            if (typeof window !== 'undefined') {
              window.location.href = url;
            }
          })
        });
      } catch (error) {
        console.warn('Router not ready, using fallback values:', error);
        // Keep the default safe values
      }
    }
  }, [router, isMounted, router?.pathname, router?.asPath, router?.isReady]);

  if (!isMounted) {
    // Return loading state or null during SSR
    return null;
  }

  return <>{children(safeRouter)}</>;
};

export default SafeRouter;