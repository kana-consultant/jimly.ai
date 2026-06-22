import { Button } from "@/components/ui/button"

import { ChatDemo } from "./chat-demo"

export function HeroSection() {
  return (
    <div className="border-b border-border bg-card">
      <section className="mx-auto max-w-275 px-10 pt-20 pb-16 text-center">
        <h1 className="mb-5.5 font-display text-[clamp(48px,6vw,76px)] leading-[1.1] font-semibold tracking-tight text-primary">
          Ask anything about
          <br />
          Indonesian Law. Get <em className="font-normal text-secondary italic">sourced</em>
          <br />
          answers.
        </h1>
        <p className="mx-auto mb-9 max-w-135 text-base leading-relaxed text-muted-foreground">
          jimly.ai draws directly from Prof. Dr. H. Jimly Asshiddiqie&apos;s 60+ books  Indonesia&apos;s most
          authoritative body of constitutional scholarship.
        </p>
        <div className="mb-15 flex items-center justify-center gap-2.5">
          <Button
            size="lg"
            className="h-auto px-6 py-2.75 text-sm"
            nativeButton={false}
            render={<a href="/register" />}
          >
            Get Started →
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-auto px-6 py-2.75 text-sm"
            nativeButton={false}
            render={<a href="#about" />}
          >
            About Prof. Jimly
          </Button>
        </div>
        <ChatDemo />
      </section>
    </div>
  )
}
