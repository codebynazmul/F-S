'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';
import { useApp } from '../AppProvider';
import { BlockHead, DAY_MS, FootNote, btnPrimary, fieldClass, formatTime, panel, relativeTime } from './shared';

export default function AdminSecurity() {
  const { t, n, lang, user, admin, adminLog, usingDefaultAdminPassword } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const lastChange = adminLog.find(e => e.action === 'change_password');
  const failed = adminLog.filter(e => e.action === 'login_failed' && Date.now() - e.at < 7 * DAY_MS).length;

  const submit = async () => {
    setDone(false);
    if (next.length < MIN_PASSWORD_LENGTH) {
      setError(t('The new password must be at least 6 characters.', 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'));
      return;
    }
    if (next !== confirm) {
      setError(t('The two new passwords do not match.', 'নতুন পাসওয়ার্ড দুটি মেলেনি।'));
      return;
    }
    if (next === current) {
      setError(t('Choose a password different from the current one.', 'বর্তমানটির থেকে আলাদা পাসওয়ার্ড দিন।'));
      return;
    }
    setBusy(true);
    const ok = await admin.changePassword(current, next);
    setBusy(false);
    if (!ok) {
      setError(t('Your current password is incorrect.', 'বর্তমান পাসওয়ার্ড সঠিক নয়।'));
      return;
    }
    setError('');
    setCurrent(''); setNext(''); setConfirm('');
    setDone(true);
  };

  const label = 'block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4 items-start">
        <section className={`${panel} p-5 sm:p-6 space-y-5`}>
          <div className="space-y-1">
            <BlockHead title={t('Change admin password', 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন')} />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('Signed in as', 'লগইন করেছেন')} <span className="font-semibold text-slate-900 dark:text-slate-50">{user?.email}</span>
            </p>
          </div>

          {error && (
            <div role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">{error}</div>
          )}
          {done && (
            <div role="status" className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden />{t('Password changed.', 'পাসওয়ার্ড পরিবর্তন হয়েছে।')}
            </div>
          )}

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            {/* Hidden username helps password managers save the right login. */}
            <input type="text" autoComplete="username" value={user?.email ?? ''} readOnly hidden />
            <div>
              <label htmlFor="sec-current" className={label}>{t('Current password', 'বর্তমান পাসওয়ার্ড')}</label>
              <input id="sec-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={fieldClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sec-new" className={label}>{t('New password', 'নতুন পাসওয়ার্ড')}</label>
                <input id="sec-new" type="password" autoComplete="new-password" aria-describedby="sec-new-hint" value={next} onChange={(e) => setNext(e.target.value)} className={fieldClass} />
                <span id="sec-new-hint" className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{t('At least 6 characters.', 'কমপক্ষে ৬ অক্ষর।')}</span>
              </div>
              <div>
                <label htmlFor="sec-confirm" className={label}>{t('Confirm new password', 'নতুন পাসওয়ার্ড আবার দিন')}</label>
                <input id="sec-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={fieldClass} />
              </div>
            </div>
            <button type="submit" disabled={busy || !current || !next || !confirm} className={`${btnPrimary} w-full sm:w-auto sm:px-6`}>
              <KeyRound className="h-4 w-4" aria-hidden />
              {t('Change password', 'পাসওয়ার্ড পরিবর্তন করুন')}
            </button>
          </form>
        </section>

        <section className={`${panel} p-5 sm:p-6 space-y-4`}>
          <BlockHead title={t('Account status', 'অ্যাকাউন্টের অবস্থা')} />
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              {usingDefaultAdminPassword
                ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                : <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />}
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-50">
                  {usingDefaultAdminPassword ? t('Default password in use', 'ডিফল্ট পাসওয়ার্ড চালু') : t('Custom password set', 'নিজস্ব পাসওয়ার্ড দেওয়া আছে')}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {lastChange
                    ? <span title={formatTime(lastChange.at, lang)}>{t('Last changed', 'শেষ পরিবর্তন')} {relativeTime(lastChange.at, lang)}</span>
                    : t('No change recorded in the activity log.', 'কার্যক্রম লগে কোনো পরিবর্তন নেই।')}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              {failed > 0
                ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                : <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />}
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-50">
                  {t(`${failed} failed sign-in ${failed === 1 ? 'attempt' : 'attempts'}`, `${n(failed)}টি ব্যর্থ সাইন-ইন চেষ্টা`)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('In the last 7 days', 'গত ৭ দিনে')}</div>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <FootNote>
        {t('Demo: passwords are stored as SHA-256 hashes in this browser. "Clear all saved data" in Settings resets the built-in admin password to "admin".',
           'ডেমো: পাসওয়ার্ড এই ব্রাউজারে SHA-256 হ্যাশ হিসেবে রাখা হয়। সেটিংসে "সব তথ্য মুছুন" দিলে বিল্ট-ইন অ্যাডমিন পাসওয়ার্ড আবার "admin" হয়ে যায়।')}
      </FootNote>
    </div>
  );
}
