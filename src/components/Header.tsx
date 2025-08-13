import React, { useState, useEffect } from 'react';
import SafeRouter from './SafeRouter';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Bell, User, RefreshCw } from 'lucide-react';
import DateSelector from './DateSelector';
import ThemeSwitcher from './ThemeSwitcher';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationsPanel from './notifications/NotificationsPanel';

const Header = () => {
  return (
    <SafeRouter>
      {(router) => <HeaderContent router={router} />}
    </SafeRouter>
  );
};

const HeaderContent = ({ router }: { router: any }) => {
  const { 
    unreadCount, 
    isPanelOpen, 
    togglePanel, 
    closePanel 
  } = useNotifications();
  const { userInfo, loading, error } = useUser();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  useEffect(() => {
    // Set initial last updated time
    setLastUpdated(new Date());
    
    // Listen for refresh events
    const handleRefresh = () => {
      setLastUpdated(new Date());
    };
    
    window.addEventListener('app:refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('app:refresh', handleRefresh);
    };
  }, []);

  const renderUserMenu = () => {
    if (loading) {
      return <Skeleton className="h-8 w-24" />;
    }

    if (error) {
      return <span className="text-xs text-destructive">Error</span>;
    }

    if (userInfo) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">{userInfo.displayName || userInfo.userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userInfo.displayName || userInfo.userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userInfo.emailAddress}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-muted-foreground space-y-1">
              {userInfo.description && <p>{userInfo.description}</p>}
              <p><b>Username:</b> {userInfo.userName}</p>
              {userInfo.employeeId && <p><b>Employee ID:</b> {userInfo.employeeId}</p>}
              {userInfo.samAccountName && <p><b>SAM Account:</b> {userInfo.samAccountName}</p>}
              {userInfo.distinguishedName && <p><b>Distinguished Name:</b> {userInfo.distinguishedName}</p>}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/help')}>
              Help
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return null;
  };

  return (
    <div className="w-full border-b">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <div className="cursor-pointer" onClick={() => router.push("/")}>
            <Logo />
          </div>
          <DateSelector 
            buttonVariant="default" 
            buttonSize="default" 
            label="Business Date"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('app:refresh'))}
            title="Refresh data"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={togglePanel}
              className={isPanelOpen ? "bg-accent" : ""}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          </div>
          
          {renderUserMenu()}
        </div>
      </div>
      
      {/* Slide-in notifications panel */}
      <NotificationsPanel isOpen={isPanelOpen} onClose={closePanel} />
    </div>
  );
};

export default Header;