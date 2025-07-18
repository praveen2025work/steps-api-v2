import { useState, useEffect, useCallback, useRef } from 'react';

interface UseUserActivityOptions {
  timeout?: number; // Timeout in milliseconds (default: 2 minutes)
  events?: string[]; // Events to listen for
}

interface UseUserActivityReturn {
  isActive: boolean;
  lastActivity: Date | null;
  resetActivity: () => void;
}

const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'keydown'
];

export const useUserActivity = (options: UseUserActivityOptions = {}): UseUserActivityReturn => {
  const {
    timeout = 2 * 60 * 1000, // 2 minutes default
    events = DEFAULT_EVENTS
  } = options;

  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState<Date | null>(new Date());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    const now = new Date();
    setLastActivity(now);
    setIsActive(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, timeout);
  }, [timeout]);

  const handleActivity = useCallback(() => {
    resetActivity();
  }, [resetActivity]);

  useEffect(() => {
    // Set initial timeout
    resetActivity();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [events, handleActivity, resetActivity]);

  return {
    isActive,
    lastActivity,
    resetActivity
  };
};