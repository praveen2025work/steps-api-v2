# React Workflow Application Memory Optimization Guide

## Overview

This guide addresses the memory crashes and undefined property errors in your React workflow application. The optimizations focus on preventing memory leaks, reducing bundle size, implementing defensive coding practices, and ensuring only the active view is rendered.

## Key Issues Identified

### 1. Memory Issues
- **All view types rendered simultaneously**: Classic, Modern, and Step Function views were all being instantiated even when not visible
- **Heavy DOM manipulation**: Complex nested components with large data structures
- **Infinite re-renders**: useEffect dependencies causing unnecessary re-calculations
- **Memory accumulation**: Auto-refresh functionality not properly cleaning up
- **Large bundle size**: All components loaded upfront without lazy loading

### 2. Undefined Property Errors
- **Unsafe property access**: Direct property access without null/undefined checks
- **Missing .toString() safety**: Calling .toString() on potentially undefined values
- **Complex object destructuring**: Without proper defaults
- **API response variations**: Different data structures not handled gracefully

## Solutions Implemented

### 1. Component Lazy Loading

```typescript
// Lazy load heavy components to reduce initial bundle size
const ModernWorkflowView = lazy(() => import('./workflow/ModernWorkflowView'));
const StepFunctionView = lazy(() => import('./workflow/StepFunctionView'));

// Loading fallback component
const ViewLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center gap-2">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span>Loading view...</span>
    </div>
  </div>
);
```

### 2. Conditional Rendering - Only Active View

```typescript
// ONLY render the active view - never render all views simultaneously
if (viewMode === 'modern') {
  return (
    <Suspense fallback={<ViewLoadingFallback />}>
      <ModernWorkflowView
        workflow={memoizedWorkflowData}
        onBack={onBack}
        onViewToggle={() => handleViewToggle('classic')}
      />
    </Suspense>
  );
}

if (viewMode === 'step-function') {
  return (
    <Suspense fallback={<ViewLoadingFallback />}>
      <StepFunctionView
        workflow={memoizedWorkflowData}
        onBack={onBack || (() => handleViewToggle('classic'))}
      />
    </Suspense>
  );
}

// Default Classic view only when viewMode === 'classic'
return <ClassicViewContent />;
```

### 3. Safe Property Access Utilities

```typescript
// Safe property access utility
const safeGet = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  } catch {
    return defaultValue;
  }
};

// Safe toString utility
const safeToString = (value: any, defaultValue: string = ''): string => {
  try {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value.toString === 'function') return value.toString();
    return String(value);
  } catch {
    return defaultValue;
  }
};
```

### 4. Memoized Calculations

```typescript
// Memoized calculations to prevent unnecessary re-renders
const memoizedTaskCounts = useMemo(() => {
  try {
    let completed = 0;
    let failed = 0;
    let rejected = 0;
    let pending = 0;
    let processing = 0;
    
    // Safe data processing with fallbacks
    const processData = safeGet(summaryData, 'processData', []);
    if (Array.isArray(processData) && processData.length > 0) {
      processData.forEach((process: any) => {
        const status = safeToString(safeGet(process, 'status', ''), '').toLowerCase();
        if (status === 'completed') completed++;
        else if (status === 'failed') failed++;
        else if (status === 'rejected') rejected++;
        else if (status === 'in_progress' || status === 'in-progress' || status === 'running') processing++;
        else pending++;
      });
      
      return { completed, failed, rejected, pending, processing };
    }
    
    // Fallback calculations...
    return { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 };
  } catch (error) {
    console.warn('Error calculating task counts:', error);
    return { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 };
  }
}, [summaryData, stageSpecificSubStages, tasks]);
```

### 5. Error Boundaries and Defensive Rendering

```typescript
// Safe rendering with error handling
{activeStageTasks.length === 0 ? (
  <div className="text-center py-8 text-muted-foreground">
    <div className="text-sm">No tasks found for this stage</div>
    <div className="text-xs mt-1">
      Active Stage: {activeStage} | Tasks Available: {activeStageTasks.length}
    </div>
  </div>
) : (
  activeStageTasks.map((task, index) => {
    try {
      const taskId = safeGet(task, 'id', `task-${index}`);
      const taskName = safeToString(safeGet(task, 'name', ''), 'Unknown Task');
      const taskStatus = safeGet(task, 'status', 'not-started');
      
      return (
        <TaskComponent key={taskId} task={task} />
      );
    } catch (error) {
      console.warn('Error rendering task:', error);
      return (
        <div key={`error-${index}`} className="p-2 border border-red-200 rounded text-red-600 text-sm">
          Error rendering task {index + 1}
        </div>
      );
    }
  })
)}
```

### 6. Memory-Optimized Auto-Refresh

