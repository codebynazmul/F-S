'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'motion/react';
import { ArrowRight, CircleCheck, Droplets, Globe, MapPin, ShieldCheck, Sprout } from 'lucide-react';
import { useApp } from './AppProvider';
import { LangToggle } from './ui';
import LegalModal, { type LegalDoc } from './LegalModal';

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

const easeOut = [0.22, 1, 0.36, 1] as const;

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const heroRise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

/** First screen for new visitors. No account needed: everything is kept on this device. */
export default function WelcomeScreen() {
  const { t, user, getStarted } = useApp();
  const returning = !!user;
  const [showSteps, setShowSteps] = useState(false);
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

  const steps = [
    { icon: MapPin, title: t('Pick your district', 'আপনার জেলা বাছুন'), text: t('Any of the 64 districts of Bangladesh.', 'বাংলাদেশের ৬৪টি জেলার যেকোনোটি।') },
    { icon: Droplets, title: t('Add your soil and water', 'মাটি ও পানির তথ্য দিন'), text: t('Soil type, pH and how you irrigate.', 'মাটির ধরন, pH ও সেচের উপায়।') },
    { icon: Sprout, title: t('Get your crop plan', 'ফসল পরিকল্পনা পান'), text: t('A rotation that uses less water and urea.', 'কম পানি ও ইউরিয়ায় ফসল পর্যায়ক্রম।') },
  ];

  const focusRing = 'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

  return (
    <MotionConfig reducedMotion="user">
    <div className="fs-login-media fs-login-full min-h-screen flex flex-col font-sans antialiased text-white">
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
      <main className="fs-login-media-copy flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 lg:px-16 lg:pt-8">
          <div className="flex items-center gap-3">
            <img src="/logo-sm.png" alt="" className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white/30" />
            <span className="fs-display text-xl sm:text-2xl">{t('Agro Cosmic Weave', 'অ্যাগ্রো কসমিক উইভ')}</span>
          </div>
          <LangToggle />
        </div>
        <div className="flex-1 flex items-center px-5 py-10 sm:px-8 lg:px-16">
          <motion.div initial="hidden" animate="show" variants={heroStagger} className="w-full max-w-[600px] space-y-7">
            <motion.p variants={heroRise} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-white/15 border border-white/25 backdrop-blur-sm text-white">
              <Globe className="h-4 w-4 shrink-0" aria-hidden />
              {t('64 districts · NASA POWER · MODIS · SMAP · NASADEM', '৬৪ জেলা · নাসা POWER · MODIS · SMAP · NASADEM')}
            </motion.p>

            <motion.h1 variants={heroRise} className="fs-display text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] text-white [text-wrap:balance] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {t('Your land, your crops, smarter planning.', 'আপনার জমি, আপনার ফসল, আরও ভালো পরিকল্পনা।')}
            </motion.h1>

            <motion.p variants={heroRise} className="text-base sm:text-lg leading-relaxed text-white/85 max-w-[34rem]">
              {t(
                "See your district's climate and soil, then plan your crop order season by season. Compare a plan that uses less water and keeps soil healthy with what you grow today.",
                'আপনার জেলার জলবায়ু ও মাটি দেখুন, তারপর মৌসুম ধরে ফসলের ক্রম ঠিক করুন। যা এখন চাষ করছেন তার সাথে কম পানি লাগে ও মাটি ভালো রাখে এমন পরিকল্পনা মিলিয়ে দেখুন।',
              )}
            </motion.p>

            <motion.div variants={heroRise} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => getStarted('')}
                className={`group min-h-[56px] px-7 rounded-xl text-base font-semibold flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-600/30 btn-popup bg-sky-700 hover:bg-sky-800 text-white shadow-[0_8px_18px_-10px_rgb(var(--sky-700)/0.7)]`}
              >
                <span>{returning ? t('Continue', 'চালিয়ে যান') : t('Get Started', 'শুরু করুন')}</span>
                <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setShowSteps(v => !v)}
                aria-expanded={showSteps}
                aria-controls="welcome-steps"
                className="min-h-[56px] px-7 rounded-xl text-base font-semibold flex items-center justify-center gap-2 cursor-pointer border border-white/70 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-600/30"
              >
                {t('See how it works', 'কীভাবে কাজ করে দেখুন')}
              </button>
            </motion.div>

            <AnimatePresence initial={false}>
              {showSteps && (
                <motion.ol
                  id="welcome-steps"
                  key="steps"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease: easeOut } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  className="grid sm:grid-cols-3 gap-3 overflow-hidden"
                  aria-label={t('How it works', 'কীভাবে কাজ করে')}
                >
                  {steps.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <li key={i} className="rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md p-4 space-y-2">
                        <span className="h-9 w-9 rounded-xl flex items-center justify-center bg-white/15 text-harvest-300">
                          <Icon className="h-[18px] w-[18px]" aria-hidden />
                        </span>
                        <span className="block text-xs font-semibold text-harvest-300">
                          {t(`Step ${i + 1}`, `ধাপ ${(i + 1).toLocaleString('bn-BD')}`)}
                        </span>
                        <span className="block text-[0.9375rem] font-semibold leading-snug">{s.title}</span>
                        <span className="block text-sm text-white/75 leading-relaxed">{s.text}</span>
                      </li>
                    );
                  })}
                </motion.ol>
              )}
            </AnimatePresence>

            <motion.div variants={heroRise} className="space-y-2 text-sm text-white/80">
              <p className="flex items-start gap-2">
                <CircleCheck className="h-4 w-4 shrink-0 mt-0.5 text-harvest-300" aria-hidden />
                <span>{t('It does not replace your own experience. It is a guide to support your decisions.', 'এটি আপনার নিজের অভিজ্ঞতার বিকল্প নয়। এটি আপনার সিদ্ধান্তে সহায়তার একটি গাইড।')}</span>
              </p>
              <p className="flex items-start gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-white/60" aria-hidden />
                <span>
                {t('Your farm details stay on this device. By continuing, you agree to our ', 'আপনার খামারের তথ্য এই ডিভাইসেই থাকে। চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের ')}
                <button type="button" onClick={() => setLegal('terms')} className={`underline underline-offset-2 text-white hover:text-harvest-300 cursor-pointer ${focusRing}`}>{t('Terms of Service', 'সেবার শর্তাবলি')}</button>
                {t(' and ', ' এবং ')}
                <button type="button" onClick={() => setLegal('privacy')} className={`underline underline-offset-2 text-white hover:text-harvest-300 cursor-pointer ${focusRing}`}>{t('Privacy Policy', 'গোপনীয়তা নীতি')}</button>
                {t('.', '-তে সম্মত হচ্ছেন।')}
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {legal && <LegalModal key="legal" doc={legal} onClose={() => setLegal(null)} />}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}
