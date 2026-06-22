import { CountUp } from "./count-up"

const STATS = [
  { num: "60+", label: "Books authored" },
  { num: "40+", label: "Years of scholarship" },
  { num: "500+", label: "Academic papers" },
  { num: "#1", label: "Chief Justice, MK RI 2003–08" },
  { num: "UI", label: "Professor of Law, FHUI" },
]

export function TrustStrip() {
  return (
    <div className="mx-auto max-w-275 px-10 py-10">
      <div className="rounded-3xl bg-primary px-8 py-10 sm:px-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-32 flex-1 flex-col items-center gap-1 rounded-2xl bg-primary-foreground/8 px-6 py-5"
            >
              <span className="font-display text-[28px] font-semibold leading-none text-secondary">
                <CountUp value={stat.num} />
              </span>
              <span className="text-center text-xs whitespace-nowrap text-primary-foreground/80">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
