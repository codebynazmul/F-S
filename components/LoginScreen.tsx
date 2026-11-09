'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'motion/react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Info, KeyRound, Lock, LogIn, Mail, Save, Send, User as UserIcon, UserPlus } from 'lucide-react';
import type { AuthError } from '@supabase/supabase-js';
import { useApp } from './AppProvider';
import { LangToggle, primaryBtn } from './ui';
import LegalModal, { type LegalDoc } from './LegalModal';
import { MIN_PASSWORD_LENGTH, isValidEmail } from '@/lib/auth';
import { redirectUrl, supabase } from '@/lib/supabase';

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

const fieldBox = 'fs-field min-h-tap flex items-center gap-2.5 rounded-xl px-3.5 py-2.5';
const fieldInput =
  'w-full bg-transparent outline-none text-[0.9375rem] text-slate-900 dark:text-white placeholder:text-slate-400';

type Mode = 'login' | 'code' | 'signup' | 'forgot';

const easeOut = [0.22, 1, 0.36, 1] as const;

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const heroRise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const swap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
} as const;

const alertMotion = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: 'auto', marginTop: 20, transition: { duration: 0.22, ease: easeOut } },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.15, ease: 'easeIn' } },
} as const;

export default function LoginScreen() {
  const { t, authNotice, clearAuthNotice } = useApp();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState('');
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

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setInfo('');
    setCodeSent(false);
    setCode('');
    setShowPassword(false);
    clearAuthNotice();
  };

  /** Turns a Supabase error into a message for the person. */
  const explain = (e: AuthError): string => {
    switch (e.code) {
      case 'invalid_credentials':
        return t('Incorrect email or password.', 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
      case 'email_not_confirmed':
        return t('Please confirm your email first. Check your inbox for the link we sent.', 'আগে ইমেইল নিশ্চিত করুন। পাঠানো লিংকটি ইনবক্সে দেখুন।');
      case 'otp_expired':
        return t('That code is wrong or has expired. Request a new one.', 'কোডটি ভুল বা মেয়াদ শেষ। নতুন কোড নিন।');
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return t('Too many attempts. Please wait a minute and try again.', 'অনেকবার চেষ্টা হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।');
      case 'weak_password':
        return t('Please choose a stronger password.', 'আরও শক্ত পাসওয়ার্ড দিন।');
      default:
        return e.message || t('Something went wrong. Please try again.', 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  /** Runs a Supabase call, showing its error if it fails. Returns true on success. */
  const run = async (attempt: () => Promise<AuthError | null>) => {
    setBusy(true);
    setError('');
    setInfo('');
    clearAuthNotice();
    try {
      const err = await attempt();
      if (err) setError(explain(err));
      return !err;
    } catch {
      setError(t('Could not reach the server. Check your internet connection.', 'সার্ভারে পৌঁছানো যায়নি। ইন্টারনেট সংযোগ দেখুন।'));
      return false;
    } finally {
      setBusy(false);
    }
  };

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
    const mail = checkEmail();
    if (!mail || !password) return;
    run(async () => (await supabase.auth.signInWithPassword({ email: mail, password })).error);
  };

  const sendCode = async () => {
    const mail = checkEmail();
    if (!mail) return;
    const ok = await run(async () => (await supabase.auth.signInWithOtp({
      email: mail,
      options: { shouldCreateUser: true, emailRedirectTo: redirectUrl() },
    })).error);
    if (ok) {
      setCodeSent(true);
      setInfo(t(`We sent a sign-in code to ${mail}. It also contains a link you can tap instead.`,
                `${mail} ঠিকানায় একটি কোড পাঠানো হয়েছে। চাইলে ইমেইলের লিংকেও ট্যাপ করতে পারেন।`));
    }
  };

  const verifyCode = () => {
    const mail = checkEmail();
    if (!mail || code.length < 6) return;
    run(async () => (await supabase.auth.verifyOtp({ email: mail, token: code, type: 'email' })).error);
  };

  const googleLogin = () =>
    run(async () => (await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl() } })).error);

  const signUp = async () => {
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
    let needsConfirm = false;
    let exists = false;
    const ok = await run(async () => {
      const { data, error: err } = await supabase.auth.signUp({
        email: mail,
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: redirectUrl() },
      });
      // Supabase hides whether an email is taken: an existing account comes back with no identities.
      exists = !!data.user && (data.user.identities?.length ?? 0) === 0;
      needsConfirm = !data.session;
      return err;
    });
    if (!ok) return;
    if (exists) {
      setError(t('An account with this email already exists. Please log in.', 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে। লগইন করুন।'));
    } else if (needsConfirm) {
      setInfo(t(`Almost done! We sent a confirmation link to ${mail}. Open it to finish signing up.`,
                `প্রায় শেষ! ${mail} ঠিকানায় একটি নিশ্চিতকরণ লিংক পাঠানো হয়েছে। নিবন্ধন শেষ করতে লিংকটি খুলুন।`));
    }
  };

  const sendReset = async () => {
    const mail = checkEmail();
    if (!mail) return;
    const ok = await run(async () => (await supabase.auth.resetPasswordForEmail(mail, { redirectTo: redirectUrl() })).error);
    if (ok) {
      setInfo(t(`If an account exists for ${mail}, we sent it a link to reset the password.`,
                `${mail} ঠিকানায় অ্যাকাউন্ট থাকলে পাসওয়ার্ড রিসেটের লিংক পাঠানো হয়েছে।`));
    }
  };

  const notice =
    authNotice === 'blocked'
      ? t('This account has been blocked by an administrator.', 'এই অ্যাকাউন্টটি অ্যাডমিন বন্ধ করে রেখেছেন।')
      : authNotice === 'profile-error'
        ? t('Could not load your account. Check your internet connection and try again.', 'আপনার অ্যাকাউন্ট লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।')
        : '';
  const shownError = error || notice;

  const titles: Record<Mode, string> = {
    login: t('Log in to Field Shift', 'ফিল্ড শিফটে লগইন করুন'),
    code: t('Log in with an email code', 'ইমেইল কোড দিয়ে লগইন'),
    signup: t('Create your account', 'নতুন অ্যাকাউন্ট খুলুন'),
    forgot: t('Reset your password', 'পাসওয়ার্ড রিসেট করুন'),
  };

  const linkBtn = 'min-h-tap text-sm font-medium text-sky-700 dark:text-sky-300 hover:underline underline-offset-4 transition-colors';
  const socialBtn =
    'btn-popup min-h-tap w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-[var(--bg-surface)] border border-sky-600/15 hover:border-sky-600/40 font-medium text-sm';

  const emailField = (
    <label className={fieldBox}>
      <Mail className="h-4 w-4 text-slate-400" />
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
      <KeyRound className="h-4 w-4 text-slate-400" />
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
        <motion.span
          key={showPassword ? 'hide' : 'show'}
          className="block"
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.3, visualDuration: 0.25 }}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </motion.span>
      </button>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] font-sans antialiased text-slate-900 dark:text-slate-100">
      <motion.section initial="hidden" animate="show" variants={heroStagger} className="fs-login-media min-h-[40vh] lg:min-h-screen lg:sticky lg:top-0 flex flex-col justify-between gap-8 p-5 sm:p-8 lg:p-12 text-white">
        {showVideo && (
          <video
            ref={videoRef}
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
        <motion.div variants={heroRise} className="fs-login-media-copy flex items-center gap-3">
          <img src="/logo-sm.png" alt="" className="h-10 w-10 rounded-xl object-cover" />
          <span className="fs-display text-xl">{t('Field Shift', 'ফিল্ড শিফট')}</span>
        </motion.div>
        <motion.div variants={heroStagger} className="fs-login-media-copy max-w-xl space-y-4">
          <motion.h1 variants={heroRise} className="fs-display text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] text-white">
            {t('Crop rotations that use less water, for farms in Bangladesh.', 'কম পানিতে ফসল পর্যায়ক্রম, বাংলাদেশের খামারের জন্য।')}
          </motion.h1>
          <motion.p variants={heroRise} className="text-[0.9375rem] lg:text-base text-white/85 max-w-md leading-relaxed">
            {t('All 64 districts, with NASA POWER climate data, in Bangla and English.', '৬৪টি জেলা, নাসা POWER জলবায়ু তথ্যসহ, বাংলা ও ইংরেজিতে।')}
          </motion.p>
        </motion.div>
      </motion.section>

      <main className="fs-login-panel flex flex-col lg:min-h-screen">
        <div className="flex justify-end px-5 pt-5 sm:px-8 lg:px-12 lg:pt-8">
          <LangToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[400px] space-y-5 card-popup">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2 key={mode} {...swap} className="fs-display text-[1.75rem] lg:text-[2rem]">{titles[mode]}</motion.h2>
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {shownError && (
              <motion.div key="error" {...alertMotion} style={{ overflow: 'hidden' }}>
                <div role="alert" className="text-sm text-red-700 dark:text-red-300 bg-red-500/[0.06] border border-red-500/25 rounded-xl px-3.5 py-2.5">
                  {shownError}
                </div>
              </motion.div>
            )}
            {info && (
              <motion.div key="info" {...alertMotion} style={{ overflow: 'hidden' }}>
                <div role="status" className="text-sm flex items-start gap-1.5 rounded-xl px-3.5 py-2.5 bg-sky-600/[0.06] border border-sky-600/20 text-sky-800 dark:text-sky-200">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{info}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} {...swap} className="space-y-5">

          {/* Email + password log in */}
          {mode === 'login' && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); emailLogin(); }}>
              {emailField}
              {passwordField}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => switchMode('forgot')} className={linkBtn}>
                  {t('Forgot password', 'পাসওয়ার্ড ভুলে গেছেন')}
                </button>
                <button type="button" onClick={() => switchMode('code')} className={`${linkBtn} text-right`}>
                  {t('Email me a code instead', 'পাসওয়ার্ড ছাড়া, ইমেইল কোডে লগইন')}
                </button>
              </div>
              <button
                type="submit"
                disabled={busy || !email.trim() || !password}
                className={`w-full py-3 rounded-xl text-[0.9375rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
              >
                <LogIn className="h-4 w-4" />
                <span>{busy ? t('Logging in…', 'লগইন হচ্ছে…') : t('Log in', 'লগইন')}</span>
              </button>
            </form>
          )}

          {/* Email code log in (also creates the account on first use) */}
          {mode === 'code' && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (codeSent) verifyCode(); else sendCode(); }}>
              <label className={fieldBox}>
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="email"
                  aria-label={t('Email', 'ইমেইল')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={codeSent}
                  placeholder={t('Enter your email', 'আপনার ইমেইল দিন')}
                  className={fieldInput}
                />
              </label>

              {!codeSent ? (
                <button type="submit" disabled={busy || !email.trim()}
                  className={`w-full py-3 rounded-xl text-[0.9375rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}>
                  <Send className="h-4 w-4" />
                  <span>{busy ? t('Sending…', 'পাঠানো হচ্ছে…') : t('Send code', 'কোড পাঠান')}</span>
                </button>
              ) : (
                <>
                  <label className={fieldBox}>
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-label={t('Code from the email', 'ইমেইলের কোড')}
                      maxLength={8}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder={t('Code from the email', 'ইমেইলের কোড')}
                      className={`${fieldInput} tracking-widest`}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setCodeSent(false); setCode(''); setError(''); setInfo(''); }}
                      className="btn-popup min-h-tap min-w-tap px-3 rounded-xl border border-sky-600/15 bg-[var(--bg-surface)] text-sm font-medium flex items-center justify-center gap-1"
                      aria-label={t('Change email', 'ইমেইল পরিবর্তন')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={busy || code.length < 6}
                      className={`flex-1 py-3 rounded-xl text-[0.9375rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>{busy ? t('Checking…', 'যাচাই হচ্ছে…') : t('Log in', 'লগইন')}</span>
                    </button>
                  </div>
                  <button type="button" onClick={sendCode} disabled={busy} className={`${linkBtn} w-full text-center`}>
                    {t('Send a new code', 'নতুন কোড পাঠান')}
                  </button>
                </>
              )}
              <div className="text-center">
                <button type="button" onClick={() => switchMode('login')} className={linkBtn}>
                  {t('Login with password', 'পাসওয়ার্ড দিয়ে লগইন')}
                </button>
              </div>
            </form>
          )}

          {/* Sign up */}
          {mode === 'signup' && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); signUp(); }}>
              <label className={fieldBox}>
                <UserIcon className="h-4 w-4 text-slate-400" />
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
                className={`w-full py-3 rounded-xl text-[0.9375rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
              >
                <UserPlus className="h-4 w-4" />
                <span>{busy ? t('Creating account…', 'অ্যাকাউন্ট খোলা হচ্ছে…') : t('Sign up', 'নিবন্ধন করুন')}</span>
              </button>
            </form>
          )}

          {/* Forgot password */}
          {mode === 'forgot' && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); sendReset(); }}>
              {!info && (
                <>
                  <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
                    {t('Enter your email and we will send you a link to reset your password.',
                       'আপনার ইমেইল দিন, পাসওয়ার্ড রিসেট করার লিংক পাঠানো হবে।')}
                  </p>
                  {emailField}
                  <button
                    type="submit"
                    disabled={busy || !email.trim()}
                    className={`w-full py-3 rounded-xl text-[0.9375rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
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
                className="min-h-tap font-medium text-sky-700 dark:text-sky-300 underline underline-offset-4"
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
              </div>
            </>
          )}
          </motion.div>
          </AnimatePresence>

          <motion.p layout="position" className="text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('By continuing, you agree to our ', 'চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের ')}
            <button type="button" onClick={() => setLegal('terms')} className="underline underline-offset-2 text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300">{t('Terms of Service', 'সেবার শর্তাবলি')}</button>
            {t(' and ', ' এবং ')}
            <button type="button" onClick={() => setLegal('privacy')} className="underline underline-offset-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400">{t('Privacy Policy', 'গোপনীয়তা নীতি')}</button>
            {t('.', '-তে সম্মত হচ্ছেন।')}
          </motion.p>
        </div>
        </div>
      </main>

      <AnimatePresence>
        {legal && <LegalModal key="legal" doc={legal} onClose={() => setLegal(null)} />}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}

/** Shown after someone opens a password-reset link: they choose a new password here. */
export function NewPasswordScreen() {
  const { t, finishPasswordRecovery } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('Password must be at least 6 characters.', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'));
      return;
    }
    if (password !== confirm) {
      setError(t('The two passwords do not match.', 'পাসওয়ার্ড দুটি মেলেনি।'));
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.code === 'same_password'
        ? t('Choose a password different from your old one.', 'পুরোনোটির থেকে আলাদা পাসওয়ার্ড দিন।')
        : err.message);
      return;
    }
    setError('');
    setDone(true);
  };

  const input = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <label htmlFor={id} className={fieldBox}>
      <KeyRound className="h-4 w-4 text-slate-400" />
      <input id={id} type="password" autoComplete="new-password" aria-label={label} placeholder={label}
        value={value} onChange={(e) => onChange(e.target.value)} className={fieldInput} />
    </label>
  );

  return (
    <div className="fs-login-panel min-h-screen flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100">
      <main className="flex-1 flex items-center justify-center p-5 lg:p-12">
        <div className="glass rounded-[var(--radius-card)] p-6 sm:p-10 w-full max-w-md space-y-5 card-popup">
          <div className="space-y-4">
            <img src="/logo-sm.png" alt="Field Shift logo" className="h-11 w-11 rounded-xl object-cover" />
            <h1 className="fs-display text-[1.75rem]">{t('Choose a new password', 'নতুন পাসওয়ার্ড দিন')}</h1>
          </div>

          {error && (
            <div role="alert" className="text-sm text-red-700 dark:text-red-300 bg-red-500/[0.06] border border-red-500/25 rounded-xl px-3.5 py-2.5">{error}</div>
          )}

          {done ? (
            <div className="space-y-4">
              <div role="status" className="text-sm flex items-center gap-2 text-emerald-800 dark:text-emerald-300 bg-emerald-500/[0.07] border border-emerald-500/25 rounded-xl px-3.5 py-2.5">
                <CheckCircle2 className="h-4 w-4" />{t('Your password has been changed.', 'আপনার পাসওয়ার্ড পরিবর্তন হয়েছে।')}
              </div>
              <button type="button" onClick={finishPasswordRecovery}
                className={`w-full py-3 rounded-xl text-[0.9375rem] flex items-center justify-center gap-2 ${primaryBtn}`}>
                <LogIn className="h-4 w-4" />{t('Continue to Field Shift', 'ফিল্ড শিফটে যান')}
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
              {input('np-new', t('New password', 'নতুন পাসওয়ার্ড'), password, setPassword)}
              {input('np-confirm', t('Confirm new password', 'নতুন পাসওয়ার্ড আবার দিন'), confirm, setConfirm)}
              <button type="submit" disabled={busy || !password || !confirm}
                className={`w-full py-3 rounded-xl text-[0.9375rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}>
                <Save className="h-4 w-4" />{busy ? t('Saving…', 'সংরক্ষণ হচ্ছে…') : t('Save new password', 'নতুন পাসওয়ার্ড সংরক্ষণ')}
              </button>
            </form>
          )}
        </div>
      </main>
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

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-grow border-t border-sky-600/10" />
      <span className="mx-4 text-slate-500 dark:text-slate-400 text-sm">{label}</span>
      <div className="flex-grow border-t border-sky-600/10" />
    </div>
  );
}
