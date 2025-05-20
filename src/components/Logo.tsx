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
  
  // Custom workflow icon that represents process steps
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
      <path d="M2 9a3 3 0 0 1 0-6h12a3 3 0 0 1 0 6" />
      <path d="M2 12h20" />
      <path d="M22 15a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path d="M13 15h-3" />
      <path d="M7 15a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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