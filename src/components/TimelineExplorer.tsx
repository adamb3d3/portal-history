import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Source, TimelineMoment } from "../lib/schema";
import RichText from "./RichText";

interface Props {
  title?: string;
  intro?: string;
  moments: TimelineMoment[];
  sources?: Source[];
}

const ROW_H = 130; // px between successive nodes on the snake
const NODE_X_LEFT = 22; // % from container left for "left" rows
const NODE_X_RIGHT = 78; // % from container left for "right" rows

/**
 * Serpentine timeline of historical moments with magnify-on-click and
 * scroll-locked node activation.
 *
 * Visual: a vertical S-curve drawn in SVG, with circle nodes
 * positioned along it alternating between left and right. Each node
 * carries a small year + title label.
 *
 * Scroll-lock activation: as the user scrolls, the node closest to
 * the viewport center is marked "active" — it scales up, brightens
 * its halo, and the floating chip in the top corner updates to show
 * its year and title. Adjacent nodes dim. The result is a "you are
 * walking through this moment" reading rhythm rather than a flat
 * map of dots.
 *
 * Click any node to open the magnify modal (full detail, image,
 * inline-linked paragraphs, further reading).
 */
export default function TimelineExplorer({
  title,
  intro,
  moments,
  sources,
}: Props) {
  const [active, setActive] = useState<TimelineMoment | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const sectionRef = useRef<HTMLElement | null>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Scroll-locked activation: nearest-to-center wins, but only when
  // the timeline section is at least partially in the viewport.
  useEffect(() => {
    const compute = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sRect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (sRect.bottom < 0 || sRect.top > vh) {
        setActiveIndex(-1);
        return;
      }
      const center = vh / 2;
      let best = -1;
      let bestDist = Infinity;
      nodeRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const nodeCenter = r.top + r.height / 2;
        const d = Math.abs(nodeCenter - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActiveIndex(best);
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [moments.length]);

  // Compute viewBox-unit positions for each node.
  const points = moments.map((_, i) => ({
    x: i % 2 === 0 ? NODE_X_LEFT : NODE_X_RIGHT,
    y: i * ROW_H + 60,
  }));
  const totalH = moments.length * ROW_H + 60;

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const midY = (prev.y + pt.y) / 2;
    return `${acc} C ${prev.x} ${midY}, ${pt.x} ${midY}, ${pt.x} ${pt.y}`;
  }, "");

  const activeMoment = activeIndex >= 0 ? moments[activeIndex] : null;

  return (
    <section
      ref={sectionRef}
      aria-label="Significance timeline"
      className="relative max-w-5xl mx-auto"
    >
      <header className="text-center mb-16 px-6">
        {title && (
          <p className="text-[11px] uppercase tracking-[0.3em] text-ember mb-3">
            {title}
          </p>
        )}
        {intro && (
          <h2 className="font-display text-3xl md:text-4xl text-stone-100 leading-snug max-w-3xl mx-auto">
            {intro}
          </h2>
        )}
        <p className="mt-6 text-sm text-stone-500">
          Scroll through the moments. Click any to magnify.
        </p>
      </header>

      {/* Floating "you are here" indicator — fixed to viewport, only
          rendered while a moment is the active scroll target. */}
      <AnimatePresence>
        {activeMoment && (
          <motion.div
            key="active-indicator"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-5 right-5 z-40 bg-night-900/85 backdrop-blur-md border border-night-700 rounded-md px-4 py-3 max-w-xs pointer-events-none"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-ember-dim mb-1">
              {activeMoment.year}
            </div>
            <div className="font-display text-stone-100 text-sm leading-snug">
              {activeMoment.title}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest text-stone-500">
              {activeIndex + 1} / {moments.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative" style={{ height: totalH }}>
        {/* Serpent path — dashed ember line behind the nodes */}
        <svg
          viewBox={`0 0 100 ${totalH}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <path
            d={pathD}
            stroke="rgba(212, 165, 116, 0.35)"
            strokeWidth="1.4"
            strokeDasharray="4 6"
            strokeLinecap="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {moments.map((moment, i) => {
          const pt = points[i];
          const onLeft = i % 2 === 0;
          const isActive = i === activeIndex;
          return (
            <button
              key={moment.id}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setActive(moment)}
              className="absolute group focus:outline-none focus-visible:outline-none transition-all duration-500"
              style={{
                left: `${pt.x}%`,
                top: pt.y,
                transform: "translate(-50%, -50%)",
                opacity: activeIndex < 0 ? 1 : isActive ? 1 : 0.35,
              }}
              aria-label={`${moment.year} — ${moment.title}. Click to expand.`}
            >
              <div
                className="flex items-center"
                style={{ flexDirection: onLeft ? "row" : "row-reverse" }}
              >
                {/* Label */}
                <div
                  className={`w-28 sm:w-40 md:w-56 ${
                    onLeft
                      ? "mr-2 sm:mr-4 md:mr-5 text-right"
                      : "ml-2 sm:ml-4 md:ml-5 text-left"
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-[0.3em] mb-1 transition-colors duration-500 ${
                      isActive
                        ? "text-ember"
                        : "text-ember-dim group-hover:text-ember"
                    }`}
                  >
                    {moment.year}
                  </div>
                  <div
                    className={`font-display text-sm md:text-[15px] leading-snug transition-colors duration-500 ${
                      isActive
                        ? "text-stone-50"
                        : "text-stone-300 group-hover:text-stone-50"
                    }`}
                  >
                    {moment.title}
                  </div>
                </div>

                {/* Node */}
                <span className="relative flex-none">
                  <span
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      isActive
                        ? "bg-ember/50 scale-[3.6]"
                        : "bg-ember/30 scale-[2.4] group-hover:bg-ember/40"
                    }`}
                  />
                  <span
                    className={`relative block rounded-full bg-ember border-2 border-night-950 transition-transform duration-500 ${
                      isActive ? "w-4 h-4 scale-110" : "w-3 h-3 group-hover:scale-125"
                    }`}
                  />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <MagnifyModal
            moment={active}
            sources={sources}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

interface ModalProps {
  moment: TimelineMoment;
  sources?: Source[];
  onClose: () => void;
}

function MagnifyModal({ moment, sources, onClose }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-night-950/85 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${moment.year} — ${moment.title}`}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative bg-night-900 rounded-lg border border-night-700 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {moment.imageUrl && (
          <div className="aspect-video bg-night-800 relative overflow-hidden flex-none">
            <img
              src={moment.imageUrl}
              alt={moment.imageAlt ?? ""}
              draggable={false}
              style={{ objectPosition: moment.imagePosition ?? "50% 50%" }}
              className="absolute inset-0 w-full h-full object-cover sepia-tone"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)",
              }}
            />
          </div>
        )}
        <div className="p-7 md:p-9 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ember mb-3">
            {moment.year}
            {moment.date && (
              <span className="text-ember-dim normal-case tracking-normal ml-2 font-sans">
                — {moment.date}
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl md:text-3xl text-stone-50 leading-tight mb-4">
            {moment.title}
          </h3>
          <RichText
            text={moment.hook}
            sources={sources}
            className="font-display text-stone-200 text-base md:text-lg leading-relaxed mb-5 block"
          />
          {moment.detail && (
            <RichText
              text={moment.detail}
              sources={sources}
              paragraphs
              className="drop-cap text-stone-400 leading-relaxed text-[15px]"
            />
          )}
          {moment.furtherReading && moment.furtherReading.length > 0 && (
            <div className="mt-7 pt-5 border-t border-night-700">
              <div className="text-[10px] uppercase tracking-[0.3em] text-ember-dim mb-3">
                Further reading
              </div>
              <ul className="space-y-2">
                {moment.furtherReading.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-stone-300 hover:text-ember transition-colors inline-flex items-start gap-2"
                    >
                      <span className="text-ember-dim mt-px">→</span>
                      <span className="underline decoration-night-700 decoration-1 underline-offset-[3px] hover:decoration-ember">
                        {item.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-night-950/70 hover:bg-night-800 text-stone-300 hover:text-ember flex items-center justify-center text-lg transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}
