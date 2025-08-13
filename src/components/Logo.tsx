import React from 'react';
import { GitBranch, GitMerge, Workflow, GitPullRequestDraft } from 'lucide-react';
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
  
  // Modern workflow icon that represents connected process steps
  const WorkflowIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`${textColor}`}
    >
      {/* Start node */}
      <circle cx="5" cy="6" r="3" />
      {/* Decision diamond */}
      <path d="M12 2 L16 6 L12 10 L8 6 Z" />
      {/* End nodes */}
      <circle cx="19" cy="6" r="3" />
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
      {/* Connecting lines */}
      <path d="M8 6h4" />
      <path d="M16 6h3" />
      <path d="M12 10v4" />
      <path d="M12 14h-4" />
      <path d="M12 14h4" />
      <path d="M8 18h8" />
    </svg>
  );
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${bgColor} p-1 rounded`}>
        <WorkflowIcon />
      </div>
      <div className="font-bold text-lg">
        <span className={spanColor}>STEPS</span>
      </div>
    </div>
  );
};

export default Logo;