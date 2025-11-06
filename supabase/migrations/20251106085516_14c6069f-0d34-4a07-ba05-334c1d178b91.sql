-- Add sold status to products
ALTER TABLE public.products ADD COLUMN sold boolean DEFAULT false;

-- Add seller rating fields to profiles
ALTER TABLE public.profiles ADD COLUMN seller_rating numeric DEFAULT 0 CHECK (seller_rating >= 0 AND seller_rating <= 5);
ALTER TABLE public.profiles ADD COLUMN total_reviews integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN verified_seller boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_products_sold ON public.products(sold);
CREATE INDEX idx_profiles_rating ON public.profiles(seller_rating);