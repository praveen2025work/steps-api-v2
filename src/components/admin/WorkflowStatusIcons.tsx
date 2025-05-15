import React from 'react';
import { 
  Settings, 
  User, 
  CheckCircle, 
  Lock, 
  RefreshCw, 
  Zap, 
  Upload, 
  Download,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'auto' 
  | 'manual' 
  | 'approval' 
  | 'attest' 
  | 'alteryx' 
  | 'adhoc' 
  | 'upload' 
  | 'download';

interface StatusIconProps {
  type: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ 
  type, 
  size = 'md', 
  showLabel = false,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const iconSize = sizeClasses[size];
  
  const getIconAndColor = () => {
    switch (type) {
      case 'auto':
        return { 
          icon: <Settings className={iconSize} />, 
          bgColor: 'bg-blue-100', 
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          label: 'Auto'
        };
      case 'manual':
        return { 
          icon: <User className={iconSize} />, 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          label: 'Manual'
        };
      case 'approval':
        return { 
          icon: <CheckCircle className={iconSize} />, 
          bgColor: 'bg-green-100', 
          textColor: 'text-green-600',
          borderColor: 'border-green-200',
          label: 'Approval'
        };
      case 'attest':
        return { 
          icon: <Lock className={iconSize} />, 
          bgColor: 'bg-purple-100', 
          textColor: 'text-purple-600',
          borderColor: 'border-purple-200',
          label: 'Attest'
        };
      case 'alteryx':
        return { 
          icon: <RefreshCw className={iconSize} />, 
          bgColor: 'bg-orange-100', 
          textColor: 'text-orange-600',
          borderColor: 'border-orange-200',
          label: 'Alteryx'
        };
      case 'adhoc':
        return { 
          icon: <Zap className={iconSize} />, 
          bgColor: 'bg-teal-100', 
          textColor: 'text-teal-600',
          borderColor: 'border-teal-200',
          label: 'Adhoc'
        };
      case 'upload':
        return { 
          icon: <Upload className={iconSize} />, 
          bgColor: 'bg-sky-100', 
          textColor: 'text-sky-600',
          borderColor: 'border-sky-200',
          label: 'Upload'
        };
      case 'download':
        return { 
          icon: <Download className={iconSize} />, 
          bgColor: 'bg-emerald-100', 
          textColor: 'text-emerald-600',
          borderColor: 'border-emerald-200',
          label: 'Download'
        };
      default:
        return { 
          icon: <User className={iconSize} />, 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          label: 'Unknown'
        };
    }
  };

  const { icon, bgColor, textColor, borderColor, label } = getIconAndColor();

  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 gap-1.5",
      bgColor,
      textColor,
      borderColor,
      className
    )}>
      {icon}
      {showLabel && <span className="text-xs font-medium">{label}</span>}
    </div>
  );
};

export const StatusLegend: React.FC = () => {
  const statuses: StatusType[] = ['auto', 'manual', 'approval', 'attest', 'alteryx', 'adhoc', 'upload', 'download'];
  
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {statuses.map(status => (
        <StatusIcon key={status} type={status} size="sm" showLabel={true} />
      ))}
    </div>
  );
};

interface DependencyLineProps {
  fromId: string;
  toId: string;
  className?: string;
}

export const DependencyLine: React.FC<DependencyLineProps> = ({ 
  fromId, 
  toId, 
  className 
}) => {
  return (
    <div className={cn(
      "flex items-center text-muted-foreground gap-1",
      className
    )}>
      <span className="text-xs font-medium">{fromId}</span>
      <ArrowRight className="h-3 w-3" />
      <span className="text-xs font-medium">{toId}</span>
    </div>
  );
};

export const DependencyBadge: React.FC<{count: number}> = ({ count }) => {
  return (
    <div className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-800 w-5 h-5 text-xs font-medium">
      {count}
    </div>
  );
};