//AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../App';
import { Session, User } from '@supabase/supabase-js';
import { useWeb3 } from './Web3Context';
import toast from 'react-hot-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  linkWallet: (address: string) => Promise<void>;
  unlinkWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Profile {
  user_id: string;
  username: string;
  reputation: number;
  tokens_balance: number;
  wallet_address?: string | null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { connectWallet, disconnectWallet, walletAddress } = useWeb3();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error signing in');
      } else {
        toast.error('Error signing in');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: data.user.id, 
            username,
            reputation: 0,
            tokens_balance: 0
          }]);
          
        if (profileError) throw profileError;
      }
      
      toast.success('Account created successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error creating account');
      } else {
        toast.error('Error creating account');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setProfile(null);
      // Also disconnect wallet if connected
      if (walletAddress) {
        await disconnectWallet();
      }
      toast.success('Signed out successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error signing out');
      } else {
        toast.error('Error signing out');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const linkWallet = async (address: string) => {
    if (!user) {
      toast.error('You must be logged in to link a wallet');
      return;
    }

    try {
      setLoading(true);
      // Update the profile with wallet address
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: address })
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh profile
      fetchProfile(user.id);
      toast.success('Wallet linked successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error linking wallet');
      } else {
        toast.error('Error linking wallet');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const unlinkWallet = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Update the profile to remove wallet address
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: null })
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh profile
      fetchProfile(user.id);
      toast.success('Wallet unlinked successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error unlinking wallet');
      } else {
        toast.error('Error unlinking wallet');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    linkWallet,
    unlinkWallet
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};