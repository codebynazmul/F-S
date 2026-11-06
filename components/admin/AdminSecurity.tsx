'use client';

import React, { useState } from 'react';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';
import { useApp } from '../AppProvider';
import { SubCard, inputClass, labelClass, primaryBtn } from '../ui';

export default function AdminSecurity() {
  const { t, user, admin } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="space-y-4 max-w-lg">
      <SubCard className="p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2 text-violet-600 dark:text-violet-300">
          <KeyRound className="h-4 w-4" aria-hidden />{t('Change admin password', 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন')}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('Signed in as', 'লগইন করেছেন')} <strong>{user?.email}</strong>
        </p>

        {error && (
          <div role="alert" className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>
        )}
        {done && (
          <div role="status" className="text-sm font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden />{t('Password changed.', 'পাসওয়ার্ড পরিবর্তন হয়েছে।')}
          </div>
        )}

        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {/* Hidden username helps password managers save the right login. */}
          <input type="text" autoComplete="username" value={user?.email ?? ''} readOnly hidden />
          <div>
            <label htmlFor="sec-current" className={labelClass}>{t('Current password', 'বর্তমান পাসওয়ার্ড')}</label>
            <input id="sec-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="sec-new" className={labelClass}>{t('New password', 'নতুন পাসওয়ার্ড')}</label>
            <input id="sec-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
            <span className="text-xs text-slate-600 dark:text-slate-400">{t('At least 6 characters.', 'কমপক্ষে ৬ অক্ষর।')}</span>
          </div>
          <div>
            <label htmlFor="sec-confirm" className={labelClass}>{t('Confirm new password', 'নতুন পাসওয়ার্ড আবার দিন')}</label>
            <input id="sec-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy || !current || !next || !confirm} className={`w-full py-3 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}>
            {t('Change password', 'পাসওয়ার্ড পরিবর্তন করুন')}
          </button>
        </form>
      </SubCard>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {t('Demo: passwords are stored as SHA-256 hashes in this browser. "Clear all saved data" in Settings resets the built-in admin password to "admin".',
           'ডেমো: পাসওয়ার্ড এই ব্রাউজারে SHA-256 হ্যাশ হিসেবে রাখা হয়। সেটিংসে "সব তথ্য মুছুন" দিলে বিল্ট-ইন অ্যাডমিন পাসওয়ার্ড আবার "admin" হয়ে যায়।')}
      </p>
    </div>
  );
}
