import { cn } from "@/lib/utils"

import { Reveal } from "./reveal"

const BOOKS = [
  {
    title: "The Constitutional Law of Indonesia",
    meta: "2009 · Comprehensive Overview",
    gradient: "from-[#102A43] to-[#1A3A57]",
    spine: "bg-primary",
  },
  {
    title: "Green Constitution",
    meta: "2010 · Konstitusi Hijau",
    gradient: "from-[#1F4D36] to-[#2D6B4A]",
    spine: "bg-secondary",
  },
  {
    title: "Peradilan Etik dan Etika Konstitusi",
    meta: "2014 · Legal Ethics",
    gradient: "from-[#3A1A2A] to-[#5A2A40]",
    spine: "bg-primary",
  },
  {
    title: "Konstitusi Ekonomi",
    meta: "2010 · Economic Constitution",
    gradient: "from-[#2A1A3A] to-[#3D2657]",
    spine: "bg-secondary",
  },
  {
    title: "Pancasila: Identitas Konstitusi",
    meta: "2020 · National Identity",
    gradient: "from-[#3A2A10] to-[#5C4218]",
    spine: "bg-primary",
  },
  {
    title: "Pengantar Ilmu Hukum Tata Negara",
    meta: "2006 · State Administrative Law",
    gradient: "from-[#1A2A3A] to-[#243B53]",
    spine: "bg-secondary",
  },
]

export function BooksSection({ covers }: { covers: string[] }) {
  return (
    <section className="mx-auto max-w-275 px-10 py-22" id="books">
      <Reveal className="mb-12">
        <h2 className="font-sans text-[clamp(34px,3.5vw,48px)] leading-tight font-semibold tracking-tight text-primary">
          Built on <em className="font-normal text-chart-5 italic">decades of scholarship</em>
        </h2>
        <p className="mt-3 max-w-125 text-[15px] leading-relaxed text-muted-foreground">
          jimly.ai is trained on Prof. Jimly&apos;s major published works  a library of Indonesian constitutional
          thought unmatched in depth.
        </p>
      </Reveal>
      <Reveal className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {(visible) =>
          BOOKS.map((book, i) => (
          <div
            key={book.title}
            style={{ transitionDelay: `${i * 60}ms` }}
            className={cn(
              "group overflow-hidden rounded-2xl bg-card shadow-sm transition-[opacity,transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-lg",
              visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <div className={`h-1.5 ${book.spine}`} />
            <div className="p-4 pb-3.5">
              <div
                className={`relative mb-3 aspect-3/4 w-full overflow-hidden rounded-md bg-linear-to-br transition-transform duration-300 group-hover:scale-105 ${book.gradient}`}
              >
                <img
                  src={covers[i]}
                  alt={book.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mb-1 text-[12.5px] leading-snug font-semibold text-primary">{book.title}</div>
              <div className="text-[11px] text-muted-foreground-faint">{book.meta}</div>
            </div>
          </div>
          ))
        }
      </Reveal>
    </section>
  )
}
