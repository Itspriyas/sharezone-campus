import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Users, MessageCircle, Shield, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';

// Homepage - premium landing page with animations
const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect to browse page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/browse');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Premium Campus Marketplace
            </div>

            {/* Main heading */}
            <h1 className="mb-6 text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight">
              Buy & Sell with
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Your Campus Community
              </span>
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              ShareSpace connects students across campus to buy, sell, and trade textbooks, electronics, and more. Join your trusted academic marketplace today.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button
                size="lg"
                className="group gap-2 text-lg px-8 py-6"
                onClick={() => navigate('/register')}
              >
                Get Started
                <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose ShareSpace?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A sophisticated platform designed exclusively for campus communities
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-background border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Campus Community</h3>
              <p className="text-muted-foreground">
                Connect only with verified students from your college for safe, trustworthy transactions
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-background border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Instant Chat</h3>
              <p className="text-muted-foreground">
                Message sellers and buyers directly through our built-in chat system
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-background border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Admin-monitored platform with feedback system ensuring quality and trust
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">
                1000+
              </div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-display font-bold text-secondary mb-2">
                5000+
              </div>
              <div className="text-muted-foreground">Products Listed</div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl font-display font-bold text-accent mb-2">
                98%
              </div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Join Your Campus Marketplace?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start buying and selling with your fellow students today
            </p>
            <Button
              size="lg"
              className="gap-2 text-lg px-8 py-6"
              onClick={() => navigate('/register')}
            >
              <TrendingUp className="h-5 w-5" />
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 ShareSpace. A premium campus marketplace for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
