'use client';

import React, { useMemo, useState } from 'react';
import { Ban, Check, Download, Pencil, Search, ShieldCheck, ShieldOff, Trash2, UserCheck, X } from 'lucide-react';
import type { Account } from '@/lib/types';
import { useApp } from '../AppProvider';
import { Avatar, SubCard, ghostBtn, inputClass, primaryBtn } from '../ui';
import { initialsOf } from '@/lib/auth';
import { METHOD_LABEL, contactOf, districtOf, downloadCsv, formatDate, formatTime } from './shared';

type Filter = 'all' | 'farmer' | 'admin' | 'blocked';

export default function AdminUsers() {
  const { t, user, accounts, admin } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t('All', 'সব') },
    { id: 'farmer', label: t('Farmers', 'কৃষক') },
    { id: 'admin', label: t('Admins', 'অ্যাডমিন') },
    { id: 'blocked', label: t('Blocked', 'ব্লক করা') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <label className="flex-1 min-h-tap flex items-center gap-2 glass-subtle rounded-xl px-3 border border-sky-500/15">
          <Search className="h-4 w-4 text-sky-500 shrink-0" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search name, email, phone or district', 'নাম, ইমেইল, ফোন বা জেলা খুঁজুন')}
            aria-label={t('Search users', 'ব্যবহারকারী খুঁজুন')}
            className="w-full bg-transparent outline-none text-sm font-bold py-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          aria-label={t('Filter users', 'ব্যবহারকারী ছাঁকুন')}
          className={`${inputClass} sm:w-40`}
        >
          {filters.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <button type="button" onClick={exportCsv} disabled={accounts.length === 0} className={`${ghostBtn} disabled:opacity-50`}>
          <Download className="h-4 w-4" />{t('Export CSV', 'CSV ডাউনলোড')}
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {t(`Showing ${shown.length} of ${accounts.length} users`, `${accounts.length} জনের মধ্যে ${shown.length} জন দেখানো হচ্ছে`)}
      </p>

      {shown.length === 0 ? (
        <SubCard className="p-6 rounded-2xl text-center text-sm text-slate-600 dark:text-slate-400">
          {accounts.length === 0
            ? t('No one has signed up yet. Accounts appear here after someone signs in on this device.',
                'এখনো কেউ নিবন্ধন করেনি। এই ডিভাইসে কেউ সাইন ইন করলে তার অ্যাকাউন্ট এখানে দেখাবে।')
            : t('No users match your search.', 'আপনার খোঁজার সাথে কোনো ব্যবহারকারী মেলেনি।')}
        </SubCard>
      ) : (
        <ul className="space-y-3">
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
      )}
    </div>
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

  const actionBtn = 'btn-popup min-h-tap px-3 rounded-xl glass-subtle border border-sky-500/15 text-xs font-bold flex items-center gap-1.5';

  return (
    <li>
      <SubCard className={`p-4 rounded-2xl space-y-3 ${a.blocked ? 'opacity-75' : ''}`}>
        <div className="flex items-start gap-3">
          <Avatar initials={initialsOf(a.name || a.email)} admin={a.role === 'admin'} />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-sm text-slate-900 dark:text-white">{a.name}</span>
              {a.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/25">
                  {t('Admin', 'অ্যাডমিন')}
                </span>
              )}
              {a.blocked && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 flex items-center gap-1">
                  <Ban className="h-3 w-3" aria-hidden />{t('Blocked', 'ব্লক করা')}
                </span>
              )}
              {isSelf && <span className="text-[11px] font-bold text-slate-500">({t('you', 'আপনি')})</span>}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 break-all">
              {contactOf(a)}{a.email !== '—' && a.phone !== '—' ? ` · ${a.phone}` : ''}
            </div>
            <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400">
              <div><dt className="inline">{t('Sign-in', 'সাইন-ইন')}: </dt><dd className="inline font-bold">{t(...METHOD_LABEL[a.method])}</dd></div>
              <div><dt className="inline">{t('District', 'জেলা')}: </dt><dd className="inline font-bold">{district ? (lang === 'bn' ? district.nameBn : district.name) : '—'}</dd></div>
              <div><dt className="inline">{t('Joined', 'যোগদান')}: </dt><dd className="inline font-bold">{formatDate(a.createdAt, lang)}</dd></div>
              <div><dt className="inline">{t('Last sign-in', 'শেষ সাইন-ইন')}: </dt><dd className="inline font-bold">{formatTime(a.lastLoginAt, lang)}</dd></div>
              <div><dt className="inline">{t('Sign-ins', 'সাইন-ইন সংখ্যা')}: </dt><dd className="inline font-bold">{n(a.loginCount)}</dd></div>
            </dl>
          </div>
        </div>

        {editing ? (
          <form className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <input value={name} onChange={(e) => setName(e.target.value)} aria-label={t('Name', 'নাম')} placeholder={t('Name', 'নাম')} className={inputClass} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} aria-label={t('Phone', 'ফোন')} placeholder={t('Phone', 'ফোন')} className={inputClass} />
            <div className="flex gap-2">
              <button type="submit" className={`px-4 rounded-xl text-xs flex items-center gap-1.5 ${primaryBtn}`}>
                <Check className="h-4 w-4" />{t('Save', 'সংরক্ষণ')}
              </button>
              <button type="button" onClick={onDone} className={actionBtn} aria-label={t('Cancel', 'বাতিল')}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : isSelf ? (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('You cannot change your own account here. Use My Account instead.', 'নিজের অ্যাকাউন্ট এখানে বদলানো যায় না। "আমার একাউন্ট" ব্যবহার করুন।')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onEdit} className={`${actionBtn} text-sky-600 dark:text-sky-300`}>
              <Pencil className="h-4 w-4" />{t('Edit', 'সম্পাদনা')}
            </button>
            {a.blocked ? (
              <button type="button" onClick={() => admin.setBlocked(a.id, false)} className={`${actionBtn} text-emerald-600 dark:text-emerald-400`}>
                <UserCheck className="h-4 w-4" />{t('Unblock', 'ব্লক তুলুন')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => confirmThen(t(`Block ${a.name}? They will be signed out and cannot sign in again until unblocked.`,
                  `${a.name}-কে ব্লক করবেন? তিনি লগআউট হবেন এবং ব্লক না তোলা পর্যন্ত আর সাইন ইন করতে পারবেন না।`), () => admin.setBlocked(a.id, true))}
                className={`${actionBtn} text-amber-600 dark:text-amber-400`}
              >
                <Ban className="h-4 w-4" />{t('Block', 'ব্লক')}
              </button>
            )}
            {a.role === 'admin' ? (
              <button
                type="button"
                onClick={() => confirmThen(t(`Remove admin rights from ${a.name}?`, `${a.name}-এর অ্যাডমিন ক্ষমতা সরাবেন?`), () => admin.setRole(a.id, 'farmer'))}
                className={`${actionBtn} text-violet-600 dark:text-violet-300`}
              >
                <ShieldOff className="h-4 w-4" />{t('Remove admin', 'অ্যাডমিন সরান')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => confirmThen(t(`Make ${a.name} an admin? They will be able to manage every user.`,
                  `${a.name}-কে অ্যাডমিন করবেন? তিনি সব ব্যবহারকারী পরিচালনা করতে পারবেন।`), () => admin.setRole(a.id, 'admin'))}
                className={`${actionBtn} text-violet-600 dark:text-violet-300`}
              >
                <ShieldCheck className="h-4 w-4" />{t('Make admin', 'অ্যাডমিন করুন')}
              </button>
            )}
            <button
              type="button"
              onClick={() => confirmThen(t(`Delete ${a.name}'s account permanently? This cannot be undone.`,
                `${a.name}-এর অ্যাকাউন্ট স্থায়ীভাবে মুছবেন? এটি আর ফেরানো যাবে না।`), () => admin.deleteAccount(a.id))}
              className={`${actionBtn} text-red-600 dark:text-red-400`}
            >
              <Trash2 className="h-4 w-4" />{t('Delete', 'মুছুন')}
            </button>
          </div>
        )}
      </SubCard>
    </li>
  );
}
