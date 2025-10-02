import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Feedback interface
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
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>) => void;
  updateFeedbackStatus: (id: string, status: Feedback['status']) => void;
  deleteFeedback: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Hook to use feedback throughout the app
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

// Provider component
export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Load feedbacks from localStorage
  useEffect(() => {
    const storedFeedbacks = localStorage.getItem('feedbacks');
    if (storedFeedbacks) {
      setFeedbacks(JSON.parse(storedFeedbacks));
    }
  }, []);

  // Submit new feedback
  const submitFeedback = (feedbackData: Omit<Feedback, 'id' | 'timestamp' | 'status'>) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    const updatedFeedbacks = [...feedbacks, newFeedback];
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
  };

  // Update feedback status (admin only)
  const updateFeedbackStatus = (id: string, status: Feedback['status']) => {
    const updatedFeedbacks = feedbacks.map(feedback =>
      feedback.id === id ? { ...feedback, status } : feedback
    );
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
  };

  // Delete feedback (admin only)
  const deleteFeedback = (id: string) => {
    const updatedFeedbacks = feedbacks.filter(feedback => feedback.id !== id);
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
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
