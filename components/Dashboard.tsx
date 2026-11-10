'use client';

import React from 'react';
import { useApp } from './AppProvider';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import RotationTab from './tabs/RotationTab';
import WhatIfTab from './tabs/WhatIfTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import NasaTab from './tabs/NasaTab';
import FarmProfileTab from './tabs/FarmProfileTab';
import AccountTab from './tabs/AccountTab';
import SettingsTab from './tabs/SettingsTab';
import AdminTab from './tabs/AdminTab';
import ReportTab from './tabs/ReportTab';
import type { TabId } from '@/lib/types';

const TABS: Record<TabId, React.ComponentType> = {
  rotation: RotationTab,
  whatif: WhatIfTab,
  analytics: AnalyticsTab,
  nasa: NasaTab,
  farm_profile: FarmProfileTab,
  user_account: AccountTab,
  settings: SettingsTab,
  admin: AdminTab,
  report: ReportTab,
};

export default function Dashboard() {
  const { t, activeTab } = useApp();
  const Tab = TABS[activeTab] ?? RotationTab;

  return (
    <div className="min-h-screen flex font-sans antialiased text-slate-900 dark:text-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-16 lg:focus:left-[19rem] focus:z-[90] focus:px-3 focus:py-2 focus:rounded-full focus:bg-sky-600 focus:text-white">
        {t('Skip to content', 'মূল অংশে যান')}
      </a>
      <Sidebar />

      <div className="fs-content flex-1 flex flex-col min-w-0 lg:ml-72">
        <TopBar />

        <main id="main" className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 space-y-6 max-w-[1240px] w-full mx-auto flex-1">
          {/* The admin panel keeps its original look (see .fs-classic in globals.css). */}
          {activeTab === 'admin' ? (
            <div className="fs-classic space-y-6"><Tab key={activeTab} /></div>
          ) : (
            <Tab key={activeTab} />
          )}
        </main>

        <footer className="no-print border-t border-sky-600/10 py-6 px-4 sm:px-6 lg:px-10 mt-auto mb-[calc(72px+env(safe-area-inset-bottom))] lg:mb-0 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div>
              <span className="fs-display text-sm text-sky-700 dark:text-sky-300">Field Shift</span> · {t('Developed by SPIDERX', 'ডেভেলপড বাই SPIDERX')}
            </div>
            <div>
              {t('Climate data: NASA POWER · Built for NASA Space Apps Challenge', 'জলবায়ু তথ্য: নাসা POWER · নাসা স্পেস অ্যাপস চ্যালেঞ্জের জন্য তৈরি')}
            </div>
          </div>
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
