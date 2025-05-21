import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBusinessDate, setBusinessDate } from '@/lib/dateUtils';

interface DateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date>(getBusinessDate());
  const [dateFormat, setDateFormat] = useState<string>('yyyy-MM-dd');
  
  // Update localStorage when date changes
  useEffect(() => {
    setBusinessDate(selectedDate);
  }, [selectedDate]);

  return (
    <DateContext.Provider value={{ 
      selectedDate, 
      setSelectedDate, 
      dateFormat, 
      setDateFormat 
    }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}