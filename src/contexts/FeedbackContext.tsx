import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: 'Product' | 'Faculty' | 'Platform' | 'Other';
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

interface FeedbackContextType {
  feedbacks: Feedback[];
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateFeedbackStatus: (id: string, status: Feedback['status']) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const { user } = useAuth();

  const fetchFeedback = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        profiles!feedback_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return;
    }

    const formatted: Feedback[] = data.map((f: any) => ({
      id: f.id,
      userId: f.user_id,
      userName: f.profiles?.full_name || 'Unknown',
      userEmail: f.profiles?.email || '',
      subject: f.category,
      message: f.message,
      category: f.category,
      timestamp: f.created_at,
      status: f.status,
    }));

    setFeedbacks(formatted);
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const submitFeedback = async (feedbackData: Omit<Feedback, 'id' | 'timestamp' | 'status'>) => {
    if (!user) throw new Error('Must be logged in to submit feedback');

    const { error } = await supabase.from('feedback').insert({
      user_id: feedbackData.userId,
      message: feedbackData.message,
      category: feedbackData.category,
    });

    if (error) throw error;
    await fetchFeedback();
  };

  const updateFeedbackStatus = async (id: string, status: Feedback['status']) => {
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    await fetchFeedback();
  };

  const deleteFeedback = async (id: string) => {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchFeedback();
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedbacks,
        submitFeedback,
        updateFeedbackStatus,
        deleteFeedback,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};
