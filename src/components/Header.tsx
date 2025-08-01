import React, { useState, useEffect } from 'react';
import SafeRouter from './SafeRouter';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Bell, User, RefreshCw } from 'lucide-react';
import DateSelector from './DateSelector';
import ThemeSwitcher from './ThemeSwitcher';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Praveen Kumar</DropdownMenuLabel>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/help')}>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Slide-in notifications panel */}
      <NotificationsPanel isOpen={isPanelOpen} onClose={closePanel} />
    </div>
  );
};

export default Header;