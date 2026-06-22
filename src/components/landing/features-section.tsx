import { Landmark, Network, ShieldCheck, Users } from "lucide-react"

import { Reveal } from "./reveal"

const FEATURES = [
  {
    icon: Landmark,
    name: "Constitutional Law",
    desc: "Interpret the 1945 Constitution, judicial review of legislation, and the authority of state institutions.",
    tags: ["Judicial Review", "MK RI", "UUD 1945"],
  },
  {
    icon: Network,
    name: "State Administration",
    desc: "Navigate government institutions, bureaucratic structure, state authority, and the rule of law in democratic Indonesia.",
    tags: ["Hukum Tata Negara", "Pancasila"],
  },
  {
    icon: ShieldCheck,
    name: "Legal Ethics & Judiciary",
    desc: "Understand the ethics of legal institutions, judicial conduct, and the moral foundations of Indonesian law.",
    tags: ["Court Ethics", "DKPP"],
  },
  {
    icon: Users,
    name: "Human Rights & Democracy",
    desc: "Explore constitutional rights, democratic reform, civil liberties, and Indonesia's post-Reformasi transition.",
    tags: ["Komnas HAM", "Reformasi"],
  },
]

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-275 px-10 py-22" id="features">
      <Reveal className="mb-12">
        <h2 className="font-display text-[clamp(34px,3.5vw,48px)] leading-tight font-semibold tracking-tight text-primary">
          Every question answered
          <br />
          from <em className="font-normal text-secondary italic">the source</em>
        </h2>
        <p className="mt-3 max-w-125 text-[15px] leading-relaxed text-muted-foreground">
          jimly.ai cites exact books and chapters with every answer  not generic AI outputs.
        </p>
      </Reveal>
      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.name}
            className="rounded-lg border border-border bg-card p-7 transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-primary/18 hover:shadow-md"
          >
            <div className="mb-5 flex size-10 items-center justify-center rounded-md border border-secondary/20 bg-secondary/14">
              <feature.icon className="size-4.5 text-secondary" strokeWidth={1.75} />
            </div>
            <div className="mb-2 text-[15px] font-semibold text-primary">{feature.name}</div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{feature.desc}</p>
            <div className="mt-4.5 flex flex-wrap gap-1.5">
              {feature.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/7 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
