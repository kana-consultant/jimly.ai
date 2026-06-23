import { CountUp } from "./count-up"

const STATS = [
  { num: "70+", label: "Books authored" },
  { num: "40+", label: "Years of scholarship" },
  { num: "500+", label: "Academic papers" },
  { num: "#1", label: "Chief Justice, MK RI 2003–08" },
  { num: "UI", label: "Professor of Law, FHUI" },
]

export function TrustStrip() {
  const items = [...STATS, ...STATS]

  return (
    <div className="mx-auto max-w-275 px-10 py-10">
      <div className="overflow-hidden rounded-3xl py-10 group">
        <div className="flex w-max shrink-0 animate-marquee gap-3 px-3 group-hover:paused">
          {items.map((stat, i) => (
            <div
              key={`${stat.label}-${i}`}
              className="flex w-48 shrink-0 flex-col items-center gap-1 rounded-2xl bg-primary-foreground/8 px-6 py-5"
            >
              <span className="font-display text-[28px] font-semibold leading-none text-chart-5">
                <CountUp value={stat.num} />
              </span>
              <span className="text-center text-xs whitespace-nowrap text-primary">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}