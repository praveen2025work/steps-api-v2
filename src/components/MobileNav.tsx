import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SafeRouter from './SafeRouter';
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
  Bell,
  BarChart4,
  Shield,
  HelpCircle,
  Database,
  UserCog,
  Tags
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  pattern?: RegExp;
};

// Align with the same structure as Sidebar for consistency
type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: <LayoutDashboard className="h-5 w-5" />
      },
      {
        title: 'Management Board',
        href: '/management',
        icon: <BarChart4 className="h-5 w-5" />
      },
      {
        title: 'Finance Dashboard',
        href: '/finance',
        icon: <BarChart4 className="h-5 w-5" />,
        pattern: /^\/finance/
      }
    ]
  },
  {
    title: "Admin",
    items: [
      {
        title: 'Applications',
        href: '/admin?tab=applications',
        icon: <Database className="h-5 w-5" />
      },
      {
        title: 'Roles',
        href: '/admin?tab=roles',
        icon: <UserCog className="h-5 w-5" />
      },
      {
        title: 'Hierarchy Data',
        href: '/admin/hierarchy-data',
        icon: <Database className="h-5 w-5" />,
        pattern: /^\/admin\/hierarchy-data/
      },
      {
        title: 'Metadata',
        href: '/admin/metadata',
        icon: <Tags className="h-5 w-5" />,
        pattern: /^\/admin\/metadata/
      },
      {
        title: 'User Hierarchy',
        href: '/admin/user-hierarchy',
        icon: <Users className="h-5 w-5" />,
        pattern: /^\/admin\/user-hierarchy/
      }
    ]
  },
  {
    title: "Support Admin",
    items: [
      {
        title: 'Admin Dashboard',
        href: '/admin',
        icon: <Shield className="h-5 w-5" />,
        pattern: /^\/admin$/
      },
      {
        title: 'Operations Center',
        href: '/operations',
        icon: <Activity className="h-5 w-5" />,
        pattern: /^\/operations/
      },
      {
        title: 'PnL Operations',
        href: '/pnl-operations',
        icon: <BarChart4 className="h-5 w-5" />,
        pattern: /^\/pnl-operations/
      },
      {
        title: 'Support Dashboard',
        href: '/support',
        icon: <HelpCircle className="h-5 w-5" />,
        pattern: /^\/support/
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: 'File Management',
        href: '/files',
        icon: <FileText className="h-5 w-5" />
      },
      {
        title: 'User Management',
        href: '/users',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Notifications',
        href: '/notifications',
        icon: <Bell className="h-5 w-5" />
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: 'Settings',
        href: '/settings',
        icon: <Settings className="h-5 w-5" />
      }
    ]
  },
  {
    title: "Help",
    items: [
      {
        title: 'Help & Support',
        href: '/help',
        icon: <HelpCircle className="h-5 w-5" />,
        pattern: /^\/help/
      }
    ]
  }
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <SafeRouter>
      {(router) => {
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
            <SheetContent side="left" className="w-72 p-0 max-w-[90vw]">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h2 className="text-xl font-bold">Workflow Tool</h2>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <nav className="flex-1 overflow-auto py-4 px-2">
                  <div className="space-y-6">
                    {navSections.map((section) => (
                      <div key={section.title} className="space-y-2">
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <ul className="space-y-1">
                          {section.items.map((item) => (
                            <li key={item.href}>
                              <button
                                onClick={() => handleNavigation(item.href)}
                                className={cn(
                                  "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                  router.isReady && (item.pattern ? item.pattern.test(router.pathname) : router.pathname === item.href) 
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
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        );
      }}
    </SafeRouter>
  );
};

export default MobileNav;