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
      {/* Process flow nodes */}
      <rect x="2" y="3" width="4" height="4" rx="1" />
      <rect x="10" y="3" width="4" height="4" rx="1" />
      <rect x="18" y="3" width="4" height="4" rx="1" />
      
      {/* Decision diamond */}
      <path d="M10 12 L12 10 L14 12 L12 14 Z" />
      
      {/* End process nodes */}
      <rect x="2" y="17" width="4" height="4" rx="1" />
      <rect x="18" y="17" width="4" height="4" rx="1" />
      
      {/* Connecting arrows */}
      <path d="M6 5h4" />
      <path d="M14 5h4" />
      <path d="M12 7v3" />
      <path d="M10 12l-6 5" />
      <path d="M14 12l6 5" />
      
      {/* Arrow heads */}
      <path d="M9 4.5l1 0.5-1 0.5" />
      <path d="M17 4.5l1 0.5-1 0.5" />
      <path d="M11.5 9l0.5 1-0.5 1" />
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