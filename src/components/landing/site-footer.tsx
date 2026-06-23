const EXPLORE_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#books", label: "Books" },
]

const LEGAL_LINKS = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Contact" },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary px-10 pb-8 pt-16 text-primary-foreground sm:pt-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="font-display text-xl font-semibold">
            jimly<span className="text-secondary">.ai</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-primary-foreground/70">
            AI legal assistant built on the scholarship of Prof. Dr. H. Jimly Asshiddiqie.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <div className="text-[12px] font-medium uppercase tracking-wide text-secondary">Explore</div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[13.5px] text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[12px] font-medium uppercase tracking-wide text-secondary">Legal</div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[13.5px] text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-5xl border-t border-primary-foreground/10 pt-5 text-center text-xs text-primary-foreground/50 sm:text-left">
        © 2025 jimly.ai · All rights reserved.
      </div>
    </footer>
  )
}