```typescript
// Enhanced refresh with proper cleanup
const handleRefresh = useCallback(async (isManualRefresh: boolean = false) => {
  if (isRefreshing) return; // Prevent multiple simultaneous refreshes
  
  setIsRefreshing(true);
  preserveUIState();
  
  try {
    // Safe data access and API calls
    const currentSummaryData = (window as any)?.currentWorkflowSummary;
    const applications = safeGet(currentSummaryData, 'applications', []);
    
    if (Array.isArray(applications) && applications.length > 0) {
      // Process refresh logic with error handling
    }
  } catch (error: any) {
    const errorMessage = safeToString(safeGet(error, 'message', ''), 'Unknown error occurred');
    showErrorToast(`Refresh failed: ${errorMessage}`);
  } finally {
    setIsRefreshing(false);
  }
}, [isRefreshing, preserveUIState, restoreUIState, selectedDate, refreshInterval]);

// Auto-refresh setup with proper cleanup
useEffect(() => {
  try {
    if (autoRefreshEnabled && isUserActive) {
      autoRefreshTimerRef.current = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
    } else {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  } catch (error) {
    console.warn('Error setting up auto-refresh:', error);
  }
}, [autoRefreshEnabled, refreshInterval, handleRefresh, isUserActive]);
```

## Implementation Steps

### Step 1: Replace Existing Components

1. **Replace WorkflowDetailView.tsx** with `WorkflowDetailViewOptimized.tsx`
2. **Replace ModernWorkflowView.tsx** with `ModernWorkflowViewOptimized.tsx`
3. **Replace StepFunctionView.tsx** with `StepFunctionViewOptimized.tsx`

### Step 2: Update Imports

```typescript
// Update imports in parent components
import WorkflowDetailView from '@/components/WorkflowDetailViewOptimized';
import ModernWorkflowView from '@/components/workflow/ModernWorkflowViewOptimized';
import StepFunctionView from '@/components/workflow/StepFunctionViewOptimized';
```

### Step 3: Webpack/Next.js Optimizations

Add to `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable webpack bundle analyzer in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          workflow: {
            test: /[\\/]src[\\/]components[\\/]workflow[\\/]/,
            name: 'workflow',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // Optimize images and static assets
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize build output
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
```

### Step 4: Add Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"
```

## Performance Monitoring

### 1. Memory Usage Monitoring

```typescript
// Add to your main component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const logMemoryUsage = () => {
      if (performance.memory) {
        console.log('Memory Usage:', {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };
    
    const interval = setInterval(logMemoryUsage, 30000); // Log every 30 seconds
    return () => clearInterval(interval);
  }
}, []);
```

### 2. Component Performance Monitoring

```typescript
// Add React DevTools Profiler in development
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Component Performance:', {
      id,
      phase,
      actualDuration,
      baseDuration
    });
  }
};

// Wrap components in Profiler during development
{process.env.NODE_ENV === 'development' ? (
  <Profiler id="WorkflowDetailView" onRender={onRenderCallback}>
    <WorkflowDetailView {...props} />
  </Profiler>
) : (
  <WorkflowDetailView {...props} />
)}
```

## Best Practices Going Forward

### 1. Always Use Safe Property Access

```typescript
// ❌ Unsafe
const name = user.profile.name.toString();

// ✅ Safe
const name = safeToString(safeGet(user, 'profile.name', ''), 'Unknown User');
```

### 2. Memoize Expensive Calculations

```typescript
// ❌ Recalculates on every render
const expensiveValue = calculateExpensiveValue(data);

// ✅ Memoized
const expensiveValue = useMemo(() => calculateExpensiveValue(data), [data]);
```

### 3. Use Lazy Loading for Heavy Components

```typescript
// ❌ All components loaded upfront
import HeavyComponent from './HeavyComponent';

// ✅ Lazy loaded
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 4. Implement Proper Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}
```

### 5. Clean Up Resources

```typescript
useEffect(() => {
  const subscription = subscribeToData();
  const timer = setInterval(updateData, 1000);
  
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);
```

## Testing Memory Optimizations

### 1. Chrome DevTools Memory Tab
- Take heap snapshots before and after navigation
- Look for detached DOM nodes
- Monitor memory usage over time

### 2. Performance Tab
- Record performance during navigation
- Look for long tasks and memory spikes
- Identify components causing re-renders

### 3. React DevTools Profiler
- Profile component render times
- Identify unnecessary re-renders
- Optimize component hierarchies

## Deployment Considerations

### 1. Buil Optimizations
```bash
# Build with optimizations
npm run build

# Analyze bundle size
npm run analyze

# Test production build locally
npm run start
```

### 2. Server Configuration
- Enable gzip compression
- Set proper cache headers
- Use CDN for static assets
- Monitor server memory usage

This comprehensive optimization should resolve the memory crashes and undefined property errors while significantly improving the application's performance and stability.