import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Seller dashboard - manage products (add, edit, delete)
const SellerDashboard = () => {
  const { user } = useAuth();
  const { getProductsBySeller, addProduct, updateProduct, deleteProduct } = useProducts();
  const navigate = useNavigate();

  // Get seller's products
  const myProducts = user ? getProductsBySeller(user.id) : [];

  // State for add/edit product dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'Good' as 'New' | 'Like New' | 'Good' | 'Fair',
    image: '',
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open dialog for adding new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      condition: 'Good',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    });
    setDialogOpen(true);
  };

  // Open dialog for editing existing product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      condition: product.condition,
      image: product.image,
    });
    setDialogOpen(true);
  };

  // Handle form submission (add or update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (editingProduct) {
      // Update existing product
      updateProduct(editingProduct.id, {
        ...formData,
        price: parseFloat(formData.price),
      });
      toast.success('Product updated successfully');
    } else {
      // Add new product
      addProduct({
        ...formData,
        price: parseFloat(formData.price),
        sellerId: user.id,
        sellerName: user.name,
      });
      toast.success('Product added successfully');
    }

    setDialogOpen(false);
  };

  // Handle product deletion
  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      toast.success('Product deleted');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your product listings</p>
          </div>

          {/* Add product button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" onClick={handleAddProduct}>
                <Plus className="h-5 w-5" />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update your product details' : 'Fill in the details to list your product'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g., Books, Electronics"
                      required
                    />
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">Optional: Provide an image URL for your product</p>
                </div>

                {/* Submit button */}
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products list */}
        {myProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {myProducts.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                  {product.status === 'blocked' && (
                    <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                      <span className="text-white font-semibold">BLOCKED BY ADMIN</span>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="font-display line-clamp-1">{product.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                  <p className="text-2xl font-display font-bold text-primary">
                    ₹{product.price.toLocaleString()}
                  </p>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-xl text-muted-foreground mb-4">You haven't listed any products yet</p>
            <Button size="lg" onClick={handleAddProduct} className="gap-2">
              <Plus className="h-5 w-5" />
              Add Your First Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
