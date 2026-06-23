import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#books", label: "Books" },
]

export function SiteNav({ logoSrc }: { logoSrc: string }) {
  return (
    <nav className="fixed top-4 inset-x-0 z-50 mx-auto flex h-15 max-w-5xl items-center justify-between rounded-full border border-white/10 bg-background/40 px-8 shadow-md backdrop-blur-xl backdrop-saturate-150">
      <a href="/" className="flex items-center gap-2 font-display text-[22px] font-semibold tracking-tight text-primary">
        <img src={logoSrc} alt="jimly.ai" className="size-7 rounded-md object-cover" />
        jimly<span className="font-medium text-chart-5">.ai</span>
      </a>
      
      <div className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full px-4 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
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