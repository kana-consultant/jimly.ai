const FOOTER_LINKS = ["Privacy", "Terms", "Contact"]

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center gap-3.5 border-t border-border bg-background px-10 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="font-display text-lg font-semibold text-primary">
        jimly<span className="text-secondary">.ai</span>
      </div>
      <div className="text-xs text-muted-foreground-faint">
        © 2025 jimly.ai · Built on the scholarship of Prof. Dr. H. Jimly Asshiddiqie
      </div>
      <div className="flex flex-wrap justify-center gap-5">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="text-[12.5px] text-muted-foreground transition-colors hover:text-primary"
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  )
}
