# STEPS Application Component Architecture Guide

## Table of Contents
1. [Component Hierarchy Overview](#component-hierarchy-overview)
2. [Core Application Components](#core-application-components)
3. [Feature-Specific Components](#feature-specific-components)
4. [UI Components Library](#ui-components-library)
5. [Data Flow and State Management](#data-flow-and-state-management)
6. [Component Patterns and Examples](#component-patterns-and-examples)
7. [Testing Components](#testing-components)
8. [Performance Optimization](#performance-optimization)

## Component Hierarchy Overview

```
STEPS Application
├── App (_app.tsx)
│   ├── Global Providers (Theme, Sidebar, Notifications, etc.)
│   └── Page Components
│       ├── Layout Components
│       │   ├── DashboardLayout
│       │   ├── Header
│       │   ├── Sidebar
│       │   └── MobileNav
│       ├── Feature Components
│       │   ├── Workflow Components
│       │   ├── Admin Components
│       │   ├── Finance Components
│       │   ├── Operations Components
│       │   └── Support Components
│       └── UI Components
│           ├── Basic UI (Button, Input, Card, etc.)
│           ├── Complex UI (DataTable, Modal, etc.)
│           └── Charts and Visualizations
```

## Core Application Components

### 1. Application Shell Components

#### _app.tsx - Application Root
**Location:** `src/pages/_app.tsx`
**Purpose:** Global application wrapper with providers
**Key Features:**
- Theme provider integration
- Global state management
- Error boundaries
- Global CSS imports

```typescript
// Key concepts for Angular developers:
// - Similar to app.module.ts and app.component.ts combined
// - Wraps entire application with providers (like Angular modules)
// - Handles global state and theming

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <NotificationsProvider>
          <ApiEnvironmentProvider>
            <Component {...pageProps} />
            <Toaster />
          </ApiEnvironmentProvider>
        </NotificationsProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
```

#### DashboardLayout.tsx - Main Layout Container
**Location:** `src/components/DashboardLayout.tsx`
**Purpose:** Primary layout wrapper for dashboard pages
**Angular Equivalent:** App shell component with router-outlet

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}

export default function DashboardLayout({ 
  children, 
  title = "STEPS Dashboard",
  showSidebar = true 
}: DashboardLayoutProps) {
  const { sidebarOpen } = useSidebar();
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        {showSidebar && sidebarOpen && (
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={title} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
```

#### Sidebar.tsx - Navigation Component
**Location:** `src/components/Sidebar.tsx`
**Purpose:** Main navigation sidebar
**Key Features:**
- Dynamic menu items
- Active state management
- Role-based menu visibility
- Collapsible sections

```typescript
interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType;
  roles?: string[];
  children?: MenuItem[];
}

export default function Sidebar() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: HomeIcon
    },
    {
      id: 'workflow',
      label: 'Workflows',
      path: '/workflow',
      icon: WorkflowIcon,
      children: [
        { id: 'workflow-inbox', label: 'My Inbox', path: '/workflow-inbox', icon: InboxIcon },
        { id: 'workflow-all', label: 'All Workflows', path: '/workflow', icon: ListIcon }
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      path: '/admin',
      icon: SettingsIcon,
      roles: ['admin'],
      children: [
        { id: 'admin-users', label: 'User Management', path: '/admin/users', icon: UsersIcon },
        { id: 'admin-workflow', label: 'Workflow Config', path: '/admin/workflow-config', icon: ConfigIcon }
      ]
    }
  ];
  
  const handleNavigation = (item: MenuItem) => {
    setActiveItem(item.id);
    router.push(item.path);
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  return (
    <nav className="h-full bg-card border-r border-border">
      <div className="p-4">
        <Logo />
      </div>
      
      <div className="px-2">
        {menuItems.map(item => (
          <div key={item.id}>
            {/* Main Menu Item */}
            <button
              onClick={() => item.children ? toggleSection(item.id) : handleNavigation(item)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                activeItem === item.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
              {item.children && (
                <ChevronDownIcon 
                  className={`ml-auto h-4 w-4 transition-transform ${
                    expandedSections.includes(item.id) ? 'rotate-180' : ''
                  }`} 
                />
              )}
            </button>
            
            {/* Submenu Items */}
            {item.children && expandedSections.includes(item.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => handleNavigation(child)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                      activeItem === child.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <child.icon className="mr-3 h-4 w-4" />
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
```

### 2. Header Components

#### Header.tsx - Application Header
**Location:** `src/components/Header.tsx`
**Purpose:** Top navigation bar with user actions
**Key Features:**
- User profile dropdown
- Notifications center
- Theme switcher
- Breadcrumb navigation

```typescript
interface HeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export default function Header({ title, breadcrumbs }: HeaderProps) {
  const { toggleSidebar } = useSidebar();
  const { notifications, unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-accent"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRightIcon className="h-4 w-4 mx-2 text-muted-foreground" />}
                {item.path ? (
                  <Link href={item.path} className="text-primary hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}
        
        {/* Title */}
        {title && !breadcrumbs && (
          <h1 className="text-xl font-semibold">{title}</h1>
        )}
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Switcher */}
        <ThemeSwitcher />
        
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-accent relative"
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationsPanel 
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">John Doe</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
              <div className="py-1">
                <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-accent">
                  Settings
                </Link>
                <Link href="/help" className="block px-4 py-2 text-sm hover:bg-accent">
                  Help
                </Link>
                <hr className="my-1 border-border" />
                <button className="block w-full text-left px-4 py-2 text-sm hover:bg-accent">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

## Feature-Specific Components

### 1. Workflow Components

#### WorkflowInboxDashboard.tsx - Main Workflow Interface
**Location:** `src/components/workflow-inbox/WorkflowInboxDashboard.tsx`
**Purpose:** Central workflow management interface
**Key Features:**
- Application grouping
- Dynamic list/detail layout
- Real-time updates
- Advanced filtering

```typescript
export default function WorkflowInboxDashboard() {
  const { workflowItems, loading, error, refreshData } = useWorkflowInbox();
  const [selectedItem, setSelectedItem] = useState<WorkflowInboxItemData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    application: 'all'
  });
  
  // Group items by application
  const groupedItems = useMemo(() => {
    const filtered = workflowItems.filter(item => {
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
      if (filters.application !== 'all' && item.application !== filters.application) return false;
      if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
    
    return filtered.reduce((groups, item) => {
      const app = item.application;
      if (!groups[app]) groups[app] = [];
      groups[app].push(item);
      return groups;
    }, {} as Record<string, WorkflowInboxItemData[]>);
  }, [workflowItems, filters]);
  
  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(refreshData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refreshData]);
  
  if (loading) return <WorkflowInboxSkeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refreshData} />;
  
  return (
    <div className="h-full flex flex-col">
      {/* Summary Statistics */}
      <div className="mb-6">
        <WorkflowInboxSummary items={workflowItems} />
      </div>
      
      {/* Filters */}
      <div className="mb-4">
        <WorkflowInboxFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          applications={Object.keys(groupedItems)}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex gap-6">
        {/* Workflow List */}
        <div className={`transition-all duration-300 ${selectedItem ? 'w-1/3' : 'w-full'}`}>
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([application, items]) => (
              <WorkflowApplicationGroup
                key={application}
                application={application}
                items={items}
                selectedItemId={selectedItem?.id}
                onItemSelect={setSelectedItem}
              />
            ))}
          </div>
        </div>
        
        {/* Detail Panel */}
        {selectedItem && (
          <div className="w-2/3">
            <ModernWorkflowDetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onUpdate={refreshData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

#### WorkflowApplicationGroup.tsx - Application Grouping Component
**Location:** `src/components/workflow-inbox/WorkflowApplicationGroup.tsx`
**Purpose:** Groups workflow items by application
**Key Features:**
- Collapsible groups
- Item count badges
- Bulk actions

```typescript
interface WorkflowApplicationGroupProps {
  application: string;
  items: WorkflowInboxItemData[];
  selectedItemId?: string;
  onItemSelect: (item: WorkflowInboxItemData) => void;
}

export default function WorkflowApplicationGroup({
  application,
  items,
  selectedItemId,
  onItemSelect
}: WorkflowApplicationGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };
  
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Group Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-left"
          >
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} 
            />
            <h3 className="font-semibold text-lg">{application}</h3>
            <Badge variant="secondary">{items.length}</Badge>
          </button>
          
          {isExpanded && items.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItems.length === items.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedItems.length > 0 && `${selectedItems.length} selected`}
              </span>
              {selectedItems.length > 0 && (
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Group Items */}
      {isExpanded && (
        <div className="divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex items-center">
              <div className="p-2">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleItemSelect(item.id)}
                />
              </div>
              <div className="flex-1">
                <WorkflowInboxItem
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onClick={() => onItemSelect(item)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Admin Components

#### AdminDashboard.tsx - Admin Interface
**Location:** `src/components/admin/AdminDashboard.tsx`
**Purpose:** Main admin dashboard with tabs
**Key Features:**
- Tab-based navigation
- Role-based access control
- System monitoring

```typescript
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  
  const tabs = [
    { id: 'overview', label: 'Overview', component: AdminOverview },
    { id: 'users', label: 'User Management', component: UserManagement },
    { id: 'workflows', label: 'Workflow Config', component: WorkflowConfig },
    { id: 'system', label: 'System Settings', component: SystemSettings },
    { id: 'api', label: 'API Management', component: ApiEnvironmentManager }
  ];
  
  // Check admin permissions
  if (!user?.roles?.includes('admin')) {
    return <AccessDenied />;
  }
  
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminOverview;
  
  return (
    <DashboardLayout title="Administration">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[600px]">
          <ActiveComponent />
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### 3. Finance Components

#### FinanceDashboard.tsx - Finance Dashboard
**Location:** `src/components/finance/FinanceDashboard.tsx`
**Purpose:** Financial data visualization and management
**Key Features:**
- Configurable tiles
- Real-time data updates
- Interactive charts

```typescript
export default function FinanceDashboard() {
  const { tiles, updateTileConfig } = useFinanceTiles();
  const { data, loading, error } = useFinanceData();
  const [editMode, setEditMode] = useState(false);
  
  if (loading) return <FinanceDashboardSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <DashboardLayout title="Finance Dashboard">
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <DateSelector />
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Done Editing' : 'Edit Layout'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Tile Grid */}
        <TileGrid
          tiles={tiles}
          data={data}
          editMode={editMode}
          onTileUpdate={updateTileConfig}
        />
      </div>
    </DashboardLayout>
  );
}
```

## UI Components Library

### 1. Basic UI Components

#### Button Component
**Location:** `src/components/ui/button.tsx`
**Purpose:** Reusable button component with variants
**Key Features:**
- Multiple variants (default, destructive, outline, etc.)
- Size variations
- Loading states
- Icon support

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, icon: Icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {Icon && !loading && <Icon className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);
```

#### Card Component
**Location:** `src/components/ui/card.tsx`
**Purpose:** Container component for content sections
**Key Features:**
- Header, content, and footer sections
- Hover effects
- Clickable variants

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  clickable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, clickable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        hover && "hover:shadow-md transition-shadow",
        clickable && "cursor-pointer hover:bg-accent/50",
        className
      )}
      {...props}
    />
  )
);

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
```

### 2. Complex UI Components

#### DataTable Component
**Location:** `src/components/ui/data-table.tsx`
**Purpose:** Advanced data table with sorting, filtering, and pagination
**Key Features:**
- Column sorting
- Row selection
- Pagination
- Search and filtering
- Export functionality

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  onRowSelect?: (rows: T[]) => void;
  onExport?: () => void;
}

export function DataTable<T>({
  data,
  columns,
  searchable = true,
  selectable = false,
  pagination = true,
  onRowSelect,
  onExport
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
  });
  
  // Handle row selection
  useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelect(selectedRows);
    }
  }, [rowSelection, onRowSelect, table]);
  
  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        {searchable && (
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          {Object.keys(rowSelection).length > 0 && (
            <span className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} row(s) selected
            </span>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              Export
            </Button>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Data Flow and State Management

### 1. Context Providers

#### Theme Context
**Location:** `src/contexts/ThemeContext.tsx`
**Purpose:** Global theme management
**Key Features:**
- Light/dark mode toggle
- System preference detection
- Persistent theme storage

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  actualTheme: 'light' | 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setActualTheme(systemTheme);
    } else {
      setActualTheme(theme);
    }
  }, [theme]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
  }, [actualTheme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 2. Custom Hooks

#### useWorkflowInbox Hook
**Location:** `src/hooks/useWorkflowInbox.ts`
**Purpose:** Workflow inbox data management
**Key Features:**
- Data fetching
- Real-time updates
- Error handling
- Caching

```typescript
export function useWorkflowInbox() {
  const [workflowItems, setWorkflowItems] = useState<WorkflowInboxItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fetchWorkflowItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we should use real API or mock data
      const useRealApi = process.env.NEXT_PUBLIC_FORCE_REAL_API === 'true';
      
      if (useRealApi) {
        const response = await fetch('/api/workflow-inbox');
        if (!response.ok) throw new Error('Failed to fetch workflow items');
        const data = await response.json();
        setWorkflowItems(data);
      } else {
        // Use mock data
        const mockData = generateMockWorkflowItems();
        setWorkflowItems(mockData);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchWorkflowItems();
  }, [fetchWorkflowItems]);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchWorkflowItems, 30000);
    return () => clearInterval(interval);
  }, [fetchWorkflowItems]);
  
  const refreshData = useCallback(() => {
    fetchWorkflowItems();
  }, [fetchWorkflowItems]);
  
  const updateWorkflowItem = useCallback((itemId: string, updates: Partial<WorkflowInboxItemData>) => {
    setWorkflowItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);
  
  return {
    workflowItems,
    loading,
    error,
    lastUpdated,
    refreshData,
    updateWorkflowItem
  };
}
```

## Component Patterns and Examples

### 1. Compound Components Pattern

#### Modal Component
```typescript
// Modal compound component pattern
export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose
};

// Usage
<Modal.Root>
  <Modal.Trigger asChild>
    <Button>Open Modal</Button>
  </Modal.Trigger>
  <Modal.Content>
    <Modal.Header>
      <Modal.Title>Modal Title</Modal.Title>
      <Modal.Close />
    </Modal.Header>
    <Modal.Body>
      Modal content goes here
    </Modal.Body>
    <Modal.Footer>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </Modal.Footer>
  </Modal.Content>
</Modal.Root>
```

### 2. Render Props Pattern

#### DataFetcher Component
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return <>{children({ data, loading, error, refetch: fetchData })}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {({ data, loading, error, refetch }) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} onRetry={refetch} />;
    return <UserList users={data || []} />;
  }}
</DataFetcher>
```

### 3. Higher-Order Components (HOC) Pattern

#### withAuth HOC
```typescript
interface WithAuthProps {
  user: User | null;
  loading: boolean;
}

export function withAuth<P extends WithAuthProps>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: Omit<P, keyof WithAuthProps>) {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <LoadingSpinner />;
    }
    
    if (!user) {
      return <LoginRequired />;
    }
    
    if (requiredRoles && !requiredRoles.some(role => user.roles.includes(role))) {
      return <AccessDenied />;
    }
    
    return <Component {...(props as P)} user={user} loading={loading} />;
  };
}

// Usage
const AdminPanel = withAuth(AdminPanelComponent, ['admin']);
```

## Testing Components

### 1. Unit Testing with Jest and React Testing Library

```typescript
// WorkflowInboxItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import WorkflowInboxItem from '../WorkflowInboxItem';

const mockItem = {
  id: '1',
  title: 'Test Workflow',
  description: 'Test Description',
  status: 'active',
  priority: 'high',
  application: 'Test App',
  lastUpdated: new Date().toISOString()
};

describe('WorkflowInboxItem', () => {
  it('renders workflow item correctly', () => {
    const onClickMock = jest.fn();
    
    render(
      <WorkflowInboxItem
        item={mockItem}
        isSelected={false}
        onClick={onClickMock}
      />
    );
    
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const onClickMock = jest.fn();
    
    render(
      <WorkflowInboxItem
        item={mockItem}
        isSelected={false}
        onClick={onClickMock}
      />
    );
    
    fireEvent.click(screen.getByText('Test Workflow'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
  
  it('applies selected styles when selected', () => {
    render(
      <WorkflowInboxItem
        item={mockItem}
        isSelected={true}
        onClick={() => {}}
      />
    );
    
    const container = screen.getByText('Test Workflow').closest('div');
    expect(container).toHaveClass('bg-blue-50');
  });
});
```

### 2. Integration Testing

```typescript
// WorkflowInboxDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkflowInboxDashboard from '../WorkflowInboxDashboard';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('WorkflowInboxDashboard', () => {
  it('loads and displays workflow items', async () => {
    renderWithProviders(<WorkflowInboxDashboard />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('My Workflow Inbox')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### 1. Memoization

```typescript
// Memoized component to prevent unnecessary re-renders
const WorkflowInboxItem = React.memo(function WorkflowInboxItem({
  item,
  isSelected,
  onClick
}: WorkflowInboxItemProps) {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);
  
  return (
    <div onClick={handleClick}>
      {/* Component content */}
    </div>
  );
});

// Memoized expensive calculations
const WorkflowInboxDashboard = () => {
  const { workflowItems } = useWorkflowInbox();
  
  const groupedItems = useMemo(() => {
    return workflowItems.reduce((groups, item) => {
      const app = item.application;
      if (!groups[app]) groups[app] = [];
      groups[app].push(item);
      return groups;
    }, {} as Record<string, WorkflowInboxItemData[]>);
  }, [workflowItems]);
  
  return (
    // Component JSX
  );
};
```

### 2. Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties }) => React.ReactElement;
}

export function VirtualizedList({ items, height, itemHeight, renderItem }: VirtualizedListProps) {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
    >
      {renderItem}
    </List>
  );
}
```

### 3. Code Splitting

```typescript
// Lazy load components
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const FinanceDashboard = lazy(() => import('../components/finance/FinanceDashboard'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

This comprehensive guide provides Angular developers with the knowledge needed to understand and work with the STEPS React application architecture. Each component is explained with its purpose, key features, and practical examples that relate to familiar Angular concepts.