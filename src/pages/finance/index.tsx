import { useEffect } from 'react';
import { useRouter } from 'next/router';

const FinancePage = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the static version of the finance dashboard
    router.replace('/finance/static');
  }, [router]);
  
  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-muted-foreground">Loading Finance Dashboard...</p>
    </div>
  );
};

export default FinancePage;