import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Bell, User, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnreadNotifications(false);
    }
  };

  return (
    <div className="w-full border-b">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Logo />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleNotifications}
              className={showNotifications ? "bg-accent" : ""}
            >
              <Bell className="h-5 w-5" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
            
            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-background rounded-md shadow-lg border z-[100]"
                style={{ 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="p-4 border-b hover:bg-accent/50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">Workflow Update</p>
                      <span className="text-xs text-muted-foreground">2h ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Stage 2 of "Q2 Financial Review" has been completed.</p>
                  </div>
                  
                  <div className="p-4 border-b hover:bg-accent/50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">New Assignment</p>
                      <span className="text-xs text-muted-foreground">Yesterday</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">You have been assigned to review "Annual Compliance Report".</p>
                  </div>
                  
                  <div className="p-4 border-b hover:bg-accent/50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">System Notification</p>
                      <span className="text-xs text-muted-foreground">3 days ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">STEPS system will undergo maintenance on Saturday, 10:00 PM - 2:00 AM.</p>
                  </div>
                  
                  <div className="p-4">
                    <Button variant="outline" className="w-full text-sm h-9">View all notifications</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;