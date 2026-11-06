'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Info, KeyRound, Lock, LogIn, Mail, Phone, Send, User as UserIcon, UserPlus } from 'lucide-react';
import { useApp, type AuthResult } from './AppProvider';
import { LangToggle, primaryBtn } from './ui';
import LegalModal, { type LegalDoc } from './LegalModal';
import { BUILTIN_ADMIN_ID, MIN_PASSWORD_LENGTH, isValidBdMobile, isValidEmail } from '@/lib/auth';

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

type Mode = 'login' | 'otp' | 'signup' | 'forgot';

export default function LoginScreen() {
  const { t, authenticate, register } = useApp();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [legal, setLegal] = useState<LegalDoc | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { setShowVideo(canPlayVideo()); }, []);

  // Start the background video ourselves. Browsers only autoplay muted video, and React
  // doesn't always set `muted` before the browser decides, so the video can stay paused.
  // If autoplay is still blocked, start it on the first tap or key press instead.
  useEffect(() => {
    const video = videoRef.current;
    if (!showVideo || !video) return;
    video.muted = true;
    video.defaultMuted = true;

    const play = () => {
      if (video.paused) video.play().catch(() => {});
    };
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    const onInteract = () => {
      play();
      events.forEach(e => window.removeEventListener(e, onInteract));
    };
    events.forEach(e => window.addEventListener(e, onInteract, { passive: true }));
    // Resume after switching back to this tab or returning with the Back button.
    const onVisible = () => { if (document.visibilityState === 'visible') play(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', play);
    video.addEventListener('canplay', play);
    play();

    return () => {
      events.forEach(e => window.removeEventListener(e, onInteract));
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', play);
      video.removeEventListener('canplay', play);
    };
  }, [showVideo]);

  const phoneDigits = phone.replace(/\D/g, '').replace(/^(880|0)/, '');

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setSentCode(null);
    setOtp('');
    setResetSent(false);
    setShowPassword(false);
  };

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

  /** Shows the right message for a failed sign-in. */
  const showResult = (result: AuthResult) => {
    if (result === 'blocked') {
      setError(t('This account has been blocked by an administrator.', 'এই অ্যাকাউন্টটি অ্যাডমিন বন্ধ করে রেখেছেন।'));
    } else if (result === 'wrong-password') {
      setError(t('Incorrect password.', 'পাসওয়ার্ড সঠিক নয়।'));
    } else if (result === 'exists') {
      setError(t('An account with this email already exists. Please log in.', 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে। লগইন করুন।'));
    }
  };

  const run = async (attempt: () => Promise<AuthResult>) => {
    setBusy(true);
    setError('');
    try {
      showResult(await attempt());
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = () => {
    if (otp !== sentCode) {
      setError(t('That code is not correct. Check the 6-digit code and try again.', 'কোডটি সঠিক নয়। ৬ সংখ্যার কোডটি আবার দেখে দিন।'));
      return;
    }
    run(() => authenticate({ kind: 'phone', phoneDigits }));
  };

  // Demo: replace these with real OAuth flows.
  const googleLogin = () => run(() => authenticate({ kind: 'social', provider: 'google' }));
  const appleLogin = () => run(() => authenticate({ kind: 'social', provider: 'apple' }));

  /** Returns the cleaned email, or null after setting an error. */
  const checkEmail = (): string | null => {
    const mail = email.trim().toLowerCase();
    if (!isValidEmail(mail)) {
      setError(t('Please enter a valid email address.', 'সঠিক ইমেইল ঠিকানা দিন।'));
      return null;
    }
    return mail;
  };

  const emailLogin = () => {
    if (!email.trim() || !password) {
      setError(t('Please enter both email and password.', 'ইমেইল ও পাসওয়ার্ড দুটোই দিন।'));
      return;
    }
    // The built-in admin signs in with the ID "admin" instead of an email.
    const isAdminId = email.trim().toLowerCase() === BUILTIN_ADMIN_ID;
    if (!isAdminId && !checkEmail()) return;
    run(() => authenticate({ kind: 'password', identifier: email, password }));
  };

  const signUp = () => {
    if (!name.trim()) {
      setError(t('Please enter your name.', 'আপনার নাম দিন।'));
      return;
    }
    const mail = checkEmail();
    if (!mail) return;
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('Password must be at least 6 characters.', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'));
      return;
    }
    run(() => register(name, mail, password));
  };

  const sendReset = () => {
    if (!checkEmail()) return;
    // Demo: no email service yet.
    setError('');
    setResetSent(true);
  };

  const titles: Record<Mode, string> = {
    login: t('Log in to Field Shift', 'ফিল্ড শিফটে লগইন করুন'),
    otp: t('Log in with verification code', 'যাচাই কোড দিয়ে লগইন'),
    signup: t('Create your account', 'নতুন অ্যাকাউন্ট খুলুন'),
    forgot: t('Reset your password', 'পাসওয়ার্ড রিসেট করুন'),
  };

  const linkBtn = 'text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors';
  const socialBtn =
    'btn-popup min-h-tap w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl glass-subtle border border-sky-500/25 hover:border-sky-500/50 font-bold text-sm';

  const emailField = (
    <label className={fieldBox}>
      <Mail className="h-4 w-4 text-sky-500" />
      <input
        type="text"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        autoComplete={mode === 'signup' ? 'email' : 'username'}
        aria-label={t('Email', 'ইমেইল')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('Enter your email', 'আপনার ইমেইল দিন')}
        className={fieldInput}
      />
    </label>
  );

  const passwordField = (
    <div className={fieldBox}>
      <KeyRound className="h-4 w-4 text-sky-500" />
      <input
        type={showPassword ? 'text' : 'password'}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        aria-label={t('Password', 'পাসওয়ার্ড')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('Enter your password', 'আপনার পাসওয়ার্ড দিন')}
        className={fieldInput}
      />
      <button
        type="button"
        onClick={() => setShowPassword(v => !v)}
        className="shrink-0 p-1 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
        aria-label={showPassword ? t('Hide password', 'পাসওয়ার্ড লুকান') : t('Show password', 'পাসওয়ার্ড দেখান')}
        aria-pressed={showPassword}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100">
      <div className="fs-login-fallback" aria-hidden />
      {showVideo && (
        <video
          ref={videoRef}
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
        <div className="fs-login-card rounded-4xl p-8 lg:p-10 w-full max-w-md space-y-5 card-popup">
          <div className="text-center space-y-3">
            <img src="/logo-sm.png" alt="Field Shift logo" className="h-16 w-16 rounded-full object-cover shadow-xl mx-auto ring-4 ring-white/40" />
            <h2 className="text-2xl font-black tracking-tight">{titles[mode]}</h2>
          </div>

          {error && (
            <div role="alert" className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Email + password log in */}
          {mode === 'login' && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); emailLogin(); }}>
              {emailField}
              {passwordField}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => switchMode('forgot')} className={linkBtn}>
                  {t('Forgot password', 'পাসওয়ার্ড ভুলে গেছেন')}
                </button>
                <button type="button" onClick={() => switchMode('otp')} className={`${linkBtn} text-right`}>
                  {t('Login with verification code', 'যাচাই কোড দিয়ে লগইন')}
                </button>
              </div>
              <button
                type="submit"
                disabled={busy || !email.trim() || !password}
                className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
              >
                <LogIn className="h-4 w-4" />
                <span>{busy ? t('Logging in…', 'লগইন হচ্ছে…') : t('Log in', 'লগইন')}</span>
              </button>
            </form>
          )}

          {/* Phone + OTP log in */}
          {mode === 'otp' && (
            <section className="space-y-3">
              <label className={fieldBox}>
                <Phone className="h-4 w-4 text-sky-500" />
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
                <button type="button" onClick={sendOtp} className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 ${primaryBtn}`}>
                  <Send className="h-4 w-4" />
                  <span>{t('Send code', 'কোড পাঠান')}</span>
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
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={busy || otp.length !== 6}
                      className={`flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>{t('Log in', 'লগইন')}</span>
                    </button>
                  </div>
                </>
              )}
              <div className="text-center">
                <button type="button" onClick={() => switchMode('login')} className={linkBtn}>
                  {t('Login with password', 'পাসওয়ার্ড দিয়ে লগইন')}
                </button>
              </div>
            </section>
          )}

          {/* Sign up */}
          {mode === 'signup' && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); signUp(); }}>
              <label className={fieldBox}>
                <UserIcon className="h-4 w-4 text-sky-500" />
                <input
                  type="text"
                  autoComplete="name"
                  aria-label={t('Full name', 'পূর্ণ নাম')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('Enter your name', 'আপনার নাম দিন')}
                  className={fieldInput}
                />
              </label>
              {emailField}
              {passwordField}
              <button
                type="submit"
                disabled={busy || !name.trim() || !email.trim() || !password}
                className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
              >
                <UserPlus className="h-4 w-4" />
                <span>{t('Sign up', 'নিবন্ধন করুন')}</span>
              </button>
            </form>
          )}

          {/* Forgot password */}
          {mode === 'forgot' && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); sendReset(); }}>
              {resetSent ? (
                <div role="status" className="text-sm flex items-start gap-1.5 rounded-lg px-3 py-2 bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-200">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    {t('Demo mode — email is not connected yet. In the full app, a reset link would be sent to ',
                       'ডেমো মোড — ইমেইল এখনো যুক্ত নয়। পূর্ণ সংস্করণে রিসেট লিংক পাঠানো হবে ')}
                    <strong>{email.trim()}</strong>
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
                    {t('Enter your email and we will send you a link to reset your password.',
                       'আপনার ইমেইল দিন, পাসওয়ার্ড রিসেট করার লিংক পাঠানো হবে।')}
                  </p>
                  {emailField}
                  <button
                    type="submit"
                    disabled={!email.trim()}
                    className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
                  >
                    <Send className="h-4 w-4" />
                    <span>{t('Send reset link', 'রিসেট লিংক পাঠান')}</span>
                  </button>
                </>
              )}
              <div className="text-center">
                <button type="button" onClick={() => switchMode('login')} className={linkBtn}>
                  {t('Back to log in', 'লগইনে ফিরে যান')}
                </button>
              </div>
            </form>
          )}

          {/* Switch between log in and sign up */}
          {(mode === 'login' || mode === 'signup') && (
            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
              {mode === 'login'
                ? t("Don't have an account?", 'অ্যাকাউন্ট নেই?')
                : t('Already have an account?', 'আগেই অ্যাকাউন্ট আছে?')}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="font-bold underline underline-offset-2 text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400"
              >
                {mode === 'login' ? t('Sign up', 'নিবন্ধন করুন') : t('Log in', 'লগইন')}
              </button>
            </p>
          )}

          {mode !== 'forgot' && (
            <>
              <Divider label={t('or', 'অথবা')} />

              <div className="space-y-3">
                <button type="button" onClick={googleLogin} disabled={busy} className={`${socialBtn} disabled:opacity-60`}>
                  <GoogleLogo />
                  <span>{t('Continue with Google', 'গুগল দিয়ে চালিয়ে যান')}</span>
                </button>
                <button type="button" onClick={appleLogin} disabled={busy} className={`${socialBtn} disabled:opacity-60`}>
                  <AppleLogo />
                  <span>{t('Continue with Apple', 'অ্যাপল দিয়ে চালিয়ে যান')}</span>
                </button>
              </div>
            </>
          )}

          <p className="text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('By continuing, you agree to our ', 'চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের ')}
            <button type="button" onClick={() => setLegal('terms')} className="underline underline-offset-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400">{t('Terms of Service', 'সেবার শর্তাবলি')}</button>
            {t(' and ', ' এবং ')}
            <button type="button" onClick={() => setLegal('privacy')} className="underline underline-offset-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400">{t('Privacy Policy', 'গোপনীয়তা নীতি')}</button>
            {t('.', '-তে সম্মত হচ্ছেন।')}
          </p>
        </div>
      </main>

      {legal && <LegalModal doc={legal} onClose={() => setLegal(null)} />}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.37 12.73c-.03-2.65 2.16-3.92 2.26-3.99-1.23-1.8-3.15-2.05-3.83-2.08-1.63-.17-3.18.96-4.01.96-.83 0-2.1-.94-3.46-.91-1.78.03-3.42 1.04-4.34 2.63-1.85 3.21-.47 7.96 1.33 10.56.88 1.27 1.93 2.71 3.3 2.65 1.33-.05 1.83-.86 3.43-.86 1.6 0 2.05.86 3.45.83 1.43-.02 2.33-1.29 3.2-2.57 1.01-1.47 1.42-2.9 1.45-2.97-.03-.01-2.77-1.06-2.78-4.25zM13.73 4.94c.73-.89 1.23-2.12 1.09-3.35-1.05.04-2.33.7-3.08 1.59-.68.78-1.27 2.04-1.11 3.24 1.17.09 2.37-.6 3.1-1.48z" />
    </svg>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-grow border-t border-sky-500/15" />
      <span className="mx-4 text-slate-600 dark:text-slate-400 text-sm font-bold">{label}</span>
      <div className="flex-grow border-t border-sky-500/15" />
    </div>
  );
}
