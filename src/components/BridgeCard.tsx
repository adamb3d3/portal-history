import { Link } from "react-router-dom";
import { getIncidentById } from "../lib/incidents";
import type { Bridge } from "../lib/schema";

interface Props {
  bridge: Bridge;
}

/**
 * A full-width, image-led "what's next" card that points the reader
 * from the current incident to a related one. Used to chain stories
 * thematically — Cincinnatus → Newburgh, Newburgh → Cincinnatus.
 *
 * The image is intentionally large and atmospheric so the bridge
 * doesn't feel like a UI control; it feels like the next chapter of
 * the experience.
 */
export default function BridgeCard({ bridge }: Props) {
  const destination = getIncidentById(bridge.incidentId);
  if (!destination) return null;

  const cta = bridge.cta ?? `Continue to ${destination.title}`;

  return (
    <section
      aria-label={`Continue to ${destination.title}`}
      className="relative min-h-[78vh] flex items-center overflow-hidden border-t border-night-800"
    >
      <img
        src={bridge.imageUrl}
        alt={bridge.imageAlt}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover sepia-tone"
        style={{
          opacity: 0.55,
          objectPosition: bridge.imagePosition ?? "50% 40%",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(7,8,11,0.88) 0%, rgba(7,8,11,0.55) 35%, rgba(7,8,11,0.55) 65%, rgba(7,8,11,0.97) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 md:py-28 text-center w-full">
        <p className="text-[11px] uppercase tracking-[0.4em] text-ember mb-6">
          Continue the thread
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight text-stone-50 max-w-3xl mx-auto">
          {bridge.headline}
        </h2>
        {bridge.subhead && (
          <p className="mt-7 text-stone-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {bridge.subhead}
          </p>
        )}
        <div className="mt-12 inline-flex flex-col items-center gap-3">
          <Link
            to={`/incident/${bridge.incidentId}`}
            className="inline-flex items-center gap-3 px-7 py-4 rounded-md border border-ember/40 bg-night-900/60 backdrop-blur-sm hover:border-ember hover:bg-ember/10 transition-colors text-stone-100 hover:text-ember text-sm uppercase tracking-[0.3em] focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            <span>{cta}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
            {destination.dateLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
