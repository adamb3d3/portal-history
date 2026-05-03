import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Incident } from "../lib/schema";

interface Props {
  incident: Incident;
}

export default function IncidentCard({ incident }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const hover = prefersReducedMotion
    ? {}
    : { y: -4, borderColor: "rgba(212, 165, 116, 0.45)" };

  return (
    <motion.div
      whileHover={hover}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group rounded-lg border border-night-700 bg-night-900 hover:bg-night-800 transition-colors"
    >
      <Link
        to={`/incident/${incident.id}`}
        className="block p-6 h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ember rounded-lg"
        aria-label={`Open ${incident.title}, ${incident.dateLabel}`}
      >
        <div className="text-[11px] uppercase tracking-[0.25em] text-ember-dim">
          {incident.dateLabel}
        </div>
        <div className="mt-3 font-display text-2xl md:text-[28px] leading-tight text-stone-100 group-hover:text-ember transition-colors">
          {incident.title}
        </div>
        <p className="mt-3 text-stone-400 leading-relaxed text-[15px]">
          {incident.hook}
        </p>
      </Link>
    </motion.div>
  );
}
