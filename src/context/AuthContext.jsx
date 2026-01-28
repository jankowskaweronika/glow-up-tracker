import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobierz profil użytkownika
  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  // Sprawdź sesję przy starcie
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Nasłuchuj zmian autentykacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Rejestracja
  const signUp = async (email, password, displayName = '') => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowany');
    }

    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  };

  // Logowanie
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowany');
    }

    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  };

  // Wylogowanie
  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowany');
    }

    setError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      throw error;
    }

    setUser(null);
    setProfile(null);
  };

  // Reset hasła
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowany');
    }

    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      throw error;
    }
  };

  // Aktualizacja hasła
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowany');
    }

    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      throw error;
    }
  };

  // Aktualizacja profilu
  const updateProfile = async (updates) => {
    if (!isSupabaseConfigured() || !user) {
      throw new Error('Musisz być zalogowany');
    }

    setError(null);

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      throw error;
    }

    setProfile(data);
    return data;
  };

  const value = {
    // Stan
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isConfigured: isSupabaseConfigured(),

    // Metody autentykacji
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,

    // Metody profilu
    updateProfile,
    fetchProfile,

    // Pomocnicze
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
