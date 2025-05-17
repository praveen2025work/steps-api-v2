import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '@/components/notifications/NotificationsCenter';
import { generateMockNotifications } from '@/data/notificationsData';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Load notifications on mount
  useEffect(() => {
    refreshNotifications();
    
    // Set up interval to check for new notifications (simulated)
    const interval = setInterval(() => {
      // In a real app, this would be an API call to check for new notifications
      const chance = Math.random();
      if (chance > 0.7) { // 30% chance of new notification
        refreshNotifications();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);
  const togglePanel = () => setIsPanelOpen(prev => !prev);
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  const refreshNotifications = () => {
    const mockNotifications = generateMockNotifications();
    // Keep only the last 20 notifications
    setNotifications(mockNotifications.slice(0, 20));
  };
  
  return (
    <NotificationsContext.Provider 
      value={{
        notifications,
        unreadCount,
        isPanelOpen,
        openPanel,
        closePanel,
        togglePanel,
        markAsRead,
        markAllAsRead,
        refreshNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};