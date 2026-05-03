import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Scene, Source } from "../lib/schema";
import RichText from "./RichText";

interface Props {
  scenes: Scene[];
  sources?: Source[];
  /**
   * If provided, renders a fade-in title plate over the first scene
   * for ~5 seconds before fading out. Used by the Incident route to
   * make the full-screen stage feel like an opening film title rather
   * than just an image.
   */
  titleOverlay?: { title: string; date: string; hook?: string };
  /**
   * If true, the stage fills its parent (no border, no rounded
   * corners, no aspect-ratio constraint). Used for the full-bleed
   * cinematic mode.
   */
  fullBleed?: boolean;
  onComplete: () => void;
}

/**
 * Ken Burns-style stage with documentary-craft additions:
 *
 *  - Three rendering modes per scene:
 *      * image scene  → Ken Burns pan/zoom on the image, caption strip
 *      * chapter intertitle → caption with no imageUrl: full-frame
 *        centered serif on dark, no animation, no caption strip
 *      * pull quote → kind: "quote": full-frame italic + attribution
 *  - Year marker in the top-right corner — re-fades on each scene to
 *    cue temporal jumps
 *  - Film-grain SVG overlay for celluloid feel
 *  - Subtle letterbox bars (top/bottom) for cinematic framing
 *  - Progress bar across the top
 *  - Click/Enter/Space anywhere on stage to advance manually
 */
