import Link from 'next/link';
import { useEffect, useRef } from 'react';
import SafeRouter from './SafeRouter';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Activity,
  Settings,
  Users,
  Bell,
  BarChart4,
  ShieldAlert,
  FileCheck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  UserCog,
  CalendarDays,
  CalendarClock,
  GitFork,
  Tags,
  Workflow,
  Shield,
  Sparkles,
  TrendingUp,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  pattern?: RegExp;
};

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
        href: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        pattern: /^\/dashboard$/
      },
      {
        title: 'Task Center',
        href: '/workflow-inbox',
        icon: <Workflow className="h-5 w-5" />,
        pattern: /^\/workflow-inbox/
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
      },
      {
        title: 'User Processes',
        href: '/dashboard/user-processes',
        icon: <Layers className="h-5 w-5" />,
        pattern: /^\/dashboard\/user-processes/
      }
    ]
  },
  {
    title: "Experimental",
    items: [
      {
        title: 'Experimental Dashboard',
        href: '/experimental',
        icon: <Sparkles className="h-5 w-5" />,
        pattern: /^\/experimental$/
      },
      {
        title: 'AI Assistant',
        href: '/experimental/ai-assistant',
        icon: <Sparkles className="h-5 w-5" />,
        pattern: /^\/experimental\/ai-assistant/
      },
      {
        title: 'Predictive Analytics',
        href: '/experimental/predictive-analytics',
        icon: <TrendingUp className="h-5 w-5" />,
        pattern: /^\/experimental\/predictive-analytics/
      },

      {
        title: 'NLP Commands',
        href: '/experimental/nlp-commands',
        icon: <Command className="h-5 w-5" />,
        pattern: /^\/experimental\/nlp-commands/
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
        title: 'Holiday Calendar',
        href: '/admin?tab=holidays',
        icon: <CalendarDays className="h-5 w-5" />
      },
      {
        title: 'Run Calendar',
        href: '/admin?tab=runcalendar',
        icon: <CalendarClock className="h-5 w-5" />
      },
      {
        title: 'Hierarchy',
        href: '/admin?tab=hierarchy',
        icon: <GitFork className="h-5 w-5" />
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
        title: 'Workflow Config',
        href: '/admin/workflow-config',
        icon: <Workflow className="h-5 w-5" />,
        pattern: /^\/admin\/workflow-config/
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

const Sidebar = () => {
  const { theme } = useTheme();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node)) {
        closeSidebar();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, closeSidebar]);
  
  // Get theme-specific styles
  const getActiveStyles = () => {
    switch (theme) {
      case 'banking-blue':
        return "bg-blue-500 text-white";
      case 'regulatory-green':
        return "bg-green-500 text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <SafeRouter>
      {(router) => (
        <>
          {/* Single toggle button that's visible when sidebar is collapsed */}
          {!sidebarOpen && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleSidebar}
              className="fixed top-20 left-0 z-50 rounded-r-full rounded-l-none border-l-0 h-12 w-6"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          )}
          
          <div 
            ref={sidebarRef}
            className={cn(
              "md:flex h-screen flex-col fixed inset-y-0 z-[100] border-r border-border bg-card transition-all duration-300 ease-in-out",
              sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
            )}
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">STEPS</h2>
                <p className="text-xs text-muted-foreground mt-1">Financial Workflow Management</p>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <nav className="flex-1 overflow-auto py-4 px-2">
              {navSections.map((section, index) => (
                <div key={section.title} className={index > 0 ? "mt-6" : ""}>
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      // Check if this item should be active based on path and query params
                      const isActive = router.isReady && (item.pattern 
                        ? item.pattern.test(router.pathname)
                        : item.href.includes('?') 
                          ? router.pathname === item.href.split('?')[0] && router.asPath === item.href
                          : router.pathname === item.href);
                      
                      return (
                        <li key={item.href}>
                          {item.href === '/stages/[workflowId]' ? (
                            <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                              {item.icon}
                              {item.title}
                            </span>
                          ) : (
                            (() => {
                              // For complex pages like workflow detail, force a complete page reload
                              const isComplexPage = router.isReady && (
                                router.pathname.includes('/workflow/') || 
                                router.pathname.includes('/hierarchy/') ||
                                router.pathname.includes('/stages/') ||
                                router.asPath.includes('/workflow/') ||
                                router.asPath.includes('/hierarchy/') ||
                                router.asPath.includes('/stages/')
                              );
                              
                              if (isComplexPage) {
                                // Use a button instead of Link for complex pages to force reload
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      closeSidebar();
                                      
                                      // Emit custom navigation event to clear any active workflow detail state
                                      window.dispatchEvent(new CustomEvent('sidebar:navigate', {
                                        detail: { href: item.href, title: item.title }
                                      }));
                                      
                                      // Add timestamp to force complete reload and bypass any caching
                                      const url = item.href.includes('?') 
                                        ? `${item.href}&_t=${Date.now()}`
                                        : `${item.href}?_t=${Date.now()}`;
                                      
                                      // Force a complete page reload with cache busting
                                      window.location.href = url;
                                    }}
                                    className={cn(
                                      "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-left",
                                      isActive ? getActiveStyles() : "text-muted-foreground"
                                    )}
                                  >
                                    {item.icon}
                                    {item.title}
                                  </button>
                                );
                              } else {
                                // Use normal Link for other pages
                                return (
                                  <Link 
                                    href={item.href}
                                    onClick={() => {
                                      closeSidebar();
                                      
                                      // Emit custom navigation event to clear any active workflow detail state
                                      window.dispatchEvent(new CustomEvent('sidebar:navigate', {
                                        detail: { href: item.href, title: item.title }
                                      }));
                                    }}
                                    className={cn(
                                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                      isActive ? getActiveStyles() : "text-muted-foreground"
                                    )}
                                  >
                                    {item.icon}
                                    {item.title}
                                  </Link>
                                );
                              }
                            })()
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </SafeRouter>
  );
};

export default Sidebar;