import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Reveal({
  children,
  className,
}: {
  children: ReactNode | ((visible: boolean) => ReactNode)
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (el.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isRenderProp = typeof children === "function"

  return (
    <div
      ref={ref}
      className={cn(
        !isRenderProp && "opacity-0 translate-y-5 transition-[opacity,transform] duration-600 ease-out",
        !isRenderProp && visible && "opacity-100 translate-y-0",
        className
      )}
    >
      {isRenderProp ? children(visible) : children}
    </div>
  )
}
