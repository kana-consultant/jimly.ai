import { cn } from "@/libs/utils"
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react"
import { useState, type ReactNode } from "react"
import { logoutUser } from "@/libs/auth-api-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
  const [isCollapsed, setIsCollapsed] = useState(false)

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
          onClick={() => setIsCollapsed((v) => !v)}
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
        {children(isCollapsed, () => setIsCollapsed(false))}
      </div>

      {footer && (
        <div className="flex shrink-0 flex-col px-3 pb-3 pt-2 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
          {footer(isCollapsed)}
        </div>
      )}
    </div>
  )
}

function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log out?</DialogTitle>
          <DialogDescription>You'll need to login again to access your chats.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    window.location.href = "/login"
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label="Log out"
        className="flex w-full items-center rounded-xl bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 active:scale-[0.98]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center">
          <LogOut className="size-4" />
        </span>
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap text-left text-sm font-medium transition-all duration-300 ease-in-out",
            iconOnly ? "max-w-0 opacity-0" : "max-w-40 opacity-100 pr-2",
          )}
        >
          Log out
        </span>
      </button>
      <LogoutConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleLogout}
      />
    </>
  )
}
