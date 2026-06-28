import { cn } from "@/lib/utils"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { type ReactNode } from "react"
import { Store, useStore } from "@tanstack/react-store"

const sidebarStore = new Store({ collapsed: false })

export function Sidebar({
  header,
  footer,
  children,
  className,
}: {
  header?: (collapsed: boolean) => ReactNode
  footer?: (collapsed: boolean) => ReactNode
  children: (collapsed: boolean, expand: () => void) => ReactNode
  className?: string
}) {
  const isCollapsed = useStore(sidebarStore, (s) => s.collapsed)

  return (
    <div
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-surface shadow-sm text-foreground transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-16 shrink-0 items-center px-3 gap-2">
        <button
          type="button"
          onClick={() => sidebarStore.setState((s) => ({ ...s, collapsed: !s.collapsed }))}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>

        {header && (
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
            )}
          >
            {header(isCollapsed)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3">
        {children(isCollapsed, () => sidebarStore.setState((s) => ({ ...s, collapsed: false })))}
      </div>

      {footer && (
        <div className="flex shrink-0 flex-col px-3 pb-3 pt-2 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
          {footer(isCollapsed)}
        </div>
      )}
    </div>
  )
}
