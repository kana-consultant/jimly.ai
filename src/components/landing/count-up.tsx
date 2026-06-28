import { Store, useStore } from "@tanstack/react-store"

const countUpStore = new Store<{ display: string }>({ display: '' })

export function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const display = useStore(countUpStore, (s) => s.display) || value

  let started = false

  function setRef(el: HTMLSpanElement | null) {
    if (!el) return
    const match = value.match(/^(\d+)(.*)$/)
    if (!match) return

    const target = Number(match[1])
    const suffix = match[2]
    countUpStore.setState(() => ({ display: `0${suffix}` }))

    function start() {
      if (started) return
      started = true
      const t0 = performance.now()
      function tick(now: number) {
        const progress = Math.min((now - t0) / duration, 1)
        countUpStore.setState(() => ({ display: `${Math.round(target * progress)}${suffix}` }))
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
  }

  return <span ref={setRef}>{display}</span>
}
