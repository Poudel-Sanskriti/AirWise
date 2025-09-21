import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';

// Types
interface AuthContextType {
    user: any;
    signInWithGoogle: () => Promise<void>;
    signOut: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    signInWithGoogle: async () => { },
    signOut: () => { },
    loading: false,
});

// Auth0 / OAuth configuration (keep outside hooks, but discovery hook must be inside component)
const auth0Domain = 'dev-8xiua4wcszw332oo.us.auth0.com';

// NOTE: In a real app these should be stored securely (env or remote config)
const clientId = 'ewQ7IcT10bcxSvM0ZBbep6vxAS4QY5uP';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Run discovery hook INSIDE component to avoid invalid hook call
    const discovery = AuthSession.useAutoDiscovery(`https://${auth0Domain}`);

    // Build redirect with proxy for Expo Go/dev
    const redirectUri = AuthSession.makeRedirectUri(); // removed useProxy option (not in types)

    // Request configuration (using Authorization Code w/ PKCE if supported)
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId,
            redirectUri,
            scopes: ['openid', 'profile', 'email'],
            responseType: AuthSession.ResponseType.Token, // using implicit/token for simplicity here
            extraParams: {
                connection: 'google-oauth2',
                audience: `https://${auth0Domain}/userinfo`,
            },
        },
        discovery
    );

    useEffect(() => {
        const loadUserFromResponse = async () => {
            if (response?.type === 'success' && response.params.access_token) {
                try {
                    const res = await fetch(`https://${auth0Domain}/userinfo`, {
                        headers: { Authorization: `Bearer ${response.params.access_token}` },
                    });
                    const userInfo = await res.json();
                    setUser(userInfo);
                } catch (e) {
                    console.warn('Failed fetching user info', e);
                }
            }
        };
        loadUserFromResponse();
    }, [response]);

    const signInWithGoogle = async () => {
        if (!request) return;
        setLoading(true);
        try {
            await promptAsync(); // removed useProxy option
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
