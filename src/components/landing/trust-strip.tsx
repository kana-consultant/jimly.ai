const STATS = [
  { num: "60+", label: "Books authored" },
  { num: "40+", label: "Years of scholarship" },
  { num: "500+", label: "Academic papers" },
  { num: "#1", label: "Chief Justice, MK RI 2003–08" },
  { num: "UI", label: "Professor of Law, FHUI" },
]

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-0 border-y border-border bg-card px-10 py-7">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-0.5 border-r border-border px-12 py-3 last:border-r-0"
        >
          <span className="font-display text-[32px] font-semibold leading-none text-primary">{stat.num}</span>
          <span className="text-xs whitespace-nowrap text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
