import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';
import { Bell, Search, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Header for mobile and desktop */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <MobileNav />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="hidden md:flex"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
              <Logo />
              
              {/* Search bar */}
              <div className="hidden md:flex relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search workflows, applications..." 
                  className="pl-8 w-[300px] bg-muted/30"
                />
              </div>
            </div>
            
            {title && (
              <h1 className="text-xl font-bold md:hidden">{title}</h1>
            )}
            
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
        <main className="flex-1 container py-6">
          {title && (
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold hidden md:block">{title}</h1>
              <div className="text-sm text-muted-foreground">
                <span>Last updated: April 14, 2025 | 02:28 PM</span>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;