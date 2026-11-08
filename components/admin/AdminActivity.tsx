'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, Ban, Download, KeyRound, LogIn, LogOut, Pencil, ShieldCheck, ShieldOff, Trash2, UserCheck, UserX,
  type LucideIcon,
} from 'lucide-react';
import type { AdminAction, AdminLogEntry, Lang } from '@/lib/types';
import { useApp } from '../AppProvider';
import { ACTION_LABEL, DAY_MS, FootNote, btnDanger, focusRing, formatClock, formatDate, panel } from './shared';

type Group = 'all' | 'access' | 'users' | 'security';

const GROUPS: Record<Exclude<Group, 'all'>, AdminAction[]> = {
  access: ['login', 'login_failed', 'logout'],
  users: ['edit_user', 'block_user', 'unblock_user', 'delete_user', 'make_admin', 'remove_admin', 'export_users'],
  security: ['login_failed', 'change_password', 'clear_log'],
};

/** Icon and colour for each kind of event: amber for warnings, red for removals, ink for security. */
const LOOK: Record<AdminAction, { icon: LucideIcon; tone: string }> = {
  login:           { icon: LogIn,        tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
  logout:          { icon: LogOut,       tone: 'bg-slate-400/15 text-slate-600 dark:text-slate-300' },
  login_failed:    { icon: AlertTriangle, tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  edit_user:       { icon: Pencil,       tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
  block_user:      { icon: Ban,          tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  unblock_user:    { icon: UserCheck,    tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  delete_user:     { icon: UserX,        tone: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  make_admin:      { icon: ShieldCheck,  tone: 'bg-[var(--text-primary)] text-[var(--bg-surface)]' },
  remove_admin:    { icon: ShieldOff,    tone: 'bg-slate-400/15 text-slate-600 dark:text-slate-300' },
  change_password: { icon: KeyRound,     tone: 'bg-[var(--text-primary)] text-[var(--bg-surface)]' },
  export_users:    { icon: Download,     tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
  clear_log:       { icon: Trash2,       tone: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

const startOfDay = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };

function dayLabel(day: number, lang: Lang, t: (en: string, bn: string) => string) {
  const today = startOfDay(Date.now());
  if (day === today) return t('Today', 'আজ');
  if (day === today - DAY_MS) return t('Yesterday', 'গতকাল');
  return formatDate(day, lang);
}

export default function AdminActivity() {
  const { t, n, lang, adminLog, admin } = useApp();
  const [group, setGroup] = useState<Group>('all');

  const shown = group === 'all' ? adminLog : adminLog.filter(e => GROUPS[group].includes(e.action));
  const failed = adminLog.filter(e => e.action === 'login_failed' && Date.now() - e.at < DAY_MS).length;

  // Group entries by calendar day, keeping the log's newest-first order.
  const days = useMemo(() => {
    const out: { day: number; entries: AdminLogEntry[] }[] = [];
    for (const e of shown) {
      const day = startOfDay(e.at);
      const last = out[out.length - 1];
      if (last && last.day === day) last.entries.push(e);
      else out.push({ day, entries: [e] });
    }
    return out;
  }, [shown]);

  const clear = () => {
    if (window.confirm(t('Clear the whole activity log? This cannot be undone.', 'পুরো কার্যক্রম লগ মুছবেন? এটি আর ফেরানো যাবে না।'))) {
      admin.clearLog();
    }
  };

  const groups: { id: Group; label: string }[] = [
    { id: 'all', label: t('All', 'সব') },
    { id: 'access', label: t('Sign-ins', 'সাইন-ইন') },
    { id: 'users', label: t('User changes', 'ব্যবহারকারী পরিবর্তন') },
    { id: 'security', label: t('Security', 'নিরাপত্তা') },
  ];

  return (
    <div className="space-y-5">
      {failed > 0 && (
        <div role="status" className="flex items-start gap-3 rounded-2xl p-4 bg-amber-500/10 border border-amber-500/40 text-sm text-amber-900 dark:text-amber-100">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          {t(`${failed} failed admin sign-in attempt(s) in the last 24 hours.`, `গত ২৪ ঘণ্টায় ${n(failed)}টি ব্যর্থ অ্যাডমিন সাইন-ইন চেষ্টা।`)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div role="radiogroup" aria-label={t('Filter activity', 'কার্যক্রম ছাঁকুন')}
          className="grid grid-cols-2 sm:flex gap-1 p-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]">
          {groups.map(g => {
            const on = group === g.id;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setGroup(g.id)}
                className={`min-h-[40px] px-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${focusRing} ${
                  on ? 'bg-[var(--bg-surface)] shadow-sm text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={clear} disabled={adminLog.length === 0} className={btnDanger}>
          <Trash2 className="h-4 w-4" aria-hidden />{t('Clear log', 'লগ মুছুন')}
        </button>
      </div>

      {days.length === 0 ? (
        <div className={`${panel} p-10 text-center`}>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('No activity yet.', 'এখনো কোনো কার্যক্রম নেই।')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map(({ day, entries }) => (
            <section key={day} className="space-y-2" aria-label={dayLabel(day, lang, t)}>
              <h3 className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {dayLabel(day, lang, t)}
                <span className="tabular-nums font-normal">{n(entries.length)}</span>
                <span className="flex-1 h-px bg-[var(--border-soft)]" aria-hidden />
              </h3>
              <ol className={`${panel} divide-y divide-[var(--border-soft)]`}>
                {entries.map(e => {
                  const { icon: Icon, tone } = LOOK[e.action];
                  return (
                    <li key={e.id} className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[var(--accent-soft)]">
                      <span className={`h-9 w-9 shrink-0 rounded-full grid place-items-center ${tone}`}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="truncate">
                          <span className={`font-semibold ${e.action === 'login_failed' ? 'text-amber-700 dark:text-amber-300' : e.action === 'delete_user' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-50'}`}>
                            {t(...ACTION_LABEL[e.action])}
                          </span>
                          {e.target && <span className="text-slate-600 dark:text-slate-400"> · {e.target}</span>}
                        </div>
                        <div className="text-xs truncate text-slate-500 dark:text-slate-400">{t('by', 'করেছেন')} {e.actor}</div>
                      </div>
                      <time dateTime={new Date(e.at).toISOString()} className="text-xs tabular-nums whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {formatClock(e.at, lang)}
                      </time>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}

      <FootNote>
        {t(`Keeps the latest 500 entries. Showing ${shown.length}.`, `সর্বশেষ ৫০০টি এন্ট্রি রাখা হয়। দেখানো হচ্ছে ${n(shown.length)}টি।`)}
      </FootNote>
    </div>
  );
}
