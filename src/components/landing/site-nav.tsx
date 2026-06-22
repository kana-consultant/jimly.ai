import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#books", label: "Books" },
  { href: "#about", label: "About Prof. Jimly" },
]

export function SiteNav({ logoSrc }: { logoSrc: string }) {
  return (
    <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-border bg-background/95 px-10 backdrop-blur-md">
      <a href="/" className="flex items-center gap-2 font-display text-[22px] font-semibold tracking-tight text-primary">
        <img src={logoSrc} alt="jimly.ai" className="size-7 rounded-md object-cover" />
        jimly<span className="font-medium text-secondary">.ai</span>
      </a>
      <div className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-primary/7 hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<a href="/login" />}>
          Sign in
        </Button>
        <Button size="sm" nativeButton={false} render={<a href="/register" />}>
          Get Started
        </Button>
      </div>
    </nav>
  )
}
