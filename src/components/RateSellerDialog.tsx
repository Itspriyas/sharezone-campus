import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateSellerDialogProps {
  sellerId: string;
  sellerName: string;
  buyerId: string;
}

export const RateSellerDialog = ({ sellerId, sellerName, buyerId }: RateSellerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user already rated this seller
      const { data: existingRating } = await supabase
        .from('seller_ratings')
        .select('id')
        .eq('seller_id', sellerId)
        .eq('buyer_id', buyerId)
        .maybeSingle();

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('seller_ratings')
          .update({
            rating,
            comment: comment.trim() || null,
          })
          .eq('id', existingRating.id);

        if (error) throw error;
        toast.success('Rating updated successfully');
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('seller_ratings')
          .insert({
            seller_id: sellerId,
            buyer_id: buyerId,
            rating,
            comment: comment.trim() || null,
          });

        if (error) throw error;
        toast.success('Rating submitted successfully');
      }

      setOpen(false);
      setRating(0);
      setComment('');
      
      // Reload page to show updated rating
      window.location.reload();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star className="h-4 w-4" />
          Rate Seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {sellerName}</DialogTitle>
          <DialogDescription>
            Share your experience with this seller
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comment (optional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this seller..."
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
