import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/features/auth/login-form";
import { RegisterForm } from "@/features/auth/register-form";

type AuthMode = "login" | "register";

const TICKER_WORDS = ["THINK", "CREATE", "BUILD", "SHIP", "REPEAT"];

const STORY: Record<AuthMode, { eyebrow: string; headline: string; copy: string; ctaLabel: string; ctaMode: AuthMode }> = {
  login: {
    eyebrow: "ONE OF US",
    headline: "Good to see you again.",
    copy: "Sign in and pick the thread back up — your workspace is exactly how you left it.",
    ctaLabel: "Create account instead",
    ctaMode: "register",
  },
  register: {
    eyebrow: "NEW HERE",
    headline: "Join the studio.",
    copy: "Create an account and start shipping conversations with jimly in seconds.",
    ctaLabel: "Log in instead",
    ctaMode: "login",
  },
};

function Ticker() {
  const items = [...TICKER_WORDS, ...TICKER_WORDS];
  return (
    <div className="relative flex w-full overflow-hidden border-y border-white/10 py-2.5">
      <div className="flex w-max shrink-0 animate-marquee gap-6 pr-6">
        {items.map((word, i) => (
          <span key={i} className="flex items-center gap-6 text-xs font-medium tracking-[0.3em] text-white/40">
            {word}
            <Sparkles className="size-3 text-[var(--auth-accent)]" />
          </span>
        ))}
      </div>
    </div>
  );
}

function StoryPanel({ mode, onSwitch }: { mode: AuthMode; onSwitch: (mode: AuthMode) => void }) {
  const story = STORY[mode];
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[var(--auth-ink)] px-8 py-10 text-white sm:px-12 sm:py-14">
      {/* grain + glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full bg-[var(--auth-accent)] opacity-20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-[var(--auth-accent)] opacity-10 blur-[100px]" />

      <div className="relative z-10 flex items-center justify-between">
        <span className="font-sans text-sm font-semibold tracking-tight">jimly.ai</span>
        <span
          key={story.eyebrow}
          className="animate-in fade-in rounded-full border border-white/15 px-3 py-1 text-[0.65rem] font-medium tracking-[0.25em] text-white/50 duration-300"
        >
          {story.eyebrow}
        </span>
      </div>

      <div key={mode} className="animate-in fade-in slide-in-from-bottom-2 relative z-10 max-w-md duration-300">
        <h2 className="text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl">
          {story.headline}
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-white/55 sm:text-base">{story.copy}</p>
        <button
          type="button"
          onClick={() => onSwitch(story.ctaMode)}
          className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-[var(--auth-accent)] hover:bg-[var(--auth-accent)] hover:text-[var(--auth-ink)]"
        >
          {story.ctaLabel}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      <div className="relative z-10 hidden sm:block">
        <Ticker />
      </div>
    </div>
  );
}

function FormPanel({ mode, onSwitch }: { mode: AuthMode; onSwitch: (mode: AuthMode) => void }) {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-background px-8 py-14 sm:px-14">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex gap-1 rounded-full bg-muted p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSwitch(m)}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-medium transition-colors duration-300",
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <div key={mode} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Pick up right where you left off."
              : "Takes less than a minute, no card required."}
          </p>

          <div className="mt-7">
            {mode === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = ({ initialMode = "login" }: { initialMode?: AuthMode }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div
      className="relative flex h-screen w-screen flex-col overflow-y-auto md:flex-row md:overflow-y-hidden"
      style={
        {
          "--auth-ink": "#102A43",
          "--auth-accent": "#C49A45",
        } as React.CSSProperties
      }
    >
      <div className="h-auto w-full shrink-0 py-12 md:h-full md:w-1/2 md:py-0">
        <StoryPanel mode={mode} onSwitch={setMode} />
      </div>
      <div className="flex-1 md:w-1/2">
        <FormPanel mode={mode} onSwitch={setMode} />
      </div>
    </div>
  );
};
