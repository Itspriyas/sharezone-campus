import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

// Feedback page - users can submit feedback (visible only to admin)
const Feedback = () => {
  const { user } = useAuth();
  const { submitFeedback } = useFeedback();
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'Platform' as 'Product' | 'Faculty' | 'Platform' | 'Other',
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit feedback');
      return;
    }

    // Submit feedback
    submitFeedback({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject: formData.subject,
      message: formData.message,
      category: formData.category,
    });

    // Reset form
    setFormData({
      subject: '',
      message: '',
      category: 'Platform',
    });

    toast.success('Feedback submitted successfully! The admin will review it.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2">Share Your Feedback</h1>
            <p className="text-muted-foreground">
              Your feedback helps us improve the ShareSpace experience
            </p>
          </div>

          {/* Feedback form */}
          <Card className="border-2 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Submit Feedback</CardTitle>
              <CardDescription>
                All feedback is reviewed by the admin team. This is confidential and will not be shared with sellers.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Product">Product Related</SelectItem>
                      <SelectItem value="Faculty">Faculty Related</SelectItem>
                      <SelectItem value="Platform">Platform Improvement</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Brief description of your feedback"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Your Feedback *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please share your detailed feedback here..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={8}
                    required
                  />
                </div>

                {/* Info box */}
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Privacy Notice:</strong> Your feedback will only be visible to the admin team. 
                    We take your input seriously and use it to improve our platform and address any concerns.
                  </p>
                </div>

                {/* Submit button */}
                <Button type="submit" size="lg" className="w-full gap-2">
                  <Send className="h-5 w-5" />
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional info cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Card className="p-4">
              <h3 className="font-display font-semibold mb-2">Product Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Share concerns about specific products or sellers on the platform
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-display font-semibold mb-2">Platform Improvements</h3>
              <p className="text-sm text-muted-foreground">
                Suggest new features or improvements to enhance your experience
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
