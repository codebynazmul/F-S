'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, LogOut, Mail, Phone, Save, User as UserIcon } from 'lucide-react';
import { initialsOf } from '@/lib/auth';
import { useApp } from '../AppProvider';
import { Avatar, Card, SubCard, TabHeader, labelClass, primaryBtn } from '../ui';

export default function AccountTab() {
  const { t, user, updateUser, signOut } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone === '—' ? '' : user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(id);
  }, [saved]);

  if (!user) return null;
  const admin = user.role === 'admin';
  const dirty = name.trim() !== user.name || (phone.trim() || '—') !== user.phone;

  const save = () => {
    const cleanName = name.trim() || user.name;
    updateUser({ name: cleanName, phone: phone.trim() || '—', initials: initialsOf(cleanName) });
    setSaved(true);
  };

  const fieldBox = 'flex items-center gap-2 glass-subtle rounded-xl px-3 py-2 border border-sky-500/15';

  return (
    <div className="space-y-6 card-rise">
      <Card className="rounded-4xl p-6 lg:p-8 shadow-xl space-y-6">
        <TabHeader
          icon={UserIcon}
          badge={t('User Account Management', 'ব্যবহারকারী একাউন্ট ব্যবস্থাপনা')}
          title={t('Profile Settings', 'প্রোফাইল তথ্য')}
          description={t('Your name and phone number appear on your farm action report.', 'আপনার নাম ও মোবাইল নম্বর কর্মপরিকল্পনা রিপোর্টে দেখাবে।')}
          actions={
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${admin
              ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/25'
              : 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/25'}`}>
              {admin ? t('Admin Role', 'অ্যাডমিন একাউন্ট') : t('Farmer Role', 'কৃষক একাউন্ট')}
            </span>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SubCard className="p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <Avatar initials={user.initials} admin={admin} size="lg" />
            <div>
              <span className="text-sm font-bold block">{user.name}</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">{user.email}</span>
            </div>
            <button type="button" onClick={signOut} className="btn-popup text-xs font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl border border-red-500/30">
              <LogOut className="h-3.5 w-3.5" />{t('Sign Out', 'লগআউট')}
            </button>
          </SubCard>

          <form className="md:col-span-2 space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div>
              <label htmlFor="acc-name" className={labelClass}>{t('Full Name', 'পূর্ণ নাম')}</label>
              <div className={fieldBox}>
                <UserIcon className="h-4 w-4 text-sky-500" />
                <input id="acc-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent outline-none text-sm font-bold" />
              </div>
            </div>
            <div>
              <label htmlFor="acc-phone" className={labelClass}>{t('Phone Number', 'মোবাইল নম্বর')}</label>
              <div className={fieldBox}>
                <Phone className="h-4 w-4 text-sky-500" />
                <input id="acc-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" className="w-full bg-transparent outline-none text-sm font-bold font-mono" />
              </div>
            </div>
            <div>
              <span className={labelClass}>{t('Email', 'ইমেইল')}</span>
              <div className={`${fieldBox} text-xs`}>
                <Mail className="h-4 w-4 text-sky-500" />
                <span className="font-mono truncate">{user.email}</span>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={!dirty} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs disabled:opacity-50 disabled:pointer-events-none ${primaryBtn}`}>
                <Save className="h-4 w-4" />
                <span>{t('Save Profile Changes', 'সংরক্ষণ করুন')}</span>
              </button>
              {saved && (
                <span role="status" className="text-xs text-emerald-600 dark:text-emerald-300 font-bold flex items-center gap-1.5 card-popup">
                  <CheckCircle2 className="h-4 w-4" />{t('Profile updated!', 'সফলভাবে আপডেট হয়েছে!')}
                </span>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
