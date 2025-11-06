import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/contexts/ProductContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Star, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onChat?: () => void;
  showActions?: boolean;
}

// Product card component - displays a single product with hover effects
const ProductCard = ({ product, onChat, showActions = true }: ProductCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Product image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Status badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge
            className="bg-background/90 backdrop-blur"
            variant="secondary"
          >
            {product.condition}
          </Badge>
          {product.sold && (
            <Badge
              className="bg-destructive/90 backdrop-blur text-destructive-foreground"
            >
              Sold Out
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product title */}
        <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1">
          {product.title}
        </h3>

        {/* Product description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Category badge */}
        <Badge variant="outline" className="mb-2">
          {product.category}
        </Badge>

        {/* Seller info */}
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs text-muted-foreground">
            Sold by {product.sellerName}
          </p>
          {product.verifiedSeller && (
            <ShieldCheck className="h-3 w-3 text-primary" />
          )}
        </div>
        
        {/* Seller rating */}
        {product.sellerReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-xs font-medium">{product.sellerRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.sellerReviews})</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Price */}
        <div className="text-2xl font-display font-bold text-primary">
          ₹{product.price.toLocaleString()}
        </div>

        {/* Chat button */}
        {showActions && onChat && (
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onChat();
            }}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
