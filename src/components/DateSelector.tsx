import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDate } from '@/contexts/DateContext';

interface DateSelectorProps {
  onChange?: (date: Date) => void;
  className?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  label?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  onChange,
  className = '',
  buttonVariant = 'outline',
  buttonSize = 'default',
  showIcon = true,
  label = 'Select date',
}) => {
  const { selectedDate, setSelectedDate, dateFormat } = useDate();
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(selectedDate);

  // Update display month when selected date changes
  useEffect(() => {
    setDisplayMonth(selectedDate);
  }, [selectedDate]);

  // Reset display month when popover opens
  useEffect(() => {
    if (open) {
      setDisplayMonth(selectedDate);
    }
  }, [open, selectedDate]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDisplayMonth(date);
      if (onChange) {
        onChange(date);
      }
      setOpen(false);
    }
  };

  const handleMonthChange = (month: Date) => {
    setDisplayMonth(month);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={`${className} justify-start shadow-sm border border-primary/20`}
        >
          {showIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
          <span className="whitespace-nowrap">{format(selectedDate, dateFormat)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          month={displayMonth}
          onMonthChange={handleMonthChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateSelector;