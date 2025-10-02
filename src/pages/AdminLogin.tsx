import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Admin login page - separate login for administrators
const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple admin credentials (in real app, this would be more secure)
    // Admin credentials: username = "admin", password = "admin123"
    if (formData.username === 'admin' && formData.password === 'admin123') {
      // Store admin session
      localStorage.setItem('adminSession', 'true');
      toast.success('Welcome, Admin!');
      navigate('/admin-dashboard');
    } else {
      toast.error('Invalid admin credentials');
    }

    setLoading(false);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-primary/10 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
            <Shield className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Secure access for administrators</p>
        </div>

        {/* Login card */}
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Admin Sign In</CardTitle>
            <CardDescription>Enter your admin credentials to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-2">
                <Label htmlFor="username">Admin Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="admin"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Demo credentials info */}
              <div className="bg-muted/50 border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Demo Credentials:</strong><br />
                  Username: admin<br />
                  Password: admin123
                </p>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
                variant="secondary"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In as Admin
                  </>
                )}
              </Button>
            </form>

            {/* Back to user login */}
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to User Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
