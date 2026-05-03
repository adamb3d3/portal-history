import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getIncidentById } from "../lib/incidents";
import StillStage from "../components/StillStage";
import TimelineExplorer from "../components/TimelineExplorer";

// Globe + ScenePlayer pull in Mapbox GL JS (~1.5MB). Lazy-load them so
// still-image-driven incidents never pay the cost.
const Globe = lazy(() => import("../components/Globe"));
const ScenePlayer = lazy(() => import("../components/ScenePlayer"));

export default function Incident() {
  const { id } = useParams<{ id: string }>();
  const incident = id ? getIncidentById(id) : undefined;

  const [flybyDone, setFlybyDone] = useState(false);
  const [scenesDone, setScenesDone] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll cue: when the linear scenes complete, gently nudge the
  // page to reveal the timeline section below. Only on the first
  // completion, and never if the user has already scrolled.
  const autoScrolledRef = useRef(false);
  useEffect(() => {
    if (!scenesDone || autoScrolledRef.current) return;
    if (window.scrollY > 80) return;
    autoScrolledRef.current = true;
    const t = window.setTimeout(() => {
      timelineRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [scenesDone]);

  if (!incident) {
    return (
      <main className="min-h-screen bg-night-950 text-stone-100 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-ember-dim mb-3">
            Not found
          </p>
          <h1 className="font-display text-3xl">No incident with that id.</h1>
          <Link
            to="/"
            className="inline-block mt-6 text-ember hover:text-stone-100 transition-colors"
          >
            ← Return to directory
          </Link>
        </div>
      </main>
    );
  }

  const handleScenesComplete = () => setScenesDone(true);

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="bg-night-950 text-stone-100">
      {/* Floating return-to-directory link, top-left of viewport */}
      <Link
        to="/"
        className="fixed top-5 left-5 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] uppercase tracking-[0.25em] text-stone-300 bg-night-950/40 backdrop-blur-md border border-white/5 hover:text-ember hover:bg-night-950/60 transition-colors"
      >
        ← Directory
      </Link>

      {/* Stage — full viewport, edge-to-edge */}
      <section
        aria-label="Cinematic experience"
        className="relative w-full h-screen"
      >
        {incident.flyby ? (
          <Suspense
            fallback={
              <div className="absolute inset-0 bg-night-900 flex items-center justify-center text-stone-500 text-sm">
                Loading map…
              </div>
            }
          >
            <Globe
              location={incident.location}
              flyby={incident.flyby}
              onFlybyComplete={() => setFlybyDone(true)}
            >
              {flybyDone && !scenesDone && (
                <ScenePlayer
                  scenes={incident.scenes}
                  onComplete={handleScenesComplete}
                />
              )}
            </Globe>
          </Suspense>
        ) : (
          <StillStage
            scenes={incident.scenes}
            sources={incident.sources}
            fullBleed
            titleOverlay={{
              title: incident.title,
              date: `${incident.dateLabel} — ${incident.location.label}`,
              hook: incident.hook,
            }}
            onComplete={handleScenesComplete}
          />
        )}

        {/* "↓ Continue" affordance after the linear sequence completes */}
        <AnimatePresence>
          {scenesDone && (
            <motion.button
              type="button"
              onClick={scrollToTimeline}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-7 left-1/2 -translate-x-1/2 z-40 inline-flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-stone-200 hover:text-ember transition-colors group"
              aria-label="Continue to timeline"
            >
              <span>The norm, tested</span>
              <motion.span
                animate={{ y: [0, 5, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-ember text-base"
              >
                ↓
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* Timeline section — full-bleed background, internal max-width */}
      {incident.timeline && (
        <div
          ref={timelineRef}
          className="relative w-full px-6 py-24 md:py-32 border-t border-night-800"
        >
          <TimelineExplorer
            title={incident.timeline.title}
            intro={incident.timeline.intro}
            moments={incident.timeline.moments}
            sources={incident.sources}
          />
        </div>
      )}

      {/* Footer: collapsible sources */}
      <footer className="border-t border-night-800">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <button
            type="button"
            onClick={() => setSourcesOpen((o) => !o)}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-stone-400 hover:text-ember transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ember rounded"
            aria-expanded={sourcesOpen}
            aria-controls="sources-list"
          >
            <span
              className="inline-block transition-transform duration-200"
              style={{
                transform: sourcesOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ›
            </span>
            {sourcesOpen ? "Hide sources" : "Show sources"} ({incident.sources.length})
          </button>

          <AnimatePresence initial={false}>
            {sourcesOpen && (
              <motion.div
                key="sources"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <ul id="sources-list" className="mt-4 space-y-2 pb-2">
                  {incident.sources.map((source) => (
                    <li key={source.id}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-stone-400 hover:text-ember transition-colors"
                      >
                        {source.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </footer>
    </main>
  );
}
