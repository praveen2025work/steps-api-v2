import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Activity,
  Settings,
  Users,
  Calendar,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  pattern?: RegExp;
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    title: 'Stage Viewer',
    href: '/stages/[workflowId]',
    icon: <Layers className="h-5 w-5" />,
    pattern: /^\/stages/
  },
  {
    title: 'File Manager',
    href: '/files',
    icon: <FileText className="h-5 w-5" />
  },
  {
    title: 'Process Monitor',
    href: '/monitor',
    icon: <Activity className="h-5 w-5" />
  },
  {
    title: 'User Management',
    href: '/users',
    icon: <Users className="h-5 w-5" />
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: <Calendar className="h-5 w-5" />
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: <Bell className="h-5 w-5" />
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />
  }
];

const Sidebar = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-50 border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold">Workflow System</h2>
      </div>
      <nav className="flex-1 overflow-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href === '/stages/[workflowId]' ? '#' : item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  (item.pattern ? item.pattern.test(currentPath) : currentPath === item.href) 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;