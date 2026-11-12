'use client';

import React, { useEffect, useRef } from 'react';
import { ShieldCheck, FileText, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { EASE, EASE_ENTER } from '@/lib/motion';
import { primaryBtn } from './ui';

export type LegalDoc = 'terms' | 'privacy';

type Section = { title: [string, string]; body: [string, string] };

// Each entry is [English, Bangla].
const TERMS: Section[] = [
  {
    title: ['About Agro Cosmic Weave', 'অ্যাগ্রো কসমিক উইভ সম্পর্কে'],
    body: [
      'Agro Cosmic Weave is a free, open decision-support tool that suggests crop rotations for Bangladesh using district data and NASA POWER climate data. It was built for the NASA Space Apps Challenge.',
      'অ্যাগ্রো কসমিক উইভ একটি বিনামূল্যের সিদ্ধান্ত-সহায়ক টুল, যা জেলার তথ্য ও নাসা পাওয়ার জলবায়ু তথ্য ব্যবহার করে বাংলাদেশের জন্য ফসল আবর্তনের পরামর্শ দেয়। এটি নাসা স্পেস অ্যাপস চ্যালেঞ্জের জন্য তৈরি।',
    ],
  },
  {
    title: ['Advice only', 'শুধু পরামর্শ'],
    body: [
      'Recommendations come from a simplified scoring model that has not been tested against field results. Use them as one input alongside your own experience and your local agriculture officer. You are responsible for the decisions you make on your farm.',
      'পরামর্শগুলো একটি সরলীকৃত মডেল থেকে আসে, যা মাঠ পর্যায়ে যাচাই করা হয়নি। নিজের অভিজ্ঞতা ও স্থানীয় কৃষি কর্মকর্তার পরামর্শের পাশাপাশি এগুলো বিবেচনা করুন। আপনার খামারের সিদ্ধান্তের দায়িত্ব আপনার।',
    ],
  },
  {
    title: ['No account needed', 'অ্যাকাউন্ট লাগে না'],
    body: [
      'You do not need to sign up or sign in. Your profile exists only on this device and is not a protected account.',
      'নিবন্ধন বা সাইন-ইন করতে হয় না। আপনার প্রোফাইল শুধু এই ডিভাইসে থাকে এবং এটি কোনো সুরক্ষিত অ্যাকাউন্ট নয়।',
    ],
  },
  {
    title: ['Fair use', 'যথাযথ ব্যবহার'],
    body: [
      'Please do not try to disrupt the app or misuse the data services it relies on.',
      'অ্যাপটি বিঘ্নিত করার বা এটি যে তথ্যসেবার উপর নির্ভর করে তার অপব্যবহারের চেষ্টা করবেন না।',
    ],
  },
  {
    title: ['No warranty', 'কোনো নিশ্চয়তা নেই'],
    body: [
      'The app is provided as is. Climate data may be late, missing or wrong, and the service may change or stop at any time. The Agro Cosmic Weave team is not liable for crop losses or other damage from using it.',
      'অ্যাপটি যেমন আছে তেমনভাবে দেওয়া হয়েছে। জলবায়ু তথ্য দেরিতে আসতে, অনুপস্থিত বা ভুল হতে পারে, এবং সেবাটি যেকোনো সময় বদলাতে বা বন্ধ হতে পারে। এটি ব্যবহারের ফলে ফসলের ক্ষতি বা অন্য কোনো ক্ষতির জন্য অ্যাগ্রো কসমিক উইভ দল দায়ী নয়।',
    ],
  },
  {
    title: ['Changes', 'পরিবর্তন'],
    body: [
      'We may update these terms. Continuing to use the app after a change means you accept the new terms.',
      'আমরা এই শর্তাবলি হালনাগাদ করতে পারি। পরিবর্তনের পর অ্যাপ ব্যবহার চালিয়ে গেলে আপনি নতুন শর্ত মেনে নিচ্ছেন।',
    ],
  },
];

const PRIVACY: Section[] = [
  {
    title: ['What we store', 'আমরা কী সংরক্ষণ করি'],
    body: [
      'Your farm profile, plans, chosen district and settings are saved only in this browser on this device. They are never sent to us or anyone else.',
      'আপনার খামারের তথ্য, পরিকল্পনা, বাছাই করা জেলা ও সেটিংস শুধু এই ডিভাইসের এই ব্রাউজারে সংরক্ষিত থাকে। এগুলো কখনো আমাদের বা অন্য কারও কাছে পাঠানো হয় না।',
    ],
  },
  {
    title: ['Your location', 'আপনার অবস্থান'],
    body: [
      'If you allow it, your browser tells the app where you are so it can pick the nearest district. This is worked out on your device; your location is not sent or saved. You can say no and choose your district yourself.',
      'আপনি অনুমতি দিলে ব্রাউজার অ্যাপকে আপনার অবস্থান জানায়, যাতে কাছের জেলাটি বেছে নেওয়া যায়। এটি আপনার ডিভাইসেই হিসাব হয়; আপনার অবস্থান কোথাও পাঠানো বা সংরক্ষণ করা হয় না। আপনি অনুমতি না দিয়ে নিজে জেলা বেছে নিতে পারেন।',
    ],
  },
  {
    title: ['Climate data requests', 'জলবায়ু তথ্যের অনুরোধ'],
    body: [
      'To show NASA climate and satellite figures, the app asks our database for data about your selected district. That request names only the district, not you or your farm. The database is filled with data from NASA services on a schedule.',
      'নাসার জলবায়ু ও স্যাটেলাইট তথ্য দেখাতে অ্যাপটি আপনার বাছাই করা জেলার তথ্য আমাদের ডেটাবেস থেকে চায়। সেই অনুরোধে শুধু জেলার নাম থাকে, আপনার বা আপনার খামারের তথ্য থাকে না। নাসার সেবা থেকে নিয়মিত তথ্য এনে ডেটাবেসটি হালনাগাদ রাখা হয়।',
    ],
  },
  {
    title: ['No tracking', 'কোনো ট্র্যাকিং নেই'],
    body: [
      'We do not use analytics, advertising or tracking cookies, and we do not sell or share your information.',
      'আমরা কোনো অ্যানালিটিক্স, বিজ্ঞাপন বা ট্র্যাকিং কুকি ব্যবহার করি না, এবং আপনার তথ্য বিক্রি বা শেয়ার করি না।',
    ],
  },
  {
    title: ['Deleting your data', 'আপনার তথ্য মুছে ফেলা'],
    body: [
      'You can delete everything at any time by clearing this site\'s data in your browser settings.',
      'ব্রাউজারের সেটিংসে এই সাইটের তথ্য মুছে আপনি যেকোনো সময় সবকিছু মুছে ফেলতে পারেন।',
    ],
  },
  {
    title: ['Shared devices', 'শেয়ার করা ডিভাইস'],
    body: [
      'Anyone who uses this browser can see what is saved in it. On a shared phone or computer, delete your data when you are done.',
      'এই ব্রাউজার যে-ই ব্যবহার করুক, সংরক্ষিত তথ্য দেখতে পারবে। শেয়ার করা ফোন বা কম্পিউটারে কাজ শেষে আপনার তথ্য মুছে ফেলুন।',
    ],
  },
];

export default function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  const { t, isNight } = useApp();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape, focus the close button, and stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const isTerms = doc === 'terms';
  const sections = isTerms ? TERMS : PRIVACY;
  const title = isTerms ? t('Terms of Service', 'সেবার শর্তাবলি') : t('Privacy Policy', 'গোপনীয়তা নীতি');
  const Icon = isTerms ? FileText : ShieldCheck;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE } }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: EASE_ENTER } }}
        exit={{ opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.15, ease: EASE } }}
        className={`${isNight ? 'glass-strong' : 'glass'} rounded-[var(--radius-card)] w-full max-w-lg max-h-[85vh] flex flex-col text-slate-900 dark:text-slate-100`}
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-sky-500/15">
          <Icon className="h-5 w-5 text-sky-500 shrink-0" />
          <h2 id="legal-title" className="text-xl font-semibold tracking-tight flex-1">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('Close', 'বন্ধ করুন')}
            className="btn-popup min-h-tap min-w-tap rounded-xl glass-subtle flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Last updated: November 2026', 'সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬')}
          </p>
          {sections.map((s, i) => (
            <section key={i} className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {i + 1}. {t(s.title[0], s.title[1])}
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{t(s.body[0], s.body[1])}</p>
            </section>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-sky-500/15">
          <button type="button" onClick={onClose} className={`w-full py-3 rounded-xl text-sm ${primaryBtn}`}>
            {t('Got it', 'বুঝেছি')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
