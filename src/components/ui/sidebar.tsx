import { cn } from "@/lib/utils"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useState, type ReactNode } from "react"

export function Sidebar({
  header,
  footer,
  children,
  className,
}: {
  header?: (collapsed: boolean) => ReactNode
  footer?: (collapsed: boolean) => ReactNode
  children: (collapsed: boolean) => ReactNode
  className?: string
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border p-2">
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {isCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>

        {header && (
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100 pl-2"
            )}
          >
            {header(isCollapsed)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">{children(isCollapsed)}</div>

      {footer && <div className="flex shrink-0 flex-col border-t border-sidebar-border p-2">{footer(isCollapsed)}</div>}
    </div>
  )
}
