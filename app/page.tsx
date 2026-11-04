'use client';

import { AppProvider, useApp } from '@/components/AppProvider';
import Dashboard from '@/components/Dashboard';
import LoginScreen from '@/components/LoginScreen';

function Root() {
  const { ready, user } = useApp();

  // Wait for saved settings to load so a signed-in user doesn't see the login screen flash.
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-busy="true">
        <img src="/logo.png" alt="Field Shift" className="h-16 w-16 rounded-full animate-pulse" />
      </div>
    );
  }
  return user ? <Dashboard /> : <LoginScreen />;
}

export default function Page() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
