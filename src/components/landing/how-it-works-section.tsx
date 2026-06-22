import { CheckCircle2, MessageSquare, Library } from "lucide-react"

import { Reveal } from "./reveal"

const STEPS = [
  {
    icon: MessageSquare,
    num: "STEP 01",
    title: "Ask your question",
    desc: "Type any question about Indonesian law, constitutional rights, or state administration  in Bahasa Indonesia or English.",
  },
  {
    icon: Library,
    num: "STEP 02",
    title: "AI searches the library",
    desc: "jimly.ai scans 60+ books and hundreds of academic papers to find the most relevant passages from Prof. Jimly's body of work.",
  },
  {
    icon: CheckCircle2,
    num: "STEP 03",
    title: "Get a sourced answer",
    desc: "Receive a precise answer with the exact book title and chapter cited  so you always know where the knowledge comes from.",
  },
]

export function HowItWorksSection() {
  return (
    <div className="border-y border-border bg-card" id="how">
      <div className="mx-auto max-w-275 px-10 py-22">
        <Reveal className="mb-14">
          <h2 className="font-display text-[clamp(34px,3.5vw,48px)] leading-tight font-semibold tracking-tight text-primary">
            From question to <em className="font-normal text-secondary italic">cited answer</em>
          </h2>
          <p className="mt-3 max-w-125 text-[15px] leading-relaxed text-muted-foreground">
            Every response is grounded in Prof. Jimly&apos;s published works  not generic AI training data.
          </p>
        </Reveal>
        <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.num} className="bg-card p-9 px-8">
              <div className="mb-4 font-display text-[13px] font-semibold tracking-widest text-secondary">
                {step.num}
              </div>
              <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-primary/7">
                <step.icon className="size-5 text-primary" strokeWidth={1.75} />
              </div>
              <div className="mb-2 text-base font-semibold text-primary">{step.title}</div>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  )
}
