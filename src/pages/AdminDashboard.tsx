import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Users, Package, MessageSquare, LogOut, Ban, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Admin dashboard - manage users, products, and view feedback
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { products, updateProduct, deleteProduct } = useProducts();
  const { feedbacks, updateFeedbackStatus, deleteFeedback } = useFeedback();
  const [users, setUsers] = useState<any[]>([]);

  // Check if admin is logged in
  useEffect(() => {
    const isAdmin = localStorage.getItem('adminSession');
    if (!isAdmin) {
      toast.error('Unauthorized access');
      navigate('/admin-login');
    }
  }, [navigate]);

  // Load users from localStorage
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  }, []);

  // Handle admin logout
  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Block/unblock user
  const handleToggleUserBlock = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, blocked: !user.blocked } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('User status updated');
  };

  // Block/unblock product
  const handleToggleProductBlock = (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    updateProduct(productId, { status: newStatus });
    toast.success(newStatus === 'blocked' ? 'Product blocked' : 'Product unblocked');
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      deleteProduct(productId);
      toast.success('Product deleted');
    }
  };

  // Update feedback status
  const handleUpdateFeedbackStatus = (feedbackId: string, status: any) => {
    updateFeedbackStatus(feedbackId, status);
    toast.success('Feedback status updated');
  };

  // Delete feedback
  const handleDeleteFeedback = (feedbackId: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      deleteFeedback(feedbackId);
      toast.success('Feedback deleted');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-secondary" />
              <div>
                <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">ShareSpace Management Portal</p>
              </div>
            </div>
            
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedbacks.filter(f => f.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Users tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {users.map(user => (
                      <Card key={user.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{user.name}</h3>
                              {user.blocked && (
                                <Badge variant="destructive">Blocked</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p>Email: {user.email}</p>
                              <p>Phone: {user.phone}</p>
                              <p>College: {user.college}</p>
                              <p>Department: {user.department}</p>
                              <p>Roll: {user.rollNumber}</p>
                            </div>
                          </div>
                          <Button
                            variant={user.blocked ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => handleToggleUserBlock(user.id)}
                            className="gap-2"
                          >
                            {user.blocked ? (
                              <><Check className="h-4 w-4" /> Unblock</>
                            ) : (
                              <><Ban className="h-4 w-4" /> Block</>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {products.map(product => (
                      <Card key={product.id} className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{product.title}</h3>
                              {product.status === 'blocked' && (
                                <Badge variant="destructive">Blocked</Badge>
                              )}
                              <Badge variant="outline">{product.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-bold text-primary">₹{product.price}</span>
                              <span className="text-muted-foreground">by {product.sellerName}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant={product.status === 'blocked' ? "outline" : "destructive"}
                              size="sm"
                              onClick={() => handleToggleProductBlock(product.id, product.status)}
                            >
                              {product.status === 'blocked' ? 'Unblock' : 'Block'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>User Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {feedbacks.map(feedback => (
                      <Card key={feedback.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{feedback.subject}</h3>
                              <Badge variant="outline">{feedback.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              From: {feedback.userName} ({feedback.userEmail})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(feedback.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              feedback.status === 'pending' ? 'default' :
                              feedback.status === 'reviewed' ? 'secondary' : 'outline'
                            }
                          >
                            {feedback.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-4">{feedback.message}</p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateFeedbackStatus(feedback.id, 'reviewed')}
                          >
                            Mark Reviewed
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateFeedbackStatus(feedback.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {feedbacks.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No feedback submitted yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
