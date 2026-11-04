'use client';

import React from 'react';
import { useApp } from './AppProvider';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
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
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-16 focus:z-[90] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-sky-600 focus:text-white">
        {t('Skip to content', 'মূল অংশে যান')}
      </a>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main id="main" className="p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
          <Tab key={activeTab} />
        </main>

        <footer className="no-print glass-subtle border-t border-sky-500/10 py-6 px-4 lg:px-8 mt-auto text-xs text-slate-600 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Field Shift</span> · {t('Developed by SPIDERX', 'ডেভেলপড বাই SPIDERX')}
            </div>
            <div className="text-[11px]">
              {t('Climate data: NASA POWER · Built for NASA Space Apps Challenge', 'জলবায়ু তথ্য: নাসা POWER · নাসা স্পেস অ্যাপস চ্যালেঞ্জের জন্য তৈরি')}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
