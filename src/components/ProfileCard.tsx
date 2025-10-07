import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  id: string;
  name: string;
  username?: string;
  sector: string;
  logoUrl: string;
  rating: number;
  ratingCount: number;
  verified?: boolean;
}

export default function ProfileCard({ id, name, username, sector, logoUrl, rating, ratingCount, verified = false }: ProfileCardProps) {
  return (
    <Link
      to={`/profile/${username || id}`}
      className="block bg-card rounded-xl overflow-hidden shadow-card hover:shadow-premium transition-smooth hover:scale-105 animate-scale-in"
    >
      <div className="aspect-square bg-gradient-card flex items-center justify-center p-8">
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{name}</h3>
            {verified && <VerifiedBadge size="sm" />}
          </div>
          <Badge variant="secondary" className="text-xs">
            {sector}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <StarRating rating={rating} showValue />
          <span className="text-xs text-muted-foreground">
            {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
          </span>
        </div>
      </div>
    </Link>
  );
}
