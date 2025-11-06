-- Create seller_ratings table
CREATE TABLE public.seller_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seller_id, buyer_id)
);

-- Enable Row Level Security
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
ON public.seller_ratings
FOR SELECT
USING (true);

-- Policy: Authenticated users can create ratings
CREATE POLICY "Users can create ratings"
ON public.seller_ratings
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Policy: Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
ON public.seller_ratings
FOR UPDATE
USING (auth.uid() = buyer_id);

-- Policy: Admins can delete any rating
CREATE POLICY "Admins can delete ratings"
ON public.seller_ratings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to update seller rating when a new rating is added
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    seller_rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM public.seller_ratings
      WHERE seller_id = NEW.seller_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.seller_ratings
      WHERE seller_id = NEW.seller_id
    )
  WHERE id = NEW.seller_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update seller rating after insert
CREATE TRIGGER update_seller_rating_after_insert
AFTER INSERT ON public.seller_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();

-- Trigger to update seller rating after update
CREATE TRIGGER update_seller_rating_after_update
AFTER UPDATE ON public.seller_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();

-- Trigger to update seller rating after delete
CREATE TRIGGER update_seller_rating_after_delete
AFTER DELETE ON public.seller_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();