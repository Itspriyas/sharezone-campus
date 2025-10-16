import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  college: string;
  department: string;
  rollNumber: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .eq('id', userId)
      .single();
    
    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        phone: profile.phone || '',
        college: '',
        department: '',
        rollNumber: '',
        isAdmin: profile.user_roles?.some((r: any) => r.role === 'admin') || false,
      });
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.name,
            phone: userData.phone,
          },
        },
      });

      if (error) return { success: false, error: error.message };

      // Send welcome email
      if (data.user) {
        try {
          await supabase.functions.invoke('send-auth-email', {
            body: {
              email: userData.email,
              type: 'registration',
              name: userData.name,
            },
          });
        } catch (error) {
          console.error('Failed to send welcome email:', error);
        }
      }

      toast.success('Registration successful!');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, error: error.message };

      // Send login notification email
      if (data.user) {
        try {
          await supabase.functions.invoke('send-auth-email', {
            body: {
              email: email,
              type: 'login',
              name: user?.name || email,
            },
          });
        } catch (error) {
          console.error('Failed to send login email:', error);
        }
      }

      toast.success('Login successful!');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
