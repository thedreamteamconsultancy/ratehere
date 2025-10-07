import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import StarRating from './StarRating';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  profileId: string;
  userId: string;
  ratingValue: number;
  reviewText: string;
  timestamp: any;
  userName?: string;
  userPhoto?: string;
}

interface AllReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  profileName: string;
}

export default function AllReviewsModal({
  open,
  onOpenChange,
  profileId,
  profileName,
}: AllReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAllReviews();
    }
  }, [open, profileId]);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('profileId', '==', profileId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const reviewsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const reviewData = docSnapshot.data();
          
          return {
            id: docSnapshot.id,
            ...reviewData,
            userName: reviewData.userName || 'Anonymous User',
            userPhoto: reviewData.userPhoto || '',
          } as Review;
        })
      );

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching all reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            All Reviews for {profileName}
          </DialogTitle>
          <DialogDescription>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} total
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-sm text-muted-foreground">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="transition-smooth hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={review.userPhoto} alt={review.userName} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {review.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">
                              {review.userName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <StarRating rating={review.ratingValue} size={16} />
                              <span className="text-xs text-muted-foreground">
                                {review.timestamp?.toDate 
                                  ? formatDistanceToNow(review.timestamp.toDate(), { addSuffix: true })
                                  : 'Recently'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed break-words">
                          {review.reviewText}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
