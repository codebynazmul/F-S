'use client';

import React, { useEffect, useRef } from 'react';
import { ShieldCheck, FileText, X } from 'lucide-react';
import { useApp } from './AppProvider';
import { primaryBtn } from './ui';

export type LegalDoc = 'terms' | 'privacy';

type Section = { title: [string, string]; body: [string, string] };

// Each entry is [English, Bangla].
const TERMS: Section[] = [
  {
    title: ['About Field Shift', 'ফিল্ড শিফট সম্পর্কে'],
    body: [
      'Field Shift is a free, open decision-support tool that suggests crop rotations for Bangladesh using district data and NASA POWER climate data. It was built for the NASA Space Apps Challenge.',
      'ফিল্ড শিফট একটি বিনামূল্যের সিদ্ধান্ত-সহায়ক টুল, যা জেলার তথ্য ও নাসা পাওয়ার জলবায়ু তথ্য ব্যবহার করে বাংলাদেশের জন্য ফসল আবর্তনের পরামর্শ দেয়। এটি নাসা স্পেস অ্যাপস চ্যালেঞ্জের জন্য তৈরি।',
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
    title: ['Demo sign-in', 'ডেমো সাইন-ইন'],
    body: [
      'Sign-in, sign-up, verification codes and social logins are demonstrations only. They do not create a protected account. Do not use a password you use anywhere else.',
      'সাইন-ইন, নিবন্ধন, যাচাই কোড ও সোশ্যাল লগইন কেবল প্রদর্শনের জন্য। এগুলো কোনো সুরক্ষিত অ্যাকাউন্ট তৈরি করে না। অন্য কোথাও ব্যবহার করা পাসওয়ার্ড এখানে দেবেন না।',
    ],
  },
  {
    title: ['Fair use', 'যথাযথ ব্যবহার'],
    body: [
      'Please do not try to disrupt the app or misuse the NASA POWER service through it.',
      'অ্যাপটি বিঘ্নিত করার বা এর মাধ্যমে নাসা পাওয়ার সেবার অপব্যবহারের চেষ্টা করবেন না।',
    ],
  },
  {
    title: ['No warranty', 'কোনো নিশ্চয়তা নেই'],
    body: [
      'The app is provided as is. Climate data may be late, missing or wrong, and the service may change or stop at any time. The Field Shift team is not liable for crop losses or other damage from using it.',
      'অ্যাপটি যেমন আছে তেমনভাবে দেওয়া হয়েছে। জলবায়ু তথ্য দেরিতে আসতে, অনুপস্থিত বা ভুল হতে পারে, এবং সেবাটি যেকোনো সময় বদলাতে বা বন্ধ হতে পারে। এটি ব্যবহারের ফলে ফসলের ক্ষতি বা অন্য কোনো ক্ষতির জন্য ফিল্ড শিফট দল দায়ী নয়।',
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
      'Your name, email or phone number, farm profile, plans and settings are saved only in this browser on this device. Field Shift has no server or database, so this information is not sent to us.',
      'আপনার নাম, ইমেইল বা ফোন নম্বর, খামারের তথ্য, পরিকল্পনা ও সেটিংস শুধু এই ডিভাইসের এই ব্রাউজারে সংরক্ষিত থাকে। ফিল্ড শিফটের কোনো সার্ভার বা ডেটাবেস নেই, তাই এই তথ্য আমাদের কাছে পাঠানো হয় না।',
    ],
  },
  {
    title: ['Climate data requests', 'জলবায়ু তথ্যের অনুরোধ'],
    body: [
      'To show live climate figures, the app asks NASA POWER for data about your district\'s location. That request includes the location coordinates but not your name or contact details. NASA\'s own privacy policy applies to it.',
      'সরাসরি জলবায়ু তথ্য দেখাতে অ্যাপটি আপনার জেলার অবস্থানের জন্য নাসা পাওয়ার থেকে তথ্য চায়। সেই অনুরোধে অবস্থানের স্থানাঙ্ক থাকে, কিন্তু আপনার নাম বা যোগাযোগের তথ্য থাকে না। এর ক্ষেত্রে নাসার নিজস্ব গোপনীয়তা নীতি প্রযোজ্য।',
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
      'You can delete everything at any time from Settings, or by clearing this site\'s data in your browser.',
      'সেটিংস থেকে অথবা ব্রাউজারে এই সাইটের তথ্য মুছে আপনি যেকোনো সময় সবকিছু মুছে ফেলতে পারেন।',
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        onClick={(e) => e.stopPropagation()}
        className={`${isNight ? 'glass-strong' : 'glass'} card-popup rounded-4xl w-full max-w-lg max-h-[85vh] flex flex-col text-slate-900 dark:text-slate-100`}
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-sky-500/15">
          <Icon className="h-5 w-5 text-sky-500 shrink-0" />
          <h2 id="legal-title" className="text-xl font-black tracking-tight flex-1">{title}</h2>
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
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
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
      </div>
    </div>
  );
}
