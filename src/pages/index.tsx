import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Task Center (workflow inbox) as the landing page
    router.replace('/workflow-inbox');
  }, [router]);

  return (
    <>
      <Head>
        <title>STEPS - Task Center</title>
        <meta name="description" content="Financial Workflow Management System - Task Center" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to Task Center...</p>
        </div>
      </div>
    </>
  );
}