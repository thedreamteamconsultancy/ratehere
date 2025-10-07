import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewInputProps {
  profileId: string;
  currentRating: number;
  hasRated: boolean;
  onReviewSubmit: (reviewText: string) => Promise<void>;
}

export default function ReviewInput({ 
  profileId, 
  currentRating, 
  hasRated, 
  onReviewSubmit 
}: ReviewInputProps) {
  const { user } = useAuth();
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX_CHARS = 250;
  const remainingChars = MAX_CHARS - reviewText.length;

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit');
      return;
    }

    if (!hasRated) {
      toast.error('Please rate this profile first');
      return;
    }

    // Allow empty reviews - comment is optional
    if (reviewText.trim().length > 0 && reviewText.length > MAX_CHARS) {
      toast.error(`Comment must be ${MAX_CHARS} characters or less`);
      return;
    }

    setSubmitting(true);

    try {
      await onReviewSubmit(reviewText.trim());
      setReviewText('');
      toast.success(reviewText.trim() ? 'Rating and comment submitted!' : 'Rating submitted!');
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
        <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground mb-2">
          Want to add a comment?
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Sign in to rate and leave your feedback
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/auth'}
        >
          Sign In to Comment
        </Button>
      </div>
    );
  }

  if (!hasRated) {
    return (
      <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
        <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground mb-2">
          Add a Comment (Optional)
        </p>
        <p className="text-xs text-muted-foreground">
          Rate this profile first, then you can add your comment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="review" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Add a Comment (Optional)
        </Label>
        <Textarea
          id="review"
          placeholder="Share your thoughts about this profile..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          rows={4}
          disabled={submitting}
          className="resize-none"
        />
        <div className="flex justify-between items-center text-xs">
          <span className={remainingChars < 20 ? 'text-destructive' : 'text-muted-foreground'}>
            {remainingChars} characters remaining
          </span>
          {reviewText.trim() && (
            <span className="text-muted-foreground">
              {reviewText.trim().split(/\s+/).length} words
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : reviewText.trim() ? (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit Rating & Comment
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit Rating Only
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
