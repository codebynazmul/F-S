'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { AdminAction } from '@/lib/types';
import { useApp } from '../AppProvider';
import { SubCard, ghostBtn, inputClass } from '../ui';
import { ACTION_LABEL, formatTime } from './shared';

type Group = 'all' | 'access' | 'users' | 'security';

const GROUPS: Record<Exclude<Group, 'all'>, AdminAction[]> = {
  access: ['login', 'login_failed', 'logout'],
  users: ['edit_user', 'block_user', 'unblock_user', 'delete_user', 'make_admin', 'remove_admin', 'export_users'],
  security: ['login_failed', 'change_password', 'clear_log'],
};

export default function AdminActivity() {
  const { t, n, lang, adminLog, admin } = useApp();
  const [group, setGroup] = useState<Group>('all');

  const shown = group === 'all' ? adminLog : adminLog.filter(e => GROUPS[group].includes(e.action));
  const failed = adminLog.filter(e => e.action === 'login_failed' && Date.now() - e.at < 24 * 60 * 60 * 1000).length;

  const clear = () => {
    if (window.confirm(t('Clear the whole activity log? This cannot be undone.', 'পুরো কার্যক্রম লগ মুছবেন? এটি আর ফেরানো যাবে না।'))) {
      admin.clearLog();
    }
  };

  return (
    <div className="space-y-4">
      {failed > 0 && (
        <div role="status" className="text-sm flex items-start gap-2 rounded-xl px-3 py-2.5 bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          {t(`${failed} failed admin sign-in attempt(s) in the last 24 hours.`, `গত ২৪ ঘণ্টায় ${failed}টি ব্যর্থ অ্যাডমিন সাইন-ইন চেষ্টা।`)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <select value={group} onChange={(e) => setGroup(e.target.value as Group)} aria-label={t('Filter activity', 'কার্যক্রম ছাঁকুন')} className={`${inputClass} sm:w-56`}>
          <option value="all">{t('All activity', 'সব কার্যক্রম')}</option>
          <option value="access">{t('Sign-ins and sign-outs', 'সাইন-ইন ও সাইন-আউট')}</option>
          <option value="users">{t('User changes', 'ব্যবহারকারী পরিবর্তন')}</option>
          <option value="security">{t('Security', 'নিরাপত্তা')}</option>
        </select>
        <button type="button" onClick={clear} disabled={adminLog.length === 0} className={`${ghostBtn} !text-red-600 dark:!text-red-400 disabled:opacity-50`}>
          <Trash2 className="h-4 w-4" />{t('Clear log', 'লগ মুছুন')}
        </button>
      </div>

      <SubCard className="p-5 rounded-2xl">
        {shown.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('No activity yet.', 'এখনো কোনো কার্যক্রম নেই।')}</p>
        ) : (
          <ol className="divide-y divide-sky-500/10">
            {shown.map(e => (
              <li key={e.id} className="py-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
                <div className="min-w-0">
                  <span className={`font-bold ${e.action === 'login_failed' ? 'text-amber-700 dark:text-amber-300' : e.action === 'delete_user' ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {t(...ACTION_LABEL[e.action])}
                  </span>
                  {e.target && <span className="text-slate-700 dark:text-slate-300 break-all"> · {e.target}</span>}
                  <div className="text-xs text-slate-600 dark:text-slate-400">{t('by', 'করেছেন')} {e.actor}</div>
                </div>
                <time dateTime={new Date(e.at).toISOString()} className="text-xs text-slate-600 dark:text-slate-400">{formatTime(e.at, lang)}</time>
              </li>
            ))}
          </ol>
        )}
      </SubCard>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {t(`Keeps the latest 500 entries. Showing ${shown.length}.`, `সর্বশেষ ৫০০টি এন্ট্রি রাখা হয়। দেখানো হচ্ছে ${n(shown.length)}টি।`)}
      </p>
    </div>
  );
}
