import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';
import { Bell, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/contexts/SidebarContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {/* Header for mobile and desktop */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <MobileNav />
              <Logo />
              
              {/* Page title next to logo with Last updated below */}
              {title && (
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold">{title}</h1>
                  <span className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Switcher */}
              <ThemeSwitcher />
              
              {/* Separator */}
              <div className="h-6 w-px bg-border hidden md:block"></div>
              
              {/* Notification button */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* User profile */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Compliance Officer</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 container py-6 px-4 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;