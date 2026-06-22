import { Gavel, GraduationCap, Users } from "lucide-react"

import { Reveal } from "./reveal"

const AFFILIATIONS = [
  "Professor of Law, Universitas Indonesia",
  "Founding Chief Justice, Mahkamah Konstitusi",
  "Honorary Professor, University of Melbourne",
  "Chairman, DKPP (2012–2017)",
  "Advisory Council, Komnas HAM (2009–2017)",
]

const CREDENTIALS = [
  {
    icon: Gavel,
    title: "Founding Chief Justice, Mahkamah Konstitusi (2003–2008)",
    detail: "Established Indonesia's Constitutional Court from inception; served two full terms",
  },
  {
    icon: GraduationCap,
    title: "Professor of Constitutional Law, FHUI & University of Melbourne",
    detail: "Chair since 1998 at UI; Honorary Professor at Melbourne Law School",
  },
  {
    icon: Users,
    title: "Presidential Advisory Council Member (2010–2014)",
    detail: "Served as legal and political advisor to President Susilo Bambang Yudhoyono",
  },
]

export function AboutSection({ photoSrc }: { photoSrc: string }) {
  return (
    <div className="border-y border-border bg-card" id="about">
      <Reveal className="mx-auto grid max-w-275 grid-cols-1 items-center gap-10 px-10 py-22 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="rounded-xl border border-border bg-background p-8">
          <div className="mb-4.5 size-18 overflow-hidden rounded-full border-2 border-border">
            <img src={photoSrc} alt="Prof. Dr. H. Jimly Asshiddiqie" className="size-full object-cover" />
          </div>
          <div className="mb-1 font-display text-[22px] font-semibold text-primary">
            Prof. Dr. H. Jimly Asshiddiqie, S.H.
          </div>
          <div className="mb-5 text-xs font-medium tracking-wide text-secondary uppercase">
            Constitutional Scholar · Chief Justice · Professor
          </div>
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-md border border-border bg-card p-3.5">
              <div className="mb-0.5 font-display text-[26px] font-semibold leading-none text-primary">60+</div>
              <div className="text-[11px] text-muted-foreground">Books published</div>
            </div>
            <div className="rounded-md border border-border bg-card p-3.5">
              <div className="mb-0.5 font-display text-[26px] font-semibold leading-none text-primary">40+</div>
              <div className="text-[11px] text-muted-foreground">Years of scholarship</div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {AFFILIATIONS.map((affil) => (
              <div key={affil} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.25 shrink-0 rounded-full bg-secondary" />
                {affil}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-5 font-display text-[clamp(34px,3.5vw,48px)] leading-tight font-semibold tracking-tight text-primary">
            Indonesia&apos;s foremost
            <br />
            <em className="font-normal text-secondary italic">constitutional mind</em>
          </h2>
          <p className="mb-8 text-[15px] leading-loose text-muted-foreground">
            Born in Palembang in 1956, Prof. Jimly Asshiddiqie is Indonesia&apos;s most eminent constitutional law
            scholar. As the architect and founding Chief Justice of the Indonesian Constitutional Court (Mahkamah
            Konstitusi), he established the institution that redefined the nation&apos;s rule of law after the
            Suharto era.
            <br />
            <br />
            Over four decades, he has authored more than 60 books and hundreds of papers  creating the most
            comprehensive library of Indonesian constitutional thought in existence. jimly.ai makes this
            extraordinary body of knowledge answerable to everyone.
          </p>
          <div className="flex flex-col">
            {CREDENTIALS.map((cred, i) => (
              <div
                key={cred.title}
                className={`flex gap-3.5 border-b border-border py-4 ${i === 0 ? "border-t" : ""}`}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/7">
                  <cred.icon className="size-3.75 text-primary" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="mb-0.5 text-[13.5px] font-semibold text-primary">{cred.title}</div>
                  <div className="text-[12.5px] leading-snug text-muted-foreground">{cred.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
