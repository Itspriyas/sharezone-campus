import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageSquare, User, LogOut, LayoutDashboard, MessageCircle } from 'lucide-react';

// Navigation bar component - shows at the top of every page when logged in
const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If not logged in, don't show navigation
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <Link to="/browse" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-semibold text-foreground">ShareSpace</span>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/browse')}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/seller-dashboard')}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Sell
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chat')}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Messages
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/feedback')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </Button>

            {/* User menu */}
            <div className="ml-2 flex items-center gap-2 border-l pl-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                {user?.name}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
