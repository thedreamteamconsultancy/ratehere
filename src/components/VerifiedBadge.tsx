import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export default function VerifiedBadge({ 
  size = 'md', 
  showTooltip = true,
  className 
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const badge = (
    <CheckCircle2 
      className={cn(
        'text-blue-500 fill-blue-100 dark:fill-blue-950 inline-block',
        sizeClasses[size],
        className
      )}
      aria-label="Verified"
    />
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            {badge}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">Verified Profile</p>
          <p className="text-xs text-muted-foreground">This profile has been verified by admin</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