export default function StillStage({
  scenes,
  sources,
  titleOverlay,
  fullBleed,
  onComplete,
}: Props) {
  const [index, setIndex] = useState(0);
  const [titleHidden, setTitleHidden] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const advance = useCallback(() => setIndex((i) => i + 1), []);
  const goBack = useCallback(
    () => setIndex((i) => Math.max(0, i - 1)),
    [],
  );

  // Title overlay visibility is *derived* — true only when we're on
  // scene 0 AND the auto-fade timer hasn't fired yet. This prevents
  // the title from ghosting onto later scenes if the user clicks
  // through scene 0 before the 5.2s timer completes.
  const titleVisible = !!titleOverlay && index === 0 && !titleHidden;

  useEffect(() => {
    if (index >= scenes.length) {
      onComplete();
      return;
    }
    // Effective duration = max(manifest, computed-from-text-length).
    // Long-text scenes auto-linger; short ones use the manifest floor.
    const ms = effectiveDurationMs(scenes[index]);
    const id = window.setTimeout(advance, ms);
    return () => window.clearTimeout(id);
  }, [index, scenes, advance, onComplete]);

  // Auto-fade the title overlay only while we're still on scene 0.
  useEffect(() => {
    if (!titleOverlay || index !== 0) return;
    const t = window.setTimeout(() => setTitleHidden(true), 5200);
    return () => window.clearTimeout(t);
  }, [index, titleOverlay]);

  if (index >= scenes.length) return null;

  const scene = scenes[index];
  const visual = stageVisual(scene);
  const narrative = stageText(scene);
  const isChapter = scene.kind === "caption" && !visual.url;
  const isPullQuote = scene.kind === "quote";
  const isFullFrame = isChapter || isPullQuote;
  const kb = kenBurnsFor(index, prefersReducedMotion ?? false);

  const wrapperClass = fullBleed
    ? "relative w-full h-screen overflow-hidden bg-night-950 select-none focus:outline-none"
    : "relative aspect-video rounded-lg overflow-hidden border border-night-700 bg-night-950 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ember";

  const seconds = effectiveDurationMs(scene) / 1000;

  return (
    <div
      className={wrapperClass}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          advance();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          goBack();
        }
      }}
      aria-label={`Scene ${index + 1} of ${scenes.length}. Left or right side to navigate; arrow keys also work.`}
    >
      {/* Crossfading content layer */}
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {isChapter ? (
            <ChapterIntertitle text={narrative.text ?? ""} sources={sources} />
          ) : isPullQuote ? (
            <PullQuote
              text={narrative.text ?? ""}
              attribution={narrative.attribution ?? ""}
              sources={sources}
            />
          ) : visual.url ? (
            <motion.img
              src={visual.url}
              alt={visual.alt ?? ""}
              draggable={false}
              initial={kb.from}
              animate={kb.to}
              transition={{
                duration: prefersReducedMotion ? 0 : seconds,
                ease: "linear",
              }}
              style={{ objectPosition: visual.position ?? "50% 50%" }}
              className="absolute inset-0 w-full h-full object-cover sepia-tone"
            />
          ) : (
            <div className="absolute inset-0 bg-night-900" />
          )}

          {/* Vignette — subtle on every scene */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Click zones — left half goes back, right half goes forward.
          Sit BELOW the progress bar / caption strip / year marker (z-30),
          ABOVE the film grain and image (z<25). The caption strip is
          pointer-events-none so clicks on captions fall through to here.
          Inline links inside captions opt back IN to pointer events,
          so they remain individually clickable. */}
      <button
        type="button"
        onClick={goBack}
        disabled={index === 0}
        className="absolute top-[3px] bottom-[3px] left-0 w-1/2 z-[25] group focus:outline-none disabled:cursor-default"
        aria-label="Previous scene"
      >
        <span className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 text-3xl md:text-4xl text-stone-200 opacity-0 group-hover:opacity-50 group-disabled:opacity-0 transition-opacity duration-300 pointer-events-none select-none">
          ‹
        </span>
      </button>
      <button
        type="button"
        onClick={advance}
        className="absolute top-[3px] bottom-[3px] right-0 w-1/2 z-[25] group focus:outline-none"
        aria-label="Next scene"
      >
        <span className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-3xl md:text-4xl text-stone-200 opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none select-none">
          ›
        </span>
      </button>

      {/* Film grain — always visible, drives the celluloid feel */}
      <FilmGrain />

      {/* Letterbox bars */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-black z-40 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-[3px] bg-black z-40 pointer-events-none" />

      {/* Progress bar */}
      <div className="absolute top-[3px] inset-x-0 z-30 px-4 pt-3 flex gap-[3px] pointer-events-none">
        {scenes.map((_, i) => (
          <div
            key={i}
            className={`h-px flex-1 rounded-full transition-colors duration-700 ${
              i < index
                ? "bg-ember/80"
                : i === index
                  ? "bg-ember/50"
                  : "bg-stone-100/15"
            }`}
          />
        ))}
      </div>

      {/* Year marker (top-right) */}
      <AnimatePresence>
        {scene.year && (
          <motion.div
            key={`year-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="absolute top-5 right-5 z-30 text-[10px] uppercase tracking-[0.3em] text-ember-dim font-sans pointer-events-none"
          >
            {scene.year}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title overlay — first scene only, auto-fades */}
      <AnimatePresence>
        {titleOverlay && titleVisible && (
          <motion.div
            key="title-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-0 inset-x-0 z-30 pt-[14vh] pb-12 px-6 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(7,8,11,0.7) 0%, rgba(7,8,11,0.35) 55%, transparent 100%)",
            }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[11px] uppercase tracking-[0.4em] text-ember mb-4">
                {titleOverlay.date}
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
                className="font-display text-4xl md:text-6xl font-light leading-tight text-stone-50 tracking-tight"
              >
                {titleOverlay.title}
              </motion.h1>
              {titleOverlay.hook && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.6, delay: 1.0, ease: "easeOut" }}
                  className="mt-5 text-stone-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
                >
                  {titleOverlay.hook}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption strip — only for image scenes */}
      {!isFullFrame && (
        <div className="absolute bottom-[3px] inset-x-0 z-30 bg-gradient-to-t from-night-950/95 via-night-950/70 to-transparent pt-20 pb-7 px-6 md:px-12 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`caption-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
              className="max-w-3xl mx-auto"
              aria-live="polite"
            >
              {narrative.label && (
                <div className="text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
                  {narrative.label}
                </div>
              )}
              {narrative.text && (
                <RichText
                  text={narrative.text}
                  sources={sources}
                  className="font-display text-stone-50 text-base md:text-lg leading-relaxed block"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ChapterIntertitle({
  text,
  sources,
}: {
  text: string;
  sources?: Source[];
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8 md:px-16">
      <div className="text-center max-w-2xl">
        <div className="w-12 h-px bg-ember/60 mx-auto mb-6" />
        <RichText
          text={text}
          sources={sources}
          className="font-display text-2xl md:text-3xl text-stone-100 leading-relaxed block"
        />
        <div className="w-12 h-px bg-ember/60 mx-auto mt-6" />
      </div>
    </div>
  );
}

function PullQuote({
  text,
  attribution,
  sources,
}: {
  text: string;
  attribution: string;
  sources?: Source[];
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 md:px-16 text-center">
      <blockquote className="font-display italic text-xl md:text-3xl text-stone-50 leading-snug max-w-3xl">
        &ldquo;
        <RichText text={text} sources={sources} />
        &rdquo;
      </blockquote>
      <RichText
        text={`— ${attribution}`}
        sources={sources}
        className="mt-6 text-sm text-stone-400 max-w-md tracking-wide block"
      />
    </div>
  );
}

function FilmGrain() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-[0.07] z-20"
      aria-hidden="true"
    >
      <filter id="film-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#film-noise)" />
    </svg>
  );
}

/**
 * Effective scene duration. The manifest's durationMs is treated as a
 * floor; any scene with text long enough to require more reading time
 * lingers longer automatically. Computed as: 1.5s for the image to
 * register + (word count) / 2.8 wps for reading. Markdown link syntax
 * is stripped before counting.
 */
function effectiveDurationMs(scene: Scene): number {
  return Math.max(scene.durationMs, computeReadingMs(scene));
}

function computeReadingMs(scene: Scene): number {
  let text = "";
  switch (scene.kind) {
    case "caption":
    case "reenactment-step":
      text = scene.text;
      break;
    case "quote":
      text = `${scene.text} ${scene.attribution}`;
      break;
    case "image":
      text = scene.caption ?? "";
      break;
  }
  // Strip markdown-style [label](url) — count only the visible label.
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // 1.5s image-register hold + ~2.8 wps reading pace
  const READ_WPS = 2.8;
  const HOLD_MS = 1500;
  return Math.round(HOLD_MS + (words / READ_WPS) * 1000);
}

interface StageVisual {
  url?: string;
  alt?: string;
  position?: string;
}

function stageVisual(scene: Scene): StageVisual {
  if (scene.kind === "image") {
    return {
      url: scene.imageUrl,
      alt: scene.alt,
      position: scene.imagePosition,
    };
  }
  if (scene.kind === "caption" || scene.kind === "reenactment-step") {
    return {
      url: scene.imageUrl,
      alt: scene.imageAlt,
      position: scene.imagePosition,
    };
  }
  return {};
}

interface StageText {
  text?: string;
  label?: string;
  attribution?: string;
}

function stageText(scene: Scene): StageText {
  switch (scene.kind) {
    case "caption":
      return { text: scene.text };
    case "reenactment-step":
      return { text: scene.text, label: "Reenactment" };
    case "quote":
      return { text: scene.text, attribution: scene.attribution };
    case "image":
      return { text: scene.caption };
  }
}

interface KenBurns {
  from: { scale: number; x: string; y: string };
  to: { scale: number; x: string; y: string };
}

function kenBurnsFor(index: number, reducedMotion: boolean): KenBurns {
  if (reducedMotion) {
    const still = { scale: 1.02, x: "0%", y: "0%" };
    return { from: still, to: still };
  }
  const presets: KenBurns[] = [
    {
      from: { scale: 1.0, x: "0%", y: "0%" },
      to: { scale: 1.08, x: "-2%", y: "-1.5%" },
    },
    {
      from: { scale: 1.06, x: "1%", y: "0.5%" },
      to: { scale: 1.0, x: "-1%", y: "-0.5%" },
    },
    {
      from: { scale: 1.0, x: "-2%", y: "1%" },
      to: { scale: 1.07, x: "2%", y: "-1%" },
    },
    {
      from: { scale: 1.05, x: "1.5%", y: "0%" },
      to: { scale: 1.0, x: "-1.5%", y: "0%" },
    },
    {
      from: { scale: 1.0, x: "0%", y: "-1%" },
      to: { scale: 1.06, x: "-2%", y: "2%" },
    },
    {
      from: { scale: 1.08, x: "0%", y: "0%" },
      to: { scale: 1.0, x: "0%", y: "0%" },
    },
  ];
  return presets[index % presets.length];
}
