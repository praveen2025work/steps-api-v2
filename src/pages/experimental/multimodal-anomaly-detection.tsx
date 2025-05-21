import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { MultimodalAnomalyDetection } from '@/components/experimental/MultimodalAnomalyDetection';

const MultimodalAnomalyDetectionPage = () => {
  return (
    <DashboardLayout title="Multimodal Anomaly Detection">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Multimodal Anomaly Detection</h1>
        <p className="text-muted-foreground mb-6">
          Detect unusual patterns and anomalies across multiple data sources using advanced AI to identify potential issues before they impact your workflows.
        </p>
        
        <div className="space-y-8">
          <MultimodalAnomalyDetection />
          
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2">About This Feature</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The Multimodal Anomaly Detection system uses neural networks and advanced statistical models to analyze patterns across various data sources simultaneously. It can:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Monitor transaction patterns, system metrics, and user behaviors in real-time</li>
              <li>Detect unusual patterns that might indicate errors, fraud, or system issues</li>
              <li>Analyze historical data to identify past anomalies that may have been missed</li>
              <li>Predict potential future anomalies based on emerging patterns</li>
              <li>Provide actionable recommendations for investigating and resolving detected anomalies</li>
              <li>Learn from user feedback to continuously improve detection accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MultimodalAnomalyDetectionPage;