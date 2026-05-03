import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Incident } from "../lib/schema";

interface Props {
  incident: Incident;
  /**
   * If provided, displayed as a Roman numeral above the card title to
   * imply curated sequence (I, II, III…).
   */
  ordinal?: number;
}

export default function IncidentCard({ incident, ordinal }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const hover = prefersReducedMotion ? {} : { y: -6 };

  return (
    <motion.div
      whileHover={hover}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative rounded-lg border border-night-700 bg-night-900 overflow-hidden hover:border-ember/40 transition-colors"
    >
      <Link
        to={`/incident/${incident.id}`}
        className="block aspect-[4/5] focus:outline-none focus-visible:ring-2 focus-visible:ring-ember rounded-lg"
        aria-label={`Open ${incident.title}, ${incident.dateLabel}`}
      >
        {/* Poster image */}
        {incident.posterImageUrl && (
          <div className="absolute inset-0">
            <img
              src={incident.posterImageUrl}
              alt=""
              draggable={false}
              className="w-full h-full object-cover sepia-tone opacity-55 group-hover:opacity-70 transition-opacity duration-500"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,8,11,0.97) 0%, rgba(7,8,11,0.85) 40%, rgba(7,8,11,0.45) 75%, rgba(7,8,11,0.55) 100%)",
              }}
            />
          </div>
        )}

        <div className="relative z-10 h-full p-7 md:p-9 flex flex-col">
          {ordinal && (
            <div className="text-[10px] tracking-[0.4em] text-ember-dim uppercase mb-1 font-sans">
              {toRoman(ordinal)}
            </div>
          )}
          <div className="text-[11px] uppercase tracking-[0.25em] text-ember mb-3">
            {incident.dateLabel}
          </div>
          <div className="mt-auto">
            <h3 className="font-display text-3xl md:text-[34px] leading-[1.05] text-stone-50 group-hover:text-ember transition-colors duration-500 tracking-tight">
              {incident.title}
            </h3>
            <p className="mt-4 text-stone-300 leading-relaxed text-[15px]">
              {incident.hook}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-stone-400 group-hover:text-ember transition-colors">
              Enter
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function toRoman(n: number): string {
  const map: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let remaining = n;
  for (const [num, sym] of map) {
    while (remaining >= num) {
      result += sym;
      remaining -= num;
    }
  }
  return result;
}
