import { incidents } from "../lib/incidents";
import IncidentCard from "../components/IncidentCard";

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/75/General_George_Washington_Resigning_his_Commission.jpg";

export default function Home() {
  // Chronological — oldest precedent first.
  const sortedIncidents = [...incidents].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <main className="min-h-screen bg-night-950 text-stone-100">
      {/* Hero — full-bleed period image with the through-line stated */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            draggable={false}
            className="w-full h-full object-cover sepia-tone"
            style={{ objectPosition: "50% 38%" }}
          />
          {/* Heavy bottom-up gradient for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(7,8,11,0.97) 0%, rgba(7,8,11,0.78) 35%, rgba(7,8,11,0.4) 70%, rgba(7,8,11,0.6) 100%)",
            }}
          />
          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20 md:pb-28 pt-32 md:pt-40 w-full">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ember mb-6">
            Portal History
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[1.02] tracking-tight max-w-4xl">
            The choice not<br />
            to take power.
          </h1>
          <p className="mt-8 text-stone-300 text-lg md:text-xl max-w-2xl leading-relaxed">
            A directory of moments when men with armies gave them back. Two and a half millennia of a single idea, walked through end-to-end.
          </p>
          <div className="mt-12 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-stone-400">
            <span>Begin below</span>
            <span className="text-ember">↓</span>
          </div>
        </div>
      </section>

      {/* Framing paragraph — names the connection between the two stories */}
      <section className="border-y border-night-800 bg-night-950 py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ember mb-6 text-center">
            The thread
          </p>
          <p className="font-display text-stone-200 text-lg md:text-xl leading-[1.7] text-balance">
            In March 1783, George Washington walked into a meeting of his unpaid officers conscious he was being measured against an older standard. Twenty-three centuries earlier, a Roman farmer named Cincinnatus had set it. The two stories below are the same idea — that men with armies should give them back — held up as the standard once, and again, two thousand years later. Click into either to be dropped inside the moment.
          </p>
        </div>
      </section>

      {/* The two cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <header className="text-center mb-10 md:mb-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-ember-dim">
              Two stories, one through-line
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
            {sortedIncidents.map((incident, i) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                ordinal={i + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-night-800 py-10">
        <div className="max-w-5xl mx-auto px-6 text-center text-[10px] uppercase tracking-[0.3em] text-stone-500">
          Cited from primary sources. Public-domain imagery via Wikimedia Commons.
        </div>
      </footer>
    </main>
  );
}
