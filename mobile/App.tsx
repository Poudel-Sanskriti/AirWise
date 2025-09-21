import React from 'react';
import MainNavigator from './src/components/MainNavigator';
import { AuthProvider } from "./src/contexts/auth-context";

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}
// Wrap the app with AuthProvider to provide authentication context