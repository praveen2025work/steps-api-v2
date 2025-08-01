import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';
import DateSelector from './DateSelector';
import { Bell, User, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/contexts/SidebarContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationsPanel from './notifications/NotificationsPanel';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {/* Header for mobile and desktop */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="w-full flex h-16 items-center justify-between py-4 px-2 sm:px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <MobileNav />
              <Logo />
              
              {/* Page title next to logo - responsive for mobile */}
              {title && (
                <div className="flex flex-col">
                  <h1 className="text-base md:text-lg font-bold truncate max-w-[150px] md:max-w-none">{title}</h1>
                </div>
              )}
              
              {/* Business Date Selector - moved after title */}
              <DateSelector 
                buttonVariant="default" 
                buttonSize="default" 
                className="bg-white text-gray-800 hover:bg-slate-50 font-medium shadow-sm border border-gray-200 ml-2"
              />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Switcher */}
              <ThemeSwitcher />
              
              {/* Separator */}
              <div className="h-6 w-px bg-border hidden md:block"></div>
              
              {/* Notification button */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={togglePanel}
                  className={`relative ${isPanelOpen ? "bg-accent" : ""}`}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </div>
              
              {/* Refresh button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => window.dispatchEvent(new CustomEvent('app:refresh'))}
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              {/* User profile */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary">PK</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Praveen Kumar</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 w-full pt-0 pb-4 sm:pb-6 px-2 sm:px-4 lg:px-6">
          {children}
        </main>
      </div>
      
      {/* Slide-in notifications panel */}
      <NotificationsPanel isOpen={isPanelOpen} onClose={closePanel} />
    </div>
  );
};

export default DashboardLayout;
export { DashboardLayout };