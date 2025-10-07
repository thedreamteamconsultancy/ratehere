import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrophyBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function TrophyBadge({ rank, size = 'md', showLabel = true }: TrophyBadgeProps) {
  const getConfig = () => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          label: '🥇 1st Place',
        };
      case 2:
        return {
          icon: Trophy,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20',
          label: '🥈 2nd Place',
        };
      case 3:
        return {
          icon: Medal,
          color: 'text-orange-600',
          bgColor: 'bg-orange-600/10',
          borderColor: 'border-orange-600/20',
          label: '🥉 3rd Place',
        };
      default:
        return {
          icon: Award,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-muted',
          label: `#${rank}`,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (!showLabel) {
    return (
      <div className={`inline-flex items-center justify-center rounded-full ${config.bgColor} ${config.borderColor} border p-2`}>
        <Icon className={`${sizeClasses[size]} ${config.color}`} />
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`${config.bgColor} ${config.borderColor} ${config.color} gap-1.5 font-semibold`}
    >
      <Icon className={sizeClasses[size]} />
      {config.label}
    </Badge>
  );
}
