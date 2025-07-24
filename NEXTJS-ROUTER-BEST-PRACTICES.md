# Next.js Router Best Practices Guide

## Understanding the "NextRouter was not mounted" Error

### Root Cause
The "NextRouter was not mounted" error occurs when the `useRouter()` hook is called in a context where the Next.js router provider is not available or not fully initialized. This commonly happens in these scenarios:

1. **Server-Side Rendering (SSR)**: During initial server rendering, the router context may not be fully available
2. **Component Hydration**: During the hydration phase when React is taking over from server-rendered HTML
3. **Testing Environments**: When components are rendered outside of the Next.js app context
4. **Invalid Component Nesting**: When components using `useRouter()` are rendered outside the proper Next.js page structure

### Why This Happens
Next.js uses React Context to provide router functionality. The `useRouter()` hook depends on this context being available. If a component tries to use `useRouter()` before the context is properly initialized or outside of its provider, the error occurs.

## Correct Usage Patterns

### ✅ Pattern 1: Check Router Readiness (Recommended for Pages)

```tsx
import { useRouter } from 'next/router';

const MyPage = () => {
  const router = useRouter();
  
  // Always check if router is ready before accessing query parameters
  if (!router.isReady) {
    return <div>Loading...</div>;
  }
  
  const { id, tab } = router.query;
  
  return (
    <div>
      <h1>Page ID: {id}</h1>
      <p>Active Tab: {tab}</p>
    </div>
  );
};
```

### ✅ Pattern 2: Use SafeRouter Component (Recommended for Components)

```tsx
import { SafeRouter } from '@/components/SafeRouter';

const MyComponent = () => {
  return (
    <SafeRouter>
      {(router) => (
        <div>
          <p>Current path: {router.pathname}</p>
          <button onClick={() => router.push('/other-page')}>
            Navigate
          </button>
        </div>
      )}
    </SafeRouter>
  );
};
```

### ✅ Pattern 3: Conditional Router Usage

```tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const MyComponent = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't access router until component is mounted
  if (!mounted || !router.isReady) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <p>Current route: {router.asPath}</p>
    </div>
  );
};
```

## ❌ Common Mistakes to Avoid

### Mistake 1: Immediate Query Access
```tsx
// ❌ DON'T DO THIS
const BadComponent = () => {
  const router = useRouter();
  const { id } = router.query; // Error: router might not be ready
  
  return <div>ID: {id}</div>;
};
```

### Mistake 2: Using Router in Non-Page Components Without Safety Checks
```tsx
// ❌ DON'T DO THIS
const BadComponent = () => {
  const router = useRouter(); // Error: might be called outside router context
  
  return (
    <button onClick={() => router.push('/somewhere')}>
      Navigate
    </button>
  );
};
```

### Mistake 3: Conditional Hook Calls
```tsx
// ❌ DON'T DO THIS - Violates Rules of Hooks
const BadComponent = ({ shouldUseRouter }) => {
  if (shouldUseRouter) {
    const router = useRouter(); // Error: conditional hook call
  }
  
  return <div>Content</div>;
};
```

## Best Practices Summary

### For Page Components (`src/pages/*`)
1. **Always check `router.isReady`** before accessing `router.query`
2. **Provide loading states** while the router initializes
3. **Use early returns** to handle the loading state cleanly

### For Regular Components (`src/components/*`)
1. **Use the SafeRouter component** when you need router functionality
2. **Check if component is mounted** before using router
3. **Consider if the component really needs router access** - sometimes props are better

### For Custom Hooks
1. **Include router readiness checks** in your custom hooks
2. **Return loading states** from hooks that depend on router
3. **Handle edge cases** where router might not be available

## Migration Guide

### If you encounter "NextRouter was not mounted" errors:

1. **Identify the problematic component** from the error stack trace
2. **Check if it's a page or component**:
   - **Page**: Add `router.isReady` check
   - **Component**: Wrap with `SafeRouter` or add mounting checks
3. **Test the fix** by navigating to the problematic route
4. **Add loading states** for better user experience

### Example Migration:

**Before (Problematic):**
```tsx
const AdminPage = () => {
  const router = useRouter();
  const { tab } = router.query; // ❌ Potential error here
  
  return <div>Tab: {tab}</div>;
};
```

**After (Fixed):**
```tsx
const AdminPage = () => {
  const router = useRouter();
  
  if (!router.isReady) {
    return <div>Loading...</div>; // ✅ Safe loading state
  }
  
  const { tab } = router.query; // ✅ Safe to access now
  
  return <div>Tab: {tab}</div>;
};
```

## Testing Considerations

When writing tests for components that use `useRouter()`:

1. **Mock the router** in your test setup
2. **Provide router context** in test renders
3. **Test both loading and ready states**

```tsx
// Example test setup
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  isReady: true,
  query: { tab: 'applications' },
  push: jest.fn(),
  pathname: '/admin',
  asPath: '/admin?tab=applications',
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);
```

## Key Takeaways

1. **Router readiness is crucial** - always check `router.isReady` before accessing query parameters
2. **Use SafeRouter for components** - it handles edge cases automatically
3. **Provide loading states** - improves user experience during router initialization
4. **Follow the Rules of Hooks** - never call hooks conditionally
5. **Test your routes** - ensure they work on fresh page loads and navigation

By following these patterns, you'll avoid "NextRouter was not mounted" errors and create more robust Next.js applications.