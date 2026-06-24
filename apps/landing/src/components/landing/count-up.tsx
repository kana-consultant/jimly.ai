import { useEffect, useRef, useState } from "react"

export function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const match = value.match(/^(\d+)(.*)$/)
    if (!match) return

    const target = Number(match[1])
    const suffix = match[2]
    setDisplay(`0${suffix}`)

    const el = ref.current
    if (!el) return

    let started = false
    function start() {
      if (started) return
      started = true
      const t0 = performance.now()
      function tick(now: number) {
        const progress = Math.min((now - t0) / duration, 1)
        setDisplay(`${Math.round(target * progress)}${suffix}`)
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (el.getBoundingClientRect().top < window.innerHeight) {
      start()
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{display}</span>
}
