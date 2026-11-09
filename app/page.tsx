'use client';

import { AppProvider, useApp } from '@/components/AppProvider';
import Dashboard from '@/components/Dashboard';
import LoginScreen, { NewPasswordScreen } from '@/components/LoginScreen';
import Onboarding from '@/components/Onboarding';
import { Skeleton } from '@/components/ui';

/** Page-shaped placeholder shown while saved settings load. */
function LoadingScreen() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <span className="sr-only" role="status">Loading Field Shift… / লোড হচ্ছে…</span>
      <div className="glass-bar border-b border-sky-500/15 px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 pl-12">
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28 !rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 !rounded-4xl" />
          <Skeleton className="h-96 !rounded-4xl hidden lg:block" />
        </div>
      </div>
    </div>
  );
}

function Root() {
  const { ready, user, onboarded, passwordRecovery } = useApp();

  // Wait for saved settings and the session to load so a signed-in user doesn't see the login screen flash.
  if (!ready) return <LoadingScreen />;
  if (passwordRecovery) return <NewPasswordScreen />;
  if (!user) return <LoginScreen />;
  if (!onboarded && user.role !== 'admin') return <Onboarding />;
  return <Dashboard />;
}

export default function Page() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
