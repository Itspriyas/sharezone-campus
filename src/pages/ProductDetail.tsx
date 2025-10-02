import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

// Product detail page - shows full information about a single product
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const { user } = useAuth();
  const { createConversation } = useChat();

  // Get product data
  const product = getProductById(id || '');

  // Handle chat button click
  const handleChat = () => {
    if (!user) {
      toast.error('Please login to chat with the seller');
      return;
    }

    if (product && product.sellerId === user.id) {
      toast.error("You can't chat with yourself");
      return;
    }

    if (product) {
      const conversationId = createConversation(
        product.sellerId,
        product.sellerName,
        product.id,
        product.title
      );
      
      navigate(`/chat?conversation=${conversationId}`);
      toast.success('Chat started with seller');
    }
  };

  // If product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/browse')}>
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/browse')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Product image */}
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge className="bg-background/90 backdrop-blur">
                {product.condition}
              </Badge>
            </div>
          </div>

          {/* Product details */}
          <div className="space-y-6">
            {/* Title and category */}
            <div>
              <Badge variant="outline" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-display font-bold mb-2">
                {product.title}
              </h1>
              <p className="text-3xl font-display font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </p>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-display font-semibold text-lg mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {/* Product details */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h2 className="font-display font-semibold text-lg mb-4">Product Details</h2>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed on</span>
                  <span className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Seller info */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-display font-semibold text-lg mb-4">Seller Information</h2>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{product.sellerName}</p>
                    <p className="text-sm text-muted-foreground">Campus Seller</p>
                  </div>
                </div>

                {/* Chat button */}
                {user?.id !== product.sellerId && (
                  <Button
                    onClick={handleChat}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat with Seller
                  </Button>
                )}

                {user?.id === product.sellerId && (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    This is your listing
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
