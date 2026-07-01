import { ArrowUpRight, ArrowLeft, Quote } from 'lucide-react';
import { RegisterForm } from '@/features/auth/form/register-form';

function QuoteBlock() {
  return (
    <div className="relative z-10 hidden sm:block max-w-lg border-l-2 border-(--auth-accent)/40 pl-4 py-1">
      <Quote className="size-5 text-(--auth-accent) opacity-60 mb-2" />
      <p className="text-xs italic font-light tracking-wide text-white/70 leading-relaxed">
        "Hukum dan konstitusi adalah infrastruktur dasar peradaban. Menegakkannya dengan akal budi berarti
        sedang merawat masa depan keadilan bangsa."
      </p>
      <span className="block mt-2 text-[10px] uppercase tracking-widest text-white/40 font-medium">
        — Demokrasi &amp; Hak Asasi Manusia
      </span>
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="h-auto w-full shrink-0 py-12 md:h-full md:w-1/2 md:py-0">
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-(--auth-ink) px-8 py-10 text-white sm:px-12 sm:py-14">
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

        <div className="relative z-10 max-w-md my-auto md:my-0 md:mt-20">
          <h2 className="text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl">
            Begin your legal research.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-white/55 sm:text-base">
            Create an account and start exploring precise constitutional insights and legal intelligence
            within seconds.
          </p>
          <a
            href="/login"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-(--auth-accent) hover:bg-(--auth-accent) hover:text-(--auth-ink)"
          >
            Log in instead
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <QuoteBlock />
      </div>
    </div>
  );
}

function RightPanel() {
  return (
    <div className="flex-1 md:w-1/2">
      <div className="flex h-full w-full flex-col justify-center bg-background px-8 py-14 sm:px-14">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex gap-1 rounded-full bg-muted p-1">
            <a
              href="/login"
              className="flex-1 rounded-full py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </a>
            <span className="flex-1 rounded-full bg-background py-2 text-center text-sm font-medium text-foreground shadow-sm">
              Sign up
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Takes less than a minute, no card required.</p>

            <div className="mt-7">
              <RegisterForm />
            </div>
          </div>

          <p className="mt-12 text-center text-[11px] text-muted-foreground/60">
            &copy; {new Date().getFullYear()} jimly.ai. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterRoute() {
  return (
    <main
      className="relative flex h-dvh w-full flex-col overflow-y-auto md:flex-row md:overflow-y-hidden"
      style={{ '--auth-ink': '#102A43', '--auth-accent': '#C49A45' } as React.CSSProperties}
    >
      <LeftPanel />
      <RightPanel />
    </main>
  );
}
