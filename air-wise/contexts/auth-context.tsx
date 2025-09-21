import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Use a custom scheme deep link so mobile does not try to return to localhost.
    const isExpoGo = Constants.appOwnership === 'expo';
    let redirectTo: string;
    if (isExpoGo) {
      // Use the Expo Auth Proxy which is stable for Expo Go sessions.
      const slug = Constants?.expoConfig?.slug ?? 'air-wise';
      const owner = (Constants as any)?.expoConfig?.owner ?? 'anonymous';
      redirectTo = `https://auth.expo.io/@${owner}/${slug}`;
    } else {
      // In dev/prod builds use the native scheme deep link.
      redirectTo = AuthSession.makeRedirectUri({
        scheme: 'airwise',
        path: 'auth/callback',
      });
    }
    console.log('🔑 [Auth] appOwnership:', Constants.appOwnership);
    console.log('🔑 [Auth] redirectTo computed:', redirectTo);

    // Request the OAuth URL without auto-redirecting (important on native)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (!data?.url) {
      console.warn('⚠️ [Auth] signInWithOAuth returned no URL');
      return;
    }
    console.log('🔗 [Auth] Provider authorization URL:', data.url);

    let handled = false;
    const handleUrl = async (url: string) => {
      if (handled) return;
      handled = true;
      console.log('📬 [Auth] Handling redirect URL:', url);
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(url);
      if (exchangeError) throw exchangeError;
      // auth state listener will update session/user
    };

    // Fallback listener: some Android versions don't return the URL in result
    const sub = Linking.addEventListener('url', async ({ url }) => {
      console.log('📡 [Auth] Linking event URL received:', url);
      await handleUrl(url);
    });

    try {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      console.log('🧭 [Auth] WebBrowser result:', result);
      if (result.type === 'success' && result.url) {
        await handleUrl(result.url);
      }
    } finally {
      sub.remove();
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

