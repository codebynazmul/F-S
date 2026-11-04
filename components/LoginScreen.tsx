'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Info, Lock, LogIn, Mail, Phone, Send } from 'lucide-react';
import { useApp } from './AppProvider';
import { LangToggle, primaryBtn } from './ui';
import { DEMO_ADMIN_EMAIL, initialsOf, isAdminLogin, isValidBdMobile, isValidEmail, makeUser } from '@/lib/auth';

// Short, compressed background loop (about 1 MB). public/login-bg.jpg is shown until it plays,
// and instead of it on slow connections, with data saver on, or when motion is reduced.
const VIDEO_URL = '/login-bg.mp4';

/** Play the background video only when it won't cost the user much data or time. */
function canPlayVideo(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && conn.effectiveType !== '4g') return false;
  return true;
}

const fieldBox = 'min-h-tap flex items-center gap-2 glass-subtle rounded-xl px-3 py-2.5';
const fieldInput =
  'w-full bg-transparent outline-none font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400';

export default function LoginScreen() {
  const { t, signIn } = useApp();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => { setShowVideo(canPlayVideo()); }, []);

  const phoneDigits = phone.replace(/\D/g, '').replace(/^(880|0)/, '');

  const sendOtp = () => {
    if (!isValidBdMobile(phoneDigits)) {
      setError(t('Enter a valid Bangladeshi mobile number, e.g. 1712345678.', 'সঠিক মোবাইল নম্বর দিন, যেমন ১৭১২৩৪৫৬৭৮।'));
      return;
    }
    // Demo: no SMS gateway yet, so the code is shown on screen.
    setSentCode(String(Math.floor(100000 + Math.random() * 900000)));
    setOtp('');
    setError('');
  };

  const verifyOtp = () => {
    if (otp !== sentCode) {
      setError(t('That code is not correct. Check the 6-digit code and try again.', 'কোডটি সঠিক নয়। ৬ সংখ্যার কোডটি আবার দেখে দিন।'));
      return;
    }
    signIn(makeUser({
      name: t('Farmer', 'কৃষক') + ` ${phoneDigits.slice(-4)}`,
      email: '—',
      phone: `+880 ${phoneDigits}`,
      initials: 'FR',
      role: 'farmer',
    }));
  };

  const googleLogin = () => {
    // Demo: replace with a real Google OAuth flow.
    signIn(makeUser({ name: 'Google Farmer', email: 'farmer@gmail.com', phone: '—', role: 'farmer' }));
  };

  const emailLogin = async () => {
    const mail = email.trim().toLowerCase();
    if (!mail || !password) {
      setError(t('Please enter both email and password.', 'ইমেইল ও পাসওয়ার্ড দুটোই দিন।'));
      return;
    }
    if (!isValidEmail(mail)) {
      setError(t('Please enter a valid email address.', 'সঠিক ইমেইল ঠিকানা দিন।'));
      return;
    }
    setBusy(true);
    try {
      if (await isAdminLogin(mail, password)) {
        signIn(makeUser({ name: 'System Administrator', email: mail, phone: '—', initials: 'AD', role: 'admin' }));
        return;
      }
      if (mail === DEMO_ADMIN_EMAIL) {
        setError(t('Incorrect admin password.', 'অ্যাডমিন পাসওয়ার্ড সঠিক নয়।'));
        return;
      }
      // Demo: any other email signs in as a farmer.
      const local = mail.split('@')[0];
      const name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      signIn(makeUser({ name, email: mail, phone: '—', initials: initialsOf(mail), role: 'farmer' }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100">
      <div className="fs-login-fallback" aria-hidden />
      {showVideo && (
        <video
          className="fs-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/login-bg.jpg"
          aria-hidden
          onError={() => setShowVideo(false)}
        >
          <source src={VIDEO_URL} type="video/mp4" onError={() => setShowVideo(false)} />
        </video>
      )}

      <header className="fs-login-header fs-login-header-wrap px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-sm.png" alt="" className="h-12 w-12 rounded-full object-cover shadow-md" />
          <h1 className="text-xl lg:text-2xl font-black tracking-tight">{t('Field Shift', 'ফিল্ড শিফট')}</h1>
        </div>
        <LangToggle />
      </header>

      <main className="fs-login-wrap flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="fs-login-card rounded-4xl p-8 lg:p-10 w-full max-w-md space-y-6 card-popup">
          <div className="text-center space-y-3">
            <img src="/logo-sm.png" alt="Field Shift logo" className="h-20 w-20 rounded-full object-cover shadow-xl mx-auto ring-4 ring-white/40" />
            <h2 className="text-2xl font-black tracking-tight">
              {t('Welcome to Field Shift', 'ফিল্ড শিফট লগইন')}
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
              {t('Sign in with Phone OTP, Google, or your Email to access NASA-powered crop planning.',
                 'ফোন ওটিপি, গুগল অথবা ইমেইল দিয়ে প্রবেশ করুন।')}
            </p>
          </div>

          {error && (
            <div role="alert" className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Phone + OTP */}
          <section className="space-y-3" aria-labelledby="phone-heading">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-sky-500" />
              <h3 id="phone-heading" className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {t('Phone Verification', 'ফোন নম্বর যাচাই')}
              </h3>
            </div>

            <label className={fieldBox}>
              <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">+880</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                aria-label={t('Mobile number', 'মোবাইল নম্বর')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !sentCode) sendOtp(); }}
                disabled={!!sentCode}
                placeholder="1XXXXXXXXX"
                className={fieldInput}
              />
            </label>

            {!sentCode ? (
              <button type="button" onClick={sendOtp} className={`w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 ${primaryBtn}`}>
                <Send className="h-4 w-4" />
                <span>{t('Send OTP Code', 'ওটিপি পাঠান')}</span>
              </button>
            ) : (
              <>
                <div className="text-sm flex items-start gap-1.5 rounded-lg px-3 py-2 bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-200">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    {t('Demo mode — SMS is not connected yet. Your code is ', 'ডেমো মোড — এসএমএস এখনো যুক্ত নয়। আপনার কোড ')}
                    <strong className="font-mono tracking-widest">{sentCode}</strong>
                  </span>
                </div>
                <label className={fieldBox}>
                  <Lock className="h-4 w-4 text-sky-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label={t('6-digit code', '৬ সংখ্যার কোড')}
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter') verifyOtp(); }}
                    placeholder={t('6-digit code', '৬ সংখ্যার কোড')}
                    className={`${fieldInput} tracking-widest`}
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setSentCode(null); setError(''); }}
                    className="btn-popup min-h-tap min-w-tap px-3 rounded-xl glass-subtle text-sm font-bold flex items-center justify-center gap-1"
                    aria-label={t('Change number', 'নম্বর পরিবর্তন')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={verifyOtp} className={`flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 ${primaryBtn}`}>
                    <ArrowRight className="h-4 w-4" />
                    <span>{t('Verify & Continue', 'ওটিপি যাচাই করে প্রবেশ করুন')}</span>
                  </button>
                </div>
              </>
            )}
          </section>

          <Divider label={t('Or', 'অথবা')} />

          <button
            type="button"
            onClick={googleLogin}
            className="btn-popup min-h-tap w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl glass-subtle border border-sky-500/25 hover:border-sky-500/50 font-bold text-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{t('Sign in with Google', 'গুগল দিয়ে সাইন ইন করুন')}</span>
          </button>

          <Divider label={t('Email & Password', 'ইমেইল ও পাসওয়ার্ড')} />

          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); emailLogin(); }}>
            <div>
              <label htmlFor="login-email" className="text-sm font-bold block mb-1 text-slate-700 dark:text-slate-300">
                {t('Email Address', 'ইমেইল ঠিকানা')}
              </label>
              <div className={fieldBox}>
                <Mail className="h-4 w-4 text-sky-500" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={fieldInput}
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="text-sm font-bold block mb-1 text-slate-700 dark:text-slate-300">
                {t('Password', 'পাসওয়ার্ড')}
              </label>
              <div className={fieldBox}>
                <Lock className="h-4 w-4 text-sky-500" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={fieldInput}
                />
              </div>
            </div>
            <button type="submit" disabled={busy} className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 ${primaryBtn}`}>
              <LogIn className="h-4 w-4" />
              <span>{busy ? t('Signing in…', 'প্রবেশ করা হচ্ছে…') : t('Sign In', 'প্রবেশ করুন')}</span>
            </button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-1">
              {t('Admin access is restricted to authorized credentials.', 'অ্যাডমিন অ্যাক্সেস শুধু অনুমোদিত ইমেইল দিয়ে।')}
            </p>
          </form>

          <div className="pt-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-sky-500/10">
            {t('Open Source Public Decision Support Tool', 'ওপেন সোর্স পাবলিক ডিসিশন সাপোর্ট টুল')}
          </div>
        </div>
      </main>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-grow border-t border-sky-500/15" />
      <span className="mx-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
      <div className="flex-grow border-t border-sky-500/15" />
    </div>
  );
}
