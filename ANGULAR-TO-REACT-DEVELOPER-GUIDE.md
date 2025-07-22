# Angular to React Developer Guide for STEPS Application

## Table of Contents
1. [Introduction](#introduction)
2. [Angular vs React Concepts](#angular-vs-react-concepts)
3. [Project Structure](#project-structure)
4. [Core Components Guide](#core-components-guide)
5. [State Management](#state-management)
6. [Routing](#routing)
7. [Styling with Tailwind CSS](#styling-with-tailwind-css)
8. [Development Workflow](#development-workflow)
9. [Best Practices](#best-practices)
10. [Common Patterns](#common-patterns)

## Introduction

This guide is designed to help Angular developers understand and work with the STEPS (Financial Workflow Management) React application. We'll cover the key differences between Angular and React, explain the project structure, and provide detailed component examples.

## Angular vs React Concepts

### Key Differences

| Angular Concept | React Equivalent | Description |
|----------------|------------------|-------------|
| Component Class | Function Component | Components are functions that return JSX |
| @Component decorator | export default | Components are exported as default functions |
| ngOnInit | useEffect | Lifecycle hooks are handled with useEffect |
| @Input() | props | Data passed from parent to child |
| @Output() EventEmitter | callback props | Child to parent communication |
| Services | Custom Hooks | Shared logic and state management |
| Dependency Injection | Context API / Props | Sharing data across components |
| *ngFor | .map() | Rendering lists |
| *ngIf | && or ternary | Conditional rendering |
| [(ngModel)] | useState + onChange | Two-way data binding |
| Pipes | Functions | Data transformation |

### Component Structure Comparison

**Angular Component:**
```typescript
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Input() users: User[] = [];
  @Output() userSelected = new EventEmitter<User>();
  
  ngOnInit() {
    // Initialization logic
  }
  
  onUserClick(user: User) {
    this.userSelected.emit(user);
  }
}
```

**React Component:**
```typescript
interface UserListProps {
  users: User[];
  onUserSelected: (user: User) => void;
}

export default function UserList({ users, onUserSelected }: UserListProps) {
  useEffect(() => {
    // Initialization logic
  }, []);
  
  const handleUserClick = (user: User) => {
    onUserSelected(user);
  };
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id} onClick={() => handleUserClick(user)}>
          {user.name}
        </div>
      ))}
    </div>
  );
}
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (buttons, inputs, etc.)
│   ├── admin/           # Admin-specific components
│   ├── workflow/        # Workflow-related components
│   ├── finance/         # Finance dashboard components
│   └── ...
├── pages/               # Next.js pages (routing)
├── hooks/               # Custom React hooks (like Angular services)
├── contexts/            # React Context (like Angular services)
├── types/               # TypeScript type definitions
├── data/                # Mock data and constants
├── lib/                 # Utility functions
└── styles/              # Global styles
```

## Core Components Guide

### 1. Layout Components

#### DashboardLayout.tsx
**Purpose:** Main application layout with sidebar and header
**Angular Equivalent:** App shell component

```typescript
// Key concepts for Angular developers:
// - Uses React Context for sidebar state (like Angular services)
// - Conditional rendering with && operator (like *ngIf)
// - Props drilling vs Context API

interface DashboardLayoutProps {
  children: React.ReactNode; // Like ng-content in Angular
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen } = useSidebar(); // Custom hook (like Angular service)
  
  return (
    <div className="flex h-screen">
      {sidebarOpen && <Sidebar />} {/* Conditional rendering */}
      <main className="flex-1">
        <Header />
        {children} {/* Content projection */}
      </main>
    </div>
  );
}
```

#### Sidebar.tsx
**Purpose:** Navigation sidebar
**Angular Equivalent:** Navigation component with router-outlet

```typescript
// Key concepts:
// - useRouter hook for navigation (like Angular Router)
// - Event handlers with arrow functions
// - State management with useState

export default function Sidebar() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('dashboard');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'workflows', label: 'Workflows', path: '/workflow' },
    // ... more items
  ];
  
  const handleNavigation = (path: string, id: string) => {
    setActiveItem(id);
    router.push(path); // Like Angular router.navigate()
  };
  
  return (
    <nav className="w-64 bg-gray-800">
      {menuItems.map(item => (
        <button
          key={item.id}
          onClick={() => handleNavigation(item.path, item.id)}
          className={`w-full text-left p-4 ${
            activeItem === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
```

### 2. Data Display Components

#### WorkflowInboxDashboard.tsx
**Purpose:** Main workflow inbox with filtering and detail view
**Angular Equivalent:** Master-detail component with data table

```typescript
// Key concepts:
// - Custom hooks for data fetching (like Angular services)
// - State management for selected items
// - Conditional rendering for different views

export default function WorkflowInboxDashboard() {
  const { workflowItems, loading, error } = useWorkflowInbox(); // Custom hook
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  
  // Filter data (like Angular pipe)
  const filteredItems = useMemo(() => {
    return workflowItems.filter(item => {
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [workflowItems, filters]);
  
  if (loading) return <div>Loading...</div>; // Loading state
  if (error) return <div>Error: {error}</div>; // Error state
  
  return (
    <div className="flex h-full">
      {/* Filters */}
      <WorkflowInboxFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />
      
      {/* List View */}
      <div className={selectedItem ? 'w-1/3' : 'w-full'}>
        {filteredItems.map(item => (
          <WorkflowInboxItem
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>
      
      {/* Detail View */}
      {selectedItem && (
        <div className="w-2/3">
          <ModernWorkflowDetailPanel 
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </div>
      )}
    </div>
  );
}
```

#### WorkflowInboxItem.tsx
**Purpose:** Individual workflow item card
**Angular Equivalent:** List item component

```typescript
interface WorkflowInboxItemProps {
  item: WorkflowItem;
  isSelected: boolean;
  onClick: () => void;
}

export default function WorkflowInboxItem({ item, isSelected, onClick }: WorkflowInboxItemProps) {
  // Priority color mapping (like Angular pipe)
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };
  
  return (
    <div 
      className={`p-4 border-l-4 cursor-pointer ${getPriorityColor(item.priority)} ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-gray-600">{item.description}</p>
      <div className="flex justify-between mt-2">
        <span className={`px-2 py-1 rounded text-xs ${
          item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(item.lastUpdated).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
```

### 3. Form Components

#### WorkflowInboxFilters.tsx
**Purpose:** Filter controls for workflow inbox
**Angular Equivalent:** Form component with reactive forms

```typescript
interface FiltersState {
  status: string;
  priority: string;
  search: string;
}

interface WorkflowInboxFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
}

export default function WorkflowInboxFilters({ filters, onFiltersChange }: WorkflowInboxFiltersProps) {
  // Handle input changes (like Angular form controls)
  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };
  
  return (
    <div className="p-4 bg-gray-50 border-b">
      <div className="flex gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search workflows..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md"
        />
        
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        
        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}
```

### 4. Modal/Dialog Components

#### ModernWorkflowDetailPanel.tsx
**Purpose:** Detailed view of workflow item with tabs
**Angular Equivalent:** Modal component with tab navigation

```typescript
interface ModernWorkflowDetailPanelProps {
  item: WorkflowItem;
  onClose: () => void;
}

export default function ModernWorkflowDetailPanel({ item, onClose }: ModernWorkflowDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [files, setFiles] = useState<File[]>([]);
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'files', label: 'Files' },
    { id: 'history', label: 'History' },
    { id: 'controls', label: 'Controls' }
  ];
  
  // File upload handler
  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
  };
  
  return (
    <div className="h-full flex flex-col bg-white border-l">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'overview' && (
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 mb-4">{item.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className="text-sm">{item.priority}</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'files' && (
          <div>
            <h3 className="font-semibold mb-4">Files</h3>
            <FileUpload onFilesUploaded={handleFileUpload} />
            <div className="mt-4">
              {files.map((file, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded mb-2">
                  <span>{file.name}</span>
                  <button className="text-blue-600 hover:text-blue-800">Download</button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Other tab contents... */}
      </div>
    </div>
  );
}
```

## State Management

### 1. React Context (Similar to Angular Services)

#### SidebarContext.tsx
```typescript
// Context creation (like Angular service)
interface SidebarContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component (like Angular service provider)
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  
  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Custom hook to use context (like Angular service injection)
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
```

### 2. Custom Hooks (Similar to Angular Services)

#### useWorkflowInbox.ts
```typescript
// Custom hook for data fetching and state management
export function useWorkflowInbox() {
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data (like Angular service method)
  const fetchWorkflowItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow-items');
      const data = await response.json();
      setWorkflowItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load data on mount (like ngOnInit)
  useEffect(() => {
    fetchWorkflowItems();
  }, [fetchWorkflowItems]);
  
  // Refresh data method
  const refreshData = () => {
    fetchWorkflowItems();
  };
  
  return {
    workflowItems,
    loading,
    error,
    refreshData
  };
}
```

## Routing

### Next.js File-based Routing vs Angular Router

**Angular Routing:**
```typescript
const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'workflow/:id', component: WorkflowDetailComponent },
  { path: 'admin', component: AdminComponent }
];
```

**Next.js File-based Routing:**
```
pages/
├── index.tsx                    # / route
├── workflow/
│   ├── index.tsx               # /workflow route
│   └── [workflowId].tsx        # /workflow/:workflowId route
└── admin/
    └── index.tsx               # /admin route
```

**Dynamic Route Example:**
```typescript
// pages/workflow/[workflowId].tsx
import { useRouter } from 'next/router';

export default function WorkflowDetail() {
  const router = useRouter();
  const { workflowId } = router.query; // Get route parameter
  
  return (
    <div>
      <h1>Workflow {workflowId}</h1>
      <button onClick={() => router.back()}>Go Back</button>
      <button onClick={() => router.push('/workflow')}>All Workflows</button>
    </div>
  );
}
```

## Styling with Tailwind CSS

### Tailwind vs Angular Material/CSS

**Angular CSS:**
```css
.workflow-card {
  padding: 16px;
  margin: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.workflow-card:hover {
  background-color: #f5f5f5;
}

.workflow-card.selected {
  border-color: #2196f3;
  background-color: #e3f2fd;
}
```

**Tailwind CSS:**
```typescript
<div className="p-4 m-2 border border-gray-300 rounded hover:bg-gray-50 selected:border-blue-500 selected:bg-blue-50">
  {/* Content */}
</div>
```

### Common Tailwind Classes

| Purpose | Tailwind Classes | Angular Material Equivalent |
|---------|------------------|----------------------------|
| Padding | `p-4`, `px-2`, `py-1` | `padding: 16px` |
| Margin | `m-4`, `mx-auto`, `my-2` | `margin: 16px` |
| Colors | `bg-blue-500`, `text-red-600` | `color: primary` |
| Flexbox | `flex`, `justify-between`, `items-center` | `fxLayout="row"` |
| Grid | `grid`, `grid-cols-3`, `gap-4` | `fxLayout="row wrap"` |
| Responsive | `sm:w-1/2`, `md:w-1/3`, `lg:w-1/4` | `fxFlex.gt-sm="50"` |

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Install dependencies (like npm install in Angular)
npm install

# Start development server (like ng serve)
npm run dev

# Build for production (like ng build)
npm run build

# Run tests (like ng test)
npm test
```

### 2. Creating New Components

**Step 1:** Create component file
```typescript
// src/components/MyNewComponent.tsx
interface MyNewComponentProps {
  title: string;
  onAction: () => void;
}

export default function MyNewComponent({ title, onAction }: MyNewComponentProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Action
      </button>
    </div>
  );
}
```

**Step 2:** Use in parent component
```typescript
import MyNewComponent from '@/components/MyNewComponent';

export default function ParentComponent() {
  const handleAction = () => {
    console.log('Action clicked');
  };
  
  return (
    <div>
      <MyNewComponent title="Hello World" onAction={handleAction} />
    </div>
  );
}
```

### 3. Adding New Pages

**Step 1:** Create page file
```typescript
// src/pages/my-new-page.tsx
import DashboardLayout from '@/components/DashboardLayout';

export default function MyNewPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">My New Page</h1>
        <p>This is a new page in the application.</p>
      </div>
    </DashboardLayout>
  );
}
```

**Step 2:** Add navigation link
```typescript
// Update Sidebar.tsx
const menuItems = [
  // ... existing items
  { id: 'my-new-page', label: 'My New Page', path: '/my-new-page' },
];
```

## Best Practices

### 1. Component Organization

```typescript
// Good: Separate interface and component
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  // Component logic here
}
```

### 2. State Management

```typescript
// Good: Use appropriate state management
const [localState, setLocalState] = useState(initialValue); // For component-specific state
const { globalState } = useContext(GlobalContext); // For shared state
const { data, loading } = useCustomHook(); // For data fetching
```

### 3. Event Handling

```typescript
// Good: Use useCallback for expensive operations
const handleSubmit = useCallback((data: FormData) => {
  // Handle form submission
}, [dependency]);

// Good: Prevent unnecessary re-renders
const memoizedComponent = useMemo(() => (
  <ExpensiveComponent data={data} />
), [data]);
```

### 4. Error Handling

```typescript
// Good: Handle errors gracefully
export default function DataComponent() {
  const { data, loading, error } = useData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  return <DataDisplay data={data} />;
}
```

## Common Patterns

### 1. List with Selection

```typescript
export default function SelectableList() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          onClick={() => setSelectedId(item.id)}
          className={selectedId === item.id ? 'selected' : ''}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### 2. Form with Validation

```typescript
export default function UserForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className={errors.name ? 'border-red-500' : ''}
      />
      {errors.name && <span className="text-red-500">{errors.name}</span>}
    </form>
  );
}
```

### 3. Data Fetching with Loading States

```typescript
export default function DataList() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Getting Started Checklist

### For Angular Developers

1. **Setup Development Environment**
   - [ ] Install Node.js 20.x
   - [ ] Clone the repository
   - [ ] Run `npm install`
   - [ ] Run `npm run dev`

2. **Understand Key Concepts**
   - [ ] Read through Angular vs React concepts
   - [ ] Understand JSX syntax
   - [ ] Learn about React hooks (useState, useEffect, useContext)
   - [ ] Understand props vs state

3. **Explore the Codebase**
   - [ ] Start with simple components in `src/components/ui/`
   - [ ] Look at layout components (`DashboardLayout`, `Sidebar`)
   - [ ] Examine data components (`WorkflowInboxDashboard`)
   - [ ] Study custom hooks in `src/hooks/`

4. **Practice Tasks**
   - [ ] Modify an existing component's styling
   - [ ] Add a new field to a form component
   - [ ] Create a simple new component
   - [ ] Add a new page to the application

5. **Advanced Topics**
   - [ ] Learn about React Context for state management
   - [ ] Understand Next.js routing
   - [ ] Practice with Tailwind CSS
   - [ ] Learn about performance optimization (useMemo, useCallback)

## Resources for Further Learning

1. **React Documentation:** https://react.dev/
2. **Next.js Documentation:** https://nextjs.org/docs
3. **Tailwind CSS Documentation:** https://tailwindcss.com/docs
4. **TypeScript with React:** https://react.dev/learn/typescript
5. **React Hooks Guide:** https://react.dev/reference/react

## Support and Questions

For questions about the STEPS application specifically:
1. Check the existing documentation in the repository
2. Look at similar components for patterns
3. Ask team members for guidance on specific business logic
4. Use the browser developer tools for debugging

Remember: React is more functional and declarative compared to Angular's class-based approach. Focus on understanding data flow (props down, events up) and the component lifecycle with hooks.