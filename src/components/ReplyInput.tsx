import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ReplyInputProps {
  reviewId: string;
  onReplyAdded: () => void;
  onCancel: () => void;
}

export default function ReplyInput({ reviewId, onReplyAdded, onCancel }: ReplyInputProps) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX_CHARS = 200;
  const remainingChars = MAX_CHARS - replyText.length;

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!replyText.trim()) {
      toast.error('Please write a reply');
      return;
    }

    if (replyText.length > MAX_CHARS) {
      toast.error(`Reply must be ${MAX_CHARS} characters or less`);
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'reviewReplies'), {
        reviewId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userPhoto: user.photoURL || '',
        replyText: replyText.trim(),
        timestamp: new Date(),
      });

      setReplyText('');
      toast.success('Reply posted!');
      onReplyAdded();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">Sign in to reply</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquare className="w-4 h-4" />
        Write a Reply
      </div>
      <Textarea
        placeholder="Write your reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value.slice(0, MAX_CHARS))}
        maxLength={MAX_CHARS}
        rows={3}
        disabled={submitting}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${remainingChars < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {remainingChars} characters remaining
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!replyText.trim() || submitting}
          >
            {submitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-2" />
                Post Reply
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
