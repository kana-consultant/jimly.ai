import { Store, useStore } from "@tanstack/react-store"
import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

const revealStore = new Store<{ visible: boolean }>({ visible: false })

export function Reveal({
  children,
  className,
}: {
  children: ReactNode | ((visible: boolean) => ReactNode)
  className?: string
}) {
  const visible = useStore(revealStore, (s) => s.visible)

  function setRef(el: HTMLDivElement | null) {
    if (!el) return

    if (el.getBoundingClientRect().top < window.innerHeight) {
      revealStore.setState(() => ({ visible: true }))
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealStore.setState(() => ({ visible: true }))
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
  }

  const isRenderProp = typeof children === "function"

  return (
    <div
      ref={setRef}
      className={cn(
        !isRenderProp && "opacity-0 translate-y-5 transition-[opacity,transform] duration-500 ease-out",
        !isRenderProp && visible && "opacity-100 translate-y-0",
        className
      )}
    >
      {isRenderProp ? children(visible) : children}
    </div>
  )
}
