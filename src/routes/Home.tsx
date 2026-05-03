import { incidents } from "../lib/incidents";
import IncidentCard from "../components/IncidentCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-night-950 text-stone-100">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12 md:mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ember">
            Portal History
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-light tracking-tight text-stone-50">
            The past, where it happened.
          </h1>
          <p className="mt-4 text-stone-400 max-w-xl leading-relaxed">
            A directory of moments. Click a portal to drop into the time and place an event occurred.
          </p>
        </header>

        <section
          aria-label="Incidents"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </section>
      </div>
    </main>
  );
}
