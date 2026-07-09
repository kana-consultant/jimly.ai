import { memo } from 'react';
import { ArrowUpRight, ArrowLeft, Quote } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'login' | 'register';

const CONTENT = {
  login: {
    heading: 'Good to see you again.',
    body: 'Sign in and pick the thread back up — your workspace is exactly how you left it.',
    cta: { label: 'Create account instead', to: '/register' },
    quote: {
      text: '"Konstitusi bukan sekadar dokumen hukum mati, melainkan kesepakatan luhur yang hidup dan menuntun keadilan sebuah bangsa."',
      attr: '— Filosofi Hukum Tata Negara',
    },
  },
  register: {
    heading: 'Begin your legal research.',
    body: 'Create an account and start exploring precise constitutional insights and legal intelligence within seconds.',
    cta: { label: 'Log in instead', to: '/login' },
    quote: {
      text: '"Hukum dan konstitusi adalah infrastruktur dasar peradaban. Menegakkannya dengan akal budi berarti sedang merawat masa depan keadilan bangsa."',
      attr: '— Demokrasi & Hak Asasi Manusia',
    },
  },
};

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number];

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: EASE },
};

export const AuthLeftPanel = memo(function AuthLeftPanel({ mode }: { mode: Mode }) {
  const c = CONTENT[mode];
  return (
    <div className="h-auto w-full shrink-0 py-12 md:h-full md:w-1/2 md:py-0">
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-(--auth-ink) px-8 py-10 text-white sm:px-12 sm:py-14">
        {/* Static decorative layers */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full bg-(--auth-accent) opacity-20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-(--auth-accent) opacity-10 blur-[100px]" />
        <div
          className="pointer-events-none absolute bottom-0 right-0 z-0 h-[70%] max-w-[85%] select-none opacity-25 md:opacity-40"
          style={{
            maskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 100%)',
          }}
        >
          <img
            src="/jimly-profile.png"
            alt="Prof. Jimly Asshiddiqie"
            width={450}
            height={600}
            className="h-full w-auto object-contain object-bottom"
          />
        </div>

        {/* Static top bar */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="font-sans text-sm font-semibold tracking-tight text-(--auth-accent)">jimly.ai</span>
          <a
            href={import.meta.env.VITE_LANDING_URL || '/'}
            className="flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </a>
        </div>

        {/* Animated: heading, body, CTA */}
        <div className="relative z-10 max-w-md my-auto md:my-0 md:mt-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} {...fadeUp}>
              <h2 className="text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl">
                {c.heading}
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/55 sm:text-base">{c.body}</p>
              <Link
                to={c.cta.to}
                className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-(--auth-accent) hover:bg-(--auth-accent) hover:text-(--auth-ink)"
              >
                {c.cta.label}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animated: quote */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            {...fadeUp}
            className="relative z-10 hidden sm:block max-w-lg border-l-2 border-(--auth-accent)/40 pl-4 py-1"
          >
            <Quote className="size-5 text-(--auth-accent) opacity-60 mb-2" />
            <p className="text-xs italic font-light tracking-wide text-white/70 leading-relaxed">
              {c.quote.text}
            </p>
            <span className="block mt-2 text-[10px] uppercase tracking-widest text-white/40 font-medium">
              {c.quote.attr}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});
