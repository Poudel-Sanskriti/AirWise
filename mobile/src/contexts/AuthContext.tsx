import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface User {
  id?: string;
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  healthProfile?: {
    conditions: string[];
    ageGroup: 'child' | 'adult' | 'senior';
    lifestyle: string[];
    sensitivities: string[];
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signInWithGoogle: async () => {},
  signOut: () => {},
  updateUserProfile: () => {},
});

// Auth0 configuration
const auth0Domain = 'dev-xjzm4o02mg4s2rha.us.auth0.com';
const clientId = 'm0sdmAUChfCPnqPshRieHN3SsQmIjaKf';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto discovery for Auth0
  const discovery = AuthSession.useAutoDiscovery(`https://${auth0Domain}`);

  // Build redirect URI
  const redirectUri = AuthSession.makeRedirectUri();

  // Debug: Log the redirect URI being used
  console.log('🔍 Debug - Redirect URI:', redirectUri);

  // Auth request configuration
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      extraParams: {
        connection: 'google-oauth2',
        audience: `https://${auth0Domain}/userinfo`,
      },
    },
    discovery
  );

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Handle auth response
  useEffect(() => {
    if (response?.type === 'success' && response.params.access_token) {
      handleAuthSuccess(response.params.access_token);
    }
  }, [response]);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  };

  const handleAuthSuccess = async (accessToken: string) => {
    try {
      setLoading(true);

      // Get user info from Auth0
      const userInfoResponse = await fetch(`https://${auth0Domain}/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const auth0User = await userInfoResponse.json();

      // Create user object
      const newUser: User = {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
        picture: auth0User.picture,
      };

      // TODO: Send to backend API to create/update user in MongoDB
      await createOrUpdateUserInBackend(newUser);

      // Save to storage and state
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Error handling auth success:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateUserInBackend = async (userData: User) => {
    try {
      // Automatically detect development server IP
      const backendUrl = __DEV__
        ? `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:3001`
        : 'https://your-production-api.com';

      console.log('🔗 Backend URL:', backendUrl);

      const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User created/updated in backend:', result.data);
        return result.data;
      } else {
        console.warn('Failed to create user in backend:', response.status);
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      // Continue without backend for now
    }
  };

  const signInWithGoogle = async () => {
    if (!request) return;
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Auth error:', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      // TODO: Update in backend as well
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOut,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);