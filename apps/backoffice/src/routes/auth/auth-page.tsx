import React, { memo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { AuthLeftPanel } from '@/routes/auth/_components/auth-left-panel';
import { AuthForm } from '@/routes/auth/_components/auth-form';

type Mode = 'login' | 'register';

const TABS: { key: Mode; label: string; to: string }[] = [
  { key: 'login', label: 'Log in', to: '/login' },
  { key: 'register', label: 'Sign up', to: '/register' },
];

const RIGHT_CONTENT = {
  login:    { heading: 'Welcome back',        sub: 'Pick up right where you left off.' },
  register: { heading: 'Create your account', sub: 'Takes less than a minute, no card required.' },
};

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number];

const fadeTiny = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.22, ease: EASE },
};

const SegmentedControl = memo(function SegmentedControl({ mode }: { mode: Mode }) {
  return (
    <LayoutGroup id="auth-tabs">
      <div className="mb-8 flex gap-1 rounded-full bg-muted p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            to={tab.to}
            className="relative flex-1 rounded-full py-2 text-center text-sm font-medium"
          >
            {mode === tab.key && (
              <motion.span
                layoutId="auth-tab-pill"
                className="absolute inset-0 rounded-full bg-background shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span
              className={
                mode === tab.key
                  ? 'relative z-10 text-foreground'
                  : 'relative z-10 text-muted-foreground transition-colors hover:text-foreground'
              }
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </LayoutGroup>
  );
});

export function AuthPage({ mode }: { mode: Mode }) {
  const rc = RIGHT_CONTENT[mode];
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="relative flex h-dvh w-full flex-col overflow-y-auto md:flex-row md:overflow-y-hidden"
      style={{ '--auth-ink': '#102A43', '--auth-accent': '#C49A45' } as React.CSSProperties}
    >
      {/* Left panel — permanently mounted, never remounts */}
      <AuthLeftPanel mode={mode} />

      {/* Right panel */}
      <div className="flex-1 md:w-1/2">
        <div className="flex h-full w-full flex-col justify-center bg-background px-8 py-14 sm:px-14">
          <div className="mx-auto w-full max-w-sm">
            <SegmentedControl mode={mode} />

            {/* Animated heading / subtitle */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mode} {...fadeTiny} className="mb-7">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {rc.heading}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">{rc.sub}</p>
              </motion.div>
            </AnimatePresence>

            {/* Form — email/password always mounted */}
            <AuthForm mode={mode} />

            <p className="mt-12 text-center text-[11px] text-muted-foreground/60">
              &copy; {new Date().getFullYear()} jimly.ai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
