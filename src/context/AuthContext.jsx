import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK LOGIN FEATURE FOR TESTING WITHOUT DATABASE
  const loginMockUser = () => {
    setUser({ email: 'test@example.com', user_metadata: { fullName: 'Test Golfer' } });
  };

  const logoutMockUser = () => {
    setUser(null);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase is not configured. Running in Mock Auth Mode.");
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginMockUser, logoutMockUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

