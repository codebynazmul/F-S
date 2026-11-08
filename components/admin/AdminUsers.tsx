'use client';

import React, { useMemo, useState } from 'react';
import { Ban, Check, Download, Pencil, Search, ShieldCheck, ShieldOff, Trash2, UserCheck, X } from 'lucide-react';
import type { Account } from '@/lib/types';
import { useApp } from '../AppProvider';
import {
  AdminAvatar, METHOD_LABEL, Pill, btnDanger, btnPrimary, btnQuiet, contactOf, districtOf,
  downloadCsv, fieldClass, focusRing, formatDate, formatTime, panel, relativeTime,
} from './shared';

export type UserFilter = 'all' | 'farmer' | 'admin' | 'blocked';

/** Column layout shared by the header row and every user row on wide screens. */
const COLS = 'lg:grid lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] lg:items-center lg:gap-4';

export default function AdminUsers({ filter, onFilterChange }: { filter: UserFilter; onFilterChange: (f: UserFilter) => void }) {
  const { t, n, user, accounts, admin } = useApp();
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const counts: Record<UserFilter, number> = {
    all: accounts.length,
    farmer: accounts.filter(a => a.role === 'farmer').length,
    admin: accounts.filter(a => a.role === 'admin').length,
    blocked: accounts.filter(a => a.blocked).length,
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts
      .filter(a => {
        if (filter === 'farmer' && a.role !== 'farmer') return false;
        if (filter === 'admin' && a.role !== 'admin') return false;
        if (filter === 'blocked' && !a.blocked) return false;
        if (!q) return true;
        const d = districtOf(a);
        return [a.name, a.email, a.phone, d?.name, d?.nameBn].some(v => v?.toLowerCase().includes(q));
      })
      .sort((a, b) => b.lastLoginAt - a.lastLoginAt);
  }, [accounts, query, filter]);

  const exportCsv = () => {
    downloadCsv(`field-shift-users-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Sign-in method', 'District', 'Joined', 'Last sign-in', 'Sign-ins'],
      ...accounts.map(a => [
        a.name, a.email, a.phone, a.role, a.blocked ? 'blocked' : 'active', a.method,
        districtOf(a)?.name ?? '', new Date(a.createdAt).toISOString(), new Date(a.lastLoginAt).toISOString(), a.loginCount,
      ]),
    ]);
    admin.recordExport();
  };

  const filters: { id: UserFilter; label: string }[] = [
    { id: 'all', label: t('All', 'সব') },
    { id: 'farmer', label: t('Farmers', 'কৃষক') },
    { id: 'admin', label: t('Admins', 'অ্যাডমিন') },
    { id: 'blocked', label: t('Blocked', 'ব্লক করা') },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{t('Search users', 'ব্যবহারকারী খুঁজুন')}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search name, email, phone or district', 'নাম, ইমেইল, ফোন বা জেলা খুঁজুন')}
            className={`${fieldClass} pl-9`}
          />
        </label>

        <div role="radiogroup" aria-label={t('Filter users', 'ব্যবহারকারী ছাঁকুন')}
          className="grid grid-cols-4 lg:flex gap-1 p-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]">
          {filters.map(f => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onFilterChange(f.id)}
                className={`min-h-[40px] px-3 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors ${focusRing} ${
                  on ? 'bg-[var(--bg-surface)] shadow-sm text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
                <span className="text-xs tabular-nums opacity-70 hidden sm:inline">{n(counts[f.id])}</span>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={exportCsv} disabled={accounts.length === 0} className={btnQuiet}>
          <Download className="h-4 w-4" aria-hidden />{t('Export CSV', 'CSV ডাউনলোড')}
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
        {t(`Showing ${shown.length} of ${accounts.length} users`, `${n(accounts.length)} জনের মধ্যে ${n(shown.length)} জন দেখানো হচ্ছে`)}
      </p>

      {shown.length === 0 ? (
        <div className={`${panel} p-10 text-center space-y-1`}>
          <Search className="mx-auto h-6 w-6 text-slate-400" aria-hidden />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {accounts.length === 0
              ? t('No one has signed up yet. Accounts appear here after someone signs in on this device.',
                  'এখনো কেউ নিবন্ধন করেনি। এই ডিভাইসে কেউ সাইন ইন করলে তার অ্যাকাউন্ট এখানে দেখাবে।')
              : t('No users match your search.', 'আপনার খোঁজার সাথে কোনো ব্যবহারকারী মেলেনি।')}
          </p>
        </div>
      ) : (
        <div className={`${panel} overflow-hidden`}>
          <div className={`hidden ${COLS} px-5 py-3 border-b border-[var(--border-soft)] text-xs font-semibold text-slate-500 dark:text-slate-400`} aria-hidden>
            <span>{t('User', 'ব্যবহারকারী')}</span>
            <span>{t('District', 'জেলা')}</span>
            <span>{t('Sign-in', 'সাইন-ইন')}</span>
            <span>{t('Last seen', 'শেষ দেখা')}</span>
            <span className="w-[12.5rem] text-right">{t('Actions', 'কাজ')}</span>
          </div>
          <ul>
            {shown.map(a => (
              <UserRow
                key={a.id}
                account={a}
                isSelf={a.id === user?.id}
                editing={editingId === a.id}
                onEdit={() => setEditingId(a.id)}
                onDone={() => setEditingId(null)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** On wide screens the actions show as icons; the label stays for screen readers and as a tooltip. */
function Action({ icon: Icon, label, onClick, danger = false }: { icon: typeof Pencil; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} className={`${danger ? btnDanger : btnQuiet} lg:px-0`}>
      <Icon className="h-4 w-4" aria-hidden />
      <span className="lg:sr-only">{label}</span>
    </button>
  );
}

function UserRow({ account: a, isSelf, editing, onEdit, onDone }: {
  account: Account; isSelf: boolean; editing: boolean; onEdit: () => void; onDone: () => void;
}) {
  const { t, n, lang, admin } = useApp();
  const [name, setName] = useState(a.name);
  const [phone, setPhone] = useState(a.phone === '—' ? '' : a.phone);
  const district = districtOf(a);

  const save = () => {
    admin.updateAccount(a.id, { name: name.trim() || a.name, phone: phone.trim() || '—' });
    onDone();
  };
  const confirmThen = (message: string, fn: () => void) => { if (window.confirm(message)) fn(); };

  return (
    <li className={`px-5 py-4 border-b border-[var(--border-soft)] last:border-b-0 transition-colors hover:bg-[var(--accent-soft)] ${a.blocked ? 'bg-red-500/[0.04]' : ''}`}>
      <div className={`${COLS} space-y-3 lg:space-y-0`}>
        <div className="flex items-center gap-3 min-w-0">
          <AdminAvatar name={a.name || a.email} admin={a.role === 'admin'} />
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-sm font-semibold truncate ${a.blocked ? 'text-slate-500 line-through decoration-slate-400/60' : 'text-slate-900 dark:text-slate-50'}`}>{a.name}</span>
              {a.role === 'admin' && <Pill tone="ink" icon={ShieldCheck}>{t('Admin', 'অ্যাডমিন')}</Pill>}
              {a.blocked && <Pill tone="red" icon={Ban}>{t('Blocked', 'ব্লক করা')}</Pill>}
              {isSelf && <Pill tone="muted">{t('You', 'আপনি')}</Pill>}
            </div>
            <div className="text-xs truncate text-slate-500 dark:text-slate-400">
              {contactOf(a)}{a.email !== '—' && a.phone !== '—' ? ` · ${a.phone}` : ''}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-3 lg:contents text-sm">
          <div className="min-w-0">
            <dt className="lg:sr-only text-xs text-slate-500">{t('District', 'জেলা')}</dt>
            <dd className="truncate text-slate-700 dark:text-slate-300">{district ? (lang === 'bn' ? district.nameBn : district.name) : '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="lg:sr-only text-xs text-slate-500">{t('Sign-in', 'সাইন-ইন')}</dt>
            <dd className="truncate text-slate-700 dark:text-slate-300">{t(...METHOD_LABEL[a.method])}</dd>
          </div>
          <div className="min-w-0" title={`${t('Joined', 'যোগদান')} ${formatDate(a.createdAt, lang)} · ${formatTime(a.lastLoginAt, lang)}`}>
            <dt className="lg:sr-only text-xs text-slate-500">{t('Last seen', 'শেষ দেখা')}</dt>
            <dd className="text-slate-700 dark:text-slate-300">
              {relativeTime(a.lastLoginAt, lang)}
              <span className="block text-xs tabular-nums text-slate-500">{t(`${n(a.loginCount)} sign-ins`, `${n(a.loginCount)} বার সাইন-ইন`)}</span>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 lg:justify-end lg:w-[12.5rem]">
          {isSelf ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 lg:text-right">
              {t('Edit yourself in My Account.', 'নিজের তথ্য "আমার একাউন্ট" থেকে বদলান।')}
            </p>
          ) : (
            <>
              <Action icon={Pencil} label={t('Edit', 'সম্পাদনা')} onClick={onEdit} />
              {a.blocked ? (
                <Action icon={UserCheck} label={t('Unblock', 'ব্লক তুলুন')} onClick={() => admin.setBlocked(a.id, false)} />
              ) : (
                <Action icon={Ban} label={t('Block', 'ব্লক')}
                  onClick={() => confirmThen(t(`Block ${a.name}? They will be signed out and cannot sign in again until unblocked.`,
                    `${a.name}-কে ব্লক করবেন? তিনি লগআউট হবেন এবং ব্লক না তোলা পর্যন্ত আর সাইন ইন করতে পারবেন না।`), () => admin.setBlocked(a.id, true))} />
              )}
              {a.role === 'admin' ? (
                <Action icon={ShieldOff} label={t('Remove admin', 'অ্যাডমিন সরান')}
                  onClick={() => confirmThen(t(`Remove admin rights from ${a.name}?`, `${a.name}-এর অ্যাডমিন ক্ষমতা সরাবেন?`), () => admin.setRole(a.id, 'farmer'))} />
              ) : (
                <Action icon={ShieldCheck} label={t('Make admin', 'অ্যাডমিন করুন')}
                  onClick={() => confirmThen(t(`Make ${a.name} an admin? They will be able to manage every user.`,
                    `${a.name}-কে অ্যাডমিন করবেন? তিনি সব ব্যবহারকারী পরিচালনা করতে পারবেন।`), () => admin.setRole(a.id, 'admin'))} />
              )}
              <Action icon={Trash2} danger label={t('Delete', 'মুছুন')}
                onClick={() => confirmThen(t(`Delete ${a.name}'s account permanently? This cannot be undone.`,
                  `${a.name}-এর অ্যাকাউন্ট স্থায়ীভাবে মুছবেন? এটি আর ফেরানো যাবে না।`), () => admin.deleteAccount(a.id))} />
            </>
          )}
        </div>
      </div>

      {editing && (
        <form
          className="mt-4 pt-4 border-t border-[var(--border-soft)] grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end"
          onSubmit={(e) => { e.preventDefault(); save(); }}
        >
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('Name', 'নাম')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} autoFocus />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('Phone', 'ফোন')}</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={fieldClass} />
          </label>
          <div className="flex gap-2">
            <button type="submit" className={`${btnPrimary} flex-1 sm:flex-none`}>
              <Check className="h-4 w-4" aria-hidden />{t('Save changes', 'পরিবর্তন সংরক্ষণ')}
            </button>
            <button type="button" onClick={onDone} className={btnQuiet}>
              <X className="h-4 w-4" aria-hidden />{t('Cancel', 'বাতিল')}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
