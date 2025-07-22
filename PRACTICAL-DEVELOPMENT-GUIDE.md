# STEPS Application - Practical Development Guide for Angular Developers

## Table of Contents
1. [Quick Start Guide](#quick-start-guide)
2. [Daily Development Workflow](#daily-development-workflow)
3. [Common Development Tasks](#common-development-tasks)
4. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
5. [Code Examples and Patterns](#code-examples-and-patterns)
6. [API Integration](#api-integration)
7. [Testing Strategies](#testing-strategies)
8. [Deployment and Build Process](#deployment-and-build-process)

## Quick Start Guide

### 1. Environment Setup

```bash
# Prerequisites
# - Node.js 20.x
# - Git
# - VS Code (recommended)

# Clone and setup
git clone <repository-url>
cd steps-application
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### 2. VS Code Extensions (Recommended)

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### 3. Project Structure Overview

```
src/
├── components/          # Reusable components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── admin/          # Admin-specific components
│   ├── workflow/       # Workflow components
│   ├── finance/        # Finance components
│   └── ...
├── pages/              # Next.js pages (routes)
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── types/              # TypeScript type definitions
├── data/               # Mock data and constants
├── lib/                # Utility functions
└── styles/             # Global styles
```

## Daily Development Workflow

### 1. Starting Development

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Start development server
npm run dev

# In another terminal, run type checking (optional)
npm run type-check
```

### 2. Creating a New Feature

#### Step 1: Create Component File
```typescript
// src/components/MyNewFeature.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MyNewFeatureProps {
  title: string;
  data?: any[];
  onAction?: (item: any) => void;
}

export default function MyNewFeature({ 
  title, 
  data = [], 
  onAction 
}: MyNewFeatureProps) {
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Handle item selection
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    onAction?.(item);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleItemClick(item)}
                className="p-2 border rounded cursor-pointer hover:bg-gray-50"
              >
                {item.name || item.title}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Step 2: Create Page (if needed)
```typescript
// src/pages/my-new-feature.tsx
import DashboardLayout from '@/components/DashboardLayout';
import MyNewFeature from '@/components/MyNewFeature';

export default function MyNewFeaturePage() {
  const handleAction = (item: any) => {
    console.log('Action triggered for:', item);
  };
  
  return (
    <DashboardLayout title="My New Feature">
      <div className="space-y-6">
        <MyNewFeature
          title="Feature Title"
          data={[
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ]}
          onAction={handleAction}
        />
      </div>
    </DashboardLayout>
  );
}
```

#### Step 3: Add Navigation (if needed)
```typescript
// Update src/components/Sidebar.tsx
const menuItems = [
  // ... existing items
  {
    id: 'my-new-feature',
    label: 'My New Feature',
    path: '/my-new-feature',
    icon: NewFeatureIcon
  }
];
```

### 3. Testing Your Changes

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build to check for errors
npm run build

# Run tests (if available)
npm test
```

## Common Development Tasks

### 1. Adding a New Form Component

```typescript
// src/components/UserForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserFormProps {
  initialData?: {
    name: string;
    email: string;
    role: string;
  };
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export default function UserForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'user'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit User' : 'Add User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          
          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          
          {/* Role Field */}
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          
          {/* Form Actions */}
          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 2. Creating a Data Table Component

```typescript
// src/components/UsersTable.tsx
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onAdd: () => void;
}

export default function UsersTable({ 
  users, 
  onEdit, 
  onDelete, 
  onAdd 
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [users, searchTerm, sortField, sortDirection]);
  
  // Handle sorting
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={onAdd}>Add User</Button>
      </div>
      
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Last Login</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Creating a Custom Hook

```typescript
// src/hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with actual API call
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Add user
  const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Failed to add user');
      
      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add user');
    }
  }, []);
  
  // Update user
  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update user');
    }
  }, []);
  
  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  }, []);
  
  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers
  };
}
```

### 4. Using the Hook in a Component

```typescript
// src/pages/users/index.tsx
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UsersTable from '@/components/UsersTable';
import UserForm from '@/components/UserForm';
import { useUsers } from '@/hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function UsersPage() {
  const { users, loading, error, addUser, updateUser, deleteUser } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const handleAdd = () => {
    setEditingUser(null);
    setShowForm(true);
  };
  
  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };
  
  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };
  
  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await addUser(formData);
      }
      setShowForm(false);
    } catch (err) {
      alert('Failed to save user');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        <UsersTable
          users={users}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add User'}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              initialData={editingUser}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
```

## Debugging and Troubleshooting

### 1. Common Issues and Solutions

#### Issue: Component Not Rendering
```typescript
// Problem: Component returns undefined
export default function MyComponent() {
  // Missing return statement
}

// Solution: Always return JSX
export default function MyComponent() {
  return (
    <div>Component content</div>
  );
}
```

#### Issue: State Not Updating
```typescript
// Problem: Mutating state directly
const [items, setItems] = useState([]);

const addItem = (newItem) => {
  items.push(newItem); // Wrong!
  setItems(items);
};

// Solution: Create new array
const addItem = (newItem) => {
  setItems(prev => [...prev, newItem]); // Correct!
};
```

#### Issue: Infinite Re-renders
```typescript
// Problem: Missing dependency array
useEffect(() => {
  fetchData();
}); // This runs on every render!

// Solution: Add dependency array
useEffect(() => {
  fetchData();
}, []); // Runs only once

// Or with dependencies
useEffect(() => {
  fetchData();
}, [userId]); // Runs when userId changes
```

### 2. Debugging Tools

#### React Developer Tools
```bash
# Install React DevTools browser extension
# Available for Chrome, Firefox, Edge
```

#### Console Debugging
```typescript
export default function MyComponent({ data }) {
  // Debug props
  console.log('Component props:', { data });
  
  const [state, setState] = useState(null);
  
  // Debug state changes
  useEffect(() => {
    console.log('State changed:', state);
  }, [state]);
  
  return (
    <div>
      {/* Debug render */}
      {console.log('Rendering component')}
      Component content
    </div>
  );
}
```

#### Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## Code Examples and Patterns

### 1. Loading States Pattern

```typescript
// src/components/LoadingWrapper.tsx
interface LoadingWrapperProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  onRetry?: () => void;
}

export default function LoadingWrapper({ 
  loading, 
  error, 
  children, 
  onRetry 
}: LoadingWrapperProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-600 mb-2">Error: {error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
}

// Usage
<LoadingWrapper loading={loading} error={error} onRetry={refetch}>
  <MyDataComponent data={data} />
</LoadingWrapper>
```

### 2. Modal Pattern

```typescript
// src/components/Modal.tsx
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Usage
const [showModal, setShowModal] = useState(false);

<Modal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex space-x-2 mt-4">
    <button onClick={() => setShowModal(false)}>Cancel</button>
    <button onClick={handleConfirm}>Confirm</button>
  </div>
</Modal>
```

### 3. Search and Filter Pattern

```typescript
// src/hooks/useSearch.ts
import { useState, useMemo } from 'react';

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  initialFilters: Record<string, any> = {}
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchTerm) {
        const matchesSearch = searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (!matchesSearch) return false;
      }
      
      // Other filters
      for (const [key, value] of Object.entries(filters)) {
        if (value && value !== 'all' && item[key as keyof T] !== value) {
          return false;
        }
      }
      
      return true;
    });
  }, [items, searchTerm, filters, searchFields]);
  
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };
  
  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    filteredItems
  };
}

// Usage in component
const { 
  searchTerm, 
  setSearchTerm, 
  filters, 
  updateFilter, 
  filteredItems 
} = useSearch(users, ['name', 'email'], { role: 'all', status: 'all' });
```

## API Integration

### 1. API Client Setup

```typescript
// src/lib/api-client.ts
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
);
```

### 2. API Hook Pattern

```typescript
// src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export function useApi<T>(endpoint: string, options: { 
  immediate?: boolean;
  dependencies?: any[];
} = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { immediate = true, dependencies = [] } = options;
  
  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);
  
  return { data, loading, error, refetch: execute };
}

// Usage
const { data: users, loading, error, refetch } = useApi<User[]>('/users');
```

## Testing Strategies

### 1. Component Testing

```typescript
// src/components/__tests__/UserForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from '../UserForm';

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders form fields correctly', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });
  
  it('shows validation errors for empty fields', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByText(/save/i));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('submits form with valid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.click(screen.getByText(/save/i));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      });
    });
  });
});
```

### 2. Hook Testing

```typescript
// src/hooks/__tests__/useUsers.test.ts
import { renderHook, act } from '@testing-library/react';
import { useUsers } from '../useUsers';

// Mock fetch
global.fetch = jest.fn();

describe('useUsers', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });
  
  it('fetches users on mount', async () => {
    const mockUsers = [
      { id: '1', name: 'John', email: 'john@example.com' }
    ];
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });
    
    const { result } = renderHook(() => useUsers());
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual(mockUsers);
  });
});
```

## Deployment and Build Process

### 1. Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### 2. Environment Variables

```bash
# .env.local (for local development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_FORCE_REAL_API=false

# .env.production (for production)
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
NEXT_PUBLIC_FORCE_REAL_API=true
```

### 3. Build Optimization

```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Optimize images
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer (optional)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

This practical guide provides Angular developers with hands-on examples and workflows for developing with the STEPS React application. Each section includes real code examples that can be copied and adapted for specific needs.