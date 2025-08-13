import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserInfo } from '@/types/user-types';

interface UserContextType {
  userInfo: UserInfo | null;
  loading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_USER_INFO_API_URL!, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data: UserInfo = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};