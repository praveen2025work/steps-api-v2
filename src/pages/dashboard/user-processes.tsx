import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';

const UserProcessesPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/workflow-inbox');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push('/workflow-inbox');
  };

  return (
    <>
      <Head>
        <title>User Process Dashboard - Deprecated - Financial Workflow Management</title>
        <meta name="description" content="This page has been deprecated and merged with the Task Center" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title="User Process Dashboard - Deprecated">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              </div>
              <CardTitle className="text-2xl">Page Deprecated</CardTitle>
              <CardDescription className="text-lg">
                This User Process Dashboard has been consolidated and enhanced
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The User Process Dashboard functionality has been merged with the Task Center 
                  to provide a unified, enhanced workflow management experience.
                </p>
                
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm">New Unified Features Include:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Combined tabbed interface (User Trigger/Approval, Completed, Not Started)</li>
                    <li>• Advanced filtering by application, status, priority, assignee, and more</li>
                    <li>• Toggle between Card and Table views</li>
                    <li>• Bulk selection and actions</li>
                    <li>• Inline approval/attestation with comments</li>
                    <li>• Enhanced detail panel with Overview, Files, Comments, and Audit History</li>
                    <li>• Modern, responsive UI with better performance</li>
                  </ul>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  You will be automatically redirected to the Task Center in a few seconds.
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={handleRedirect} className="flex items-center gap-2">
                  Go to Task Center Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default UserProcessesPage;