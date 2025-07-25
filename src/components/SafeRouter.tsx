import React from 'react';
import { useRouter, NextRouter } from 'next/router';

interface SafeRouterProps {
  children: (router: NextRouter) => React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * SafeRouter component that provides a safe wrapper around the Next.js router.
 * It ensures that the router object is ready before rendering its children,
 * preventing "NextRouter was not mounted" errors.
 *
 * @param children A function that receives the router object and returns React nodes.
 * @param loading An optional fallback component to display while the router is not ready.
 */
export const SafeRouter: React.FC<SafeRouterProps> = ({ children, loading = null }) => {
  const router = useRouter();

  // If the router is not ready, render the loading fallback or nothing.
  // This is the key to preventing errors from accessing router.query too early.
  if (!router.isReady) {
    return <>{loading}</>;
  }

  // Once the router is ready, render the children with the router object.
  return <>{children(router)}</>;
};

export default SafeRouter;