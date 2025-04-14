import { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';

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

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.pathname;

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden p-0 w-10 h-10">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-bold">Workflow System</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <nav className="flex-1 overflow-auto py-4 px-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => item.href === '/stages/[workflowId]' ? setOpen(false) : handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      (item.pattern ? item.pattern.test(currentPath) : currentPath === item.href) 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;