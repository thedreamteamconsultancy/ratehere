import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarRating from './StarRating';
import ReplyInput from './ReplyInput';
import { MessageSquare, Eye, Reply, ChevronDown, ChevronUp } from 'lucide-react';
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

interface Reply {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  replyText: string;
  timestamp: any;
}

interface ReviewsListProps {
  profileId: string;
  onViewAll: () => void;
  refreshTrigger?: number;
}

export default function ReviewsList({ profileId, onViewAll, refreshTrigger }: ReviewsListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replies, setReplies] = useState<Map<string, Reply[]>>(new Map());
  const [showRepliesFor, setShowRepliesFor] = useState<Set<string>>(new Set());
  const [showReplyInputFor, setShowReplyInputFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [profileId, refreshTrigger]);

  const fetchRepliesForReview = async (reviewId: string) => {
    try {
      const repliesRef = collection(db, 'reviewReplies');
      const q = query(
        repliesRef,
        where('reviewId', '==', reviewId),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);
      
      const repliesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reply));

      setReplies(prev => new Map(prev).set(reviewId, repliesData));
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const toggleReplies = async (reviewId: string) => {
    const newShowReplies = new Set(showRepliesFor);
    if (newShowReplies.has(reviewId)) {
      newShowReplies.delete(reviewId);
    } else {
      newShowReplies.add(reviewId);
      // Fetch replies if not already loaded
      if (!replies.has(reviewId)) {
        await fetchRepliesForReview(reviewId);
      }
    }
    setShowRepliesFor(newShowReplies);
  };

  const toggleReplyInput = (reviewId: string) => {
    setShowReplyInputFor(showReplyInputFor === reviewId ? null : reviewId);
  };

  const handleReplyAdded = async (reviewId: string) => {
    setShowReplyInputFor(null);
    await fetchRepliesForReview(reviewId);
    setShowRepliesFor(new Set(showRepliesFor).add(reviewId));
  };

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('profileId', '==', profileId),
        orderBy('timestamp', 'desc'),
        limit(3)
      );
      
      const snapshot = await getDocs(q);
      const reviewsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const reviewData = docSnapshot.data();
          
          // Fetch user data from Firebase Auth
          let userName = 'Anonymous';
          let userPhoto = '';
          
          try {
            // Try to get user data from Firestore if you store it there
            // Or you can store userName and userPhoto in the review document itself
            userName = reviewData.userName || 'Anonymous User';
            userPhoto = reviewData.userPhoto || '';
          } catch (error) {
            console.error('Error fetching user data:', error);
          }

          return {
            id: docSnapshot.id,
            ...reviewData,
            userName,
            userPhoto,
          } as Review;
        })
      );

      setReviews(reviewsData);

      // Get total count
      const allReviewsQuery = query(
        reviewsRef,
        where('profileId', '==', profileId)
      );
      const allSnapshot = await getDocs(allReviewsQuery);
      setTotalReviews(allSnapshot.size);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Recent Reviews ({totalReviews})
        </h3>
        {totalReviews > 3 && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="transition-smooth hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.userPhoto} alt={review.userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {review.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{review.userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.ratingValue} size={16} />
                        <span className="text-xs text-muted-foreground">
                          {review.timestamp?.toDate 
                            ? formatDistanceToNow(review.timestamp.toDate(), { addSuffix: true })
                            : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.reviewText && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.reviewText}
                    </p>
                  )}

                  {/* Reply Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplyInput(review.id)}
                      className="h-8 text-xs"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    {(replies.get(review.id)?.length || 0) > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReplies(review.id)}
                        className="h-8 text-xs"
                      >
                        {showRepliesFor.has(review.id) ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Hide Replies ({replies.get(review.id)?.length})
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show Replies ({replies.get(review.id)?.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {showReplyInputFor === review.id && (
                    <ReplyInput
                      reviewId={review.id}
                      onReplyAdded={() => handleReplyAdded(review.id)}
                      onCancel={() => setShowReplyInputFor(null)}
                    />
                  )}

                  {/* Replies Display */}
                  {showRepliesFor.has(review.id) && replies.get(review.id) && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted">
                      {replies.get(review.id)?.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={reply.userPhoto} alt={reply.userName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {reply.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{reply.userName}</p>
                              <span className="text-xs text-muted-foreground">
                                {reply.timestamp?.toDate 
                                  ? formatDistanceToNow(reply.timestamp.toDate(), { addSuffix: true })
                                  : 'Recently'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reply.replyText}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
