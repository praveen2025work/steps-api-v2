import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Logo: React.FC = () => {
  const { theme } = useTheme();
  
  // Define theme-specific colors
  const getThemeColors = () => {
    switch (theme) {
      case 'banking-blue':
        return {
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-500',
          spanColor: 'text-blue-500'
        };
      case 'regulatory-green':
        return {
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-500',
          spanColor: 'text-green-500'
        };
      default:
        return {
          bgColor: 'bg-primary/10',
          textColor: 'text-primary',
          spanColor: 'text-primary'
        };
    }
  };
  
  const { bgColor, textColor, spanColor } = getThemeColors();
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${bgColor} p-1 rounded`}>
        <ShieldCheck className={`h-5 w-5 ${textColor}`} />
      </div>
      <div className="font-bold text-lg">
        <span className={spanColor}>Fin</span>
        <span>Reg</span>
      </div>
    </div>
  );
};

export default Logo;