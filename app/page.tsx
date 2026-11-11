'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { AppProvider, useApp } from '@/components/AppProvider';
import Dashboard from '@/components/Dashboard';
import Onboarding from '@/components/Onboarding';
import { Skeleton } from '@/components/ui';
import WelcomeScreen from '@/components/WelcomeScreen';
import { screenFade } from '@/lib/motion';

/** Page-shaped placeholder shown while saved settings load. */
function LoadingScreen() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <span className="sr-only" role="status">Loading Agro Cosmic Weave… / লোড হচ্ছে…</span>
      <div>
        <div className="border-b border-sky-600/10 pl-[4.25rem] pr-4 lg:pr-10 py-3 flex items-center justify-between gap-3">
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
  const { ready, user, entered, onboarded } = useApp();

  // Every visit starts on the welcome screen, after saved settings have loaded.
  const screen =
    !ready ? 'loading'
    : !user || !entered ? 'welcome'
    : !onboarded ? 'onboarding'
    : 'dashboard';

  // Screens crossfade: the old one fades out before the new one fades in.
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={screen} variants={screenFade} initial="hidden" animate="show" exit="exit">
        {screen === 'loading' && <LoadingScreen />}
        {screen === 'welcome' && <WelcomeScreen />}
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
