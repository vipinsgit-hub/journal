import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Profile } from '../../types/profile';
import { profileService } from '../profiles/profileService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (targetUser: User | { id: string; email?: string; user_metadata?: any }) => {
    try {
      const p = await profileService.getProfile(
        targetUser.id,
        targetUser.email,
        targetUser.user_metadata?.display_name
      );
      if (p) {
        setProfile(p);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // In demo/unconfigured mode, load local demo profile
      fetchProfile({ id: 'demo-user', email: 'demo@journal.local', user_metadata: { display_name: 'Demo Trader' } });
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        fetchProfile({ id: 'demo-user', email: 'demo@journal.local', user_metadata: { display_name: 'Demo Trader' } });
      }
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        fetchProfile({ id: 'demo-user', email: 'demo@journal.local', user_metadata: { display_name: 'Demo Trader' } });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    } else {
      await fetchProfile({ id: 'demo-user', email: 'demo@journal.local', user_metadata: { display_name: 'Demo Trader' } });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
