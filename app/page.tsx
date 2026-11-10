'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { AppProvider, useApp } from '@/components/AppProvider';
import Dashboard from '@/components/Dashboard';
import LoginScreen, { NewPasswordScreen } from '@/components/LoginScreen';
import Onboarding from '@/components/Onboarding';
import { Skeleton } from '@/components/ui';
import { screenFade } from '@/lib/motion';

/** Page-shaped placeholder shown while saved settings load. */
function LoadingScreen() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <span className="sr-only" role="status">Loading Field Shift… / লোড হচ্ছে…</span>
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-72 border-r border-sky-600/10 flex-col gap-3 p-5">
        <Skeleton className="h-10 w-40" />
        {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-full" />)}
      </div>
      <div className="lg:ml-72">
        <div className="border-b border-sky-600/10 pl-[4.25rem] pr-4 lg:px-10 py-3 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-11 w-40" />
        </div>
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-[1240px] mx-auto space-y-6">
          <Skeleton className="h-24 w-full max-w-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28 !rounded-[var(--radius-card)]" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 !rounded-[var(--radius-card)]" />
            <Skeleton className="h-96 !rounded-[var(--radius-card)] hidden lg:block" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Root() {
  const { ready, user, onboarded, passwordRecovery } = useApp();

  // Wait for saved settings and the session to load so a signed-in user doesn't see the login screen flash.
  const screen =
    !ready ? 'loading'
    : passwordRecovery ? 'recovery'
    : !user ? 'login'
    : !onboarded && user.role !== 'admin' ? 'onboarding'
    : 'dashboard';

  // Screens crossfade: the old one fades out before the new one fades in.
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={screen} variants={screenFade} initial="hidden" animate="show" exit="exit">
        {screen === 'loading' && <LoadingScreen />}
        {screen === 'recovery' && <NewPasswordScreen />}
        {screen === 'login' && <LoginScreen />}
        {screen === 'onboarding' && <Onboarding />}
        {screen === 'dashboard' && <Dashboard />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Page() {
  return (
    <AppProvider>
      {/* People who ask for reduced motion get fades only: no movement or scaling. */}
      <MotionConfig reducedMotion="user">
        <Root />
      </MotionConfig>
    </AppProvider>
  );
}
