'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ALL_DISTRICTS } from '@/data/districts';
import type { Account, AdminAction, Lang } from '@/lib/types';
import { useApp } from '../AppProvider';
import { SubCard } from '../ui';

export const DAY_MS = 24 * 60 * 60 * 1000;

export const formatTime = (ms: number, lang: Lang) =>
  new Date(ms).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (ms: number, lang: Lang) =>
  new Date(ms).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium' });

export const districtOf = (a: Account) => ALL_DISTRICTS.find(d => d.id === a.districtId);

/** How a person can be recognised: email, or phone for phone sign-ins. */
export const contactOf = (a: Account) => (a.email !== '—' ? a.email : a.phone);

export const METHOD_LABEL: Record<Account['method'], [string, string]> = {
  email: ['Email', 'ইমেইল'],
  phone: ['Phone code', 'ফোন কোড'],
  google: ['Google', 'গুগল'],
  apple: ['Apple', 'অ্যাপল'],
};

export const ACTION_LABEL: Record<AdminAction, [string, string]> = {
  login: ['Signed in', 'সাইন ইন'],
  login_failed: ['Failed sign-in attempt', 'ব্যর্থ সাইন-ইন চেষ্টা'],
  logout: ['Signed out', 'সাইন আউট'],
  edit_user: ['Edited user', 'ব্যবহারকারীর তথ্য সম্পাদনা'],
  block_user: ['Blocked user', 'ব্যবহারকারী ব্লক'],
  unblock_user: ['Unblocked user', 'ব্লক তুলে নেওয়া'],
  delete_user: ['Deleted user', 'ব্যবহারকারী মুছে ফেলা'],
  make_admin: ['Made admin', 'অ্যাডমিন করা হয়েছে'],
  remove_admin: ['Removed admin role', 'অ্যাডমিন পদ সরানো'],
  change_password: ['Changed password', 'পাসওয়ার্ড পরিবর্তন'],
  export_users: ['Exported user list', 'ব্যবহারকারী তালিকা ডাউনলোড'],
  clear_log: ['Cleared activity log', 'কার্যক্রম লগ মুছে ফেলা'],
};

/** Saves rows as a CSV file. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    const text = String(v);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // The BOM makes Excel open Bangla text correctly.
  const csv = '﻿' + rows.map(r => r.map(cell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** A single headline number. */
export function StatTile({ icon: Icon, label, value, tone = 'sky' }: {
  icon: LucideIcon; label: string; value: string; tone?: 'sky' | 'violet' | 'red' | 'emerald';
}) {
  const color = {
    sky: 'text-sky-500',
    violet: 'text-violet-500',
    red: 'text-red-500',
    emerald: 'text-emerald-500',
  }[tone];
  return (
    <SubCard className="p-4 rounded-2xl space-y-1">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
        <Icon className={`h-4 w-4 ${color}`} aria-hidden />
        {label}
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-slate-50">{value}</div>
    </SubCard>
  );
}

/** Horizontal bars for one measure, each labelled with its count. */
export function BarList({ title, items, empty }: {
  title: string;
  items: { label: string; value: number }[];
  empty: string;
}) {
  const { n } = useApp();
  const max = Math.max(1, ...items.map(i => i.value));
  return (
    <SubCard className="p-5 rounded-2xl space-y-3">
      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-600 dark:text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map(item => (
            <li key={item.label} className="space-y-1" title={`${item.label}: ${item.value}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-slate-50">{n(item.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-400/15">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value > 0 ? 4 : 0 }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SubCard>
  );
}
