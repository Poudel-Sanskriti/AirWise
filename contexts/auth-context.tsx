// contexts/auth-context.tsx
import React, { createContext, useContext, useState } from "react";
import * as AuthSession from "expo-auth-session";

type AuthContextType = {
    user: any;
    signInWithGoogle: () => Promise<void>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    signInWithGoogle: async () => { },
    signOut: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);

    const signInWithGoogle = async () => {
        try {
            const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

            const authUrl =
                `https://YOUR_AUTH0_DOMAIN/authorize` +
                `?client_id=YOUR_AUTH0_CLIENT_ID` +
                `&response_type=token` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&scope=openid profile email` +
                `&connection=google-oauth2`;

            const result = await AuthSession.startAsync({
                authUrl,
                returnUrl: redirectUri,
            });

            if (result.type === "success" && result.params.access_token) {
                // Fetch user profile from Auth0
                const userInfoResponse = await fetch(
                    `https://${"YOUR_AUTH0_DOMAIN"}/userinfo`,
                    {
                        headers: { Authorization: `Bearer ${result.params.access_token}` },
                    }
                );

                const userInfo = await userInfoResponse.json();
                setUser(userInfo);
            }
        } catch (err) {
            console.error("Google login error:", err);
            throw err;
        }
    };

    const signOut = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
