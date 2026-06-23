import { Button } from "@/components/ui/button"

import { CountUp } from "./count-up"
import { Reveal } from "./reveal"

export function HeroSection({ photoSrc }: { photoSrc: string }) {
  return (
    <div className="bg-card shadow-sm" id="about">
      <Reveal className="mx-auto grid max-w-275 grid-cols-1 items-center gap-12 px-10 py-22 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="mx-auto w-full max-w-100 my-6">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
            <img src={photoSrc} alt="Prof. Dr. H. Jimly Asshiddiqie" className="size-full object-cover" />
            
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-card to-transparent pointer-events-none" />
          </div>
        </div>
        
        <div>
          <h1 className="mb-5 font-sans text-[clamp(34px,4vw,56px)] leading-[1.1] font-semibold tracking-tight text-primary">
            Ask Indonesian law.
            <br />
            Answered by <em className="font-normal text-chart-5 italic">Prof. Jimly</em>&apos;s lifetime of
            scholarship.
          </h1>
          <p className="mb-8 max-w-140 text-[15px] leading-loose text-muted-foreground">
            jimly.ai is an AI legal assistant trained exclusively on the work of Prof. Dr. H. Jimly
            Asshiddiqie &nbsp;founding Chief Justice of Indonesia&apos;s Constitutional Court and the nation&apos;s
            foremost constitutional scholar. Every answer traces back to his 70+ books, so you get guidance as
            authoritative as the source it&apos;s built on.
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              size="lg"
              className="h-auto px-6 py-2.75 text-sm"
              nativeButton={false}
              render={<a href="/register" />}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-auto px-6 py-2.75 text-sm"
              nativeButton={false}
              render={<a href="#demo" />}
            >
              Demo
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  )
}