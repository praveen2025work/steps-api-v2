import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Logo from './Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header for mobile */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <MobileNav />
              <Logo />
            </div>
            {title && (
              <h1 className="text-xl font-bold md:hidden">{title}</h1>
            )}
            <div className="flex items-center gap-2">
              {/* Placeholder for user menu, notifications, etc. */}
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 container py-6">
          {title && (
            <h1 className="text-2xl font-bold mb-6 hidden md:block">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;