import { Landmark, Network, ShieldCheck, Users } from "lucide-react"

import { cn } from "@/lib/utils"

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
        <h2 className="font-sans text-[clamp(34px,3.5vw,48px)] leading-tight font-semibold tracking-tight text-primary">
          Every question answered
          <br />
          from <em className="font-normal text-secondary italic">the source</em>
        </h2>
        <p className="mt-3 max-w-125 text-[15px] leading-relaxed text-muted-foreground">
          jimly.ai cites exact books and chapters with every answer  not generic AI outputs.
        </p>
      </Reveal>
      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(visible) =>
          FEATURES.map((feature, i) => (
          <div
            key={feature.name}
            style={{ transitionDelay: `${i * 80}ms` }}
            className={cn(
              "group rounded-2xl bg-card p-7 shadow-sm transition-[opacity,transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
              visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary transition-transform duration-300 group-hover:scale-110">
              <feature.icon className="size-4.5 text-primary-foreground" strokeWidth={1.75} />
            </div>
            <div className="mb-2 text-[15px] font-semibold text-primary">{feature.name}</div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{feature.desc}</p>
          </div>
          ))
        }
      </Reveal>
    </section>
  )
}
