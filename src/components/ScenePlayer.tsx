import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Scene } from "../lib/schema";

interface Props {
  scenes: Scene[];
  /**
   * Fires when the last scene's duration has elapsed. The Incident
   * route uses this to transition into the payoff state.
   */
  onComplete: () => void;
}

/**
 * Plays the manifest's scenes in sequence as captioned overlays on
 * the map. Auto-advances on each scene's durationMs; the user can
 * click the caption strip or press Enter/Space to advance manually.
 *
 * Cleanup is important: every render resets the auto-advance timer
 * via the useEffect cleanup, so manual advance and unmount both
 * cancel pending timers cleanly.
 */
export default function ScenePlayer({ scenes, onComplete }: Props) {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    if (index >= scenes.length) {
      onComplete();
      return;
    }
    const id = window.setTimeout(advance, scenes[index].durationMs);
    return () => window.clearTimeout(id);
  }, [index, scenes, advance, onComplete]);

  if (index >= scenes.length) return null;

  const scene = scenes[index];

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col">
      {/* Progress bar across the top — one segment per scene */}
      <div className="px-4 pt-3 flex gap-1">
        {scenes.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
              i < index
                ? "bg-ember"
                : i === index
                  ? "bg-ember/60"
                  : "bg-stone-100/15"
            }`}
          />
        ))}
      </div>

      {/* Caption strip pinned to the bottom of the overlay */}
      <div className="mt-auto bg-gradient-to-t from-night-950/95 via-night-950/70 to-transparent pt-16 pb-6 px-6 md:px-12 pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onClick={advance}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                advance();
              }
            }}
            role="button"
            tabIndex={0}
            aria-live="polite"
            aria-label={`Scene ${index + 1} of ${scenes.length}. Press Enter to advance.`}
            className="cursor-pointer max-w-3xl mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-ember rounded"
          >
            {renderSceneBody(scene)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function renderSceneBody(scene: Scene) {
  switch (scene.kind) {
    case "caption":
      return (
        <p className="text-stone-50 text-base md:text-lg leading-relaxed font-display">
          {scene.text}
        </p>
      );
    case "reenactment-step":
      return (
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-ember mb-2">
            Reenactment
          </div>
          <p className="text-stone-50 text-base md:text-lg leading-relaxed font-display">
            {scene.text}
          </p>
        </div>
      );
    case "quote":
      return (
        <div>
          <blockquote className="font-display italic text-xl md:text-2xl text-stone-50 leading-relaxed">
            &ldquo;{scene.text}&rdquo;
          </blockquote>
          <div className="mt-2 text-sm text-stone-400">
            — {scene.attribution}
          </div>
        </div>
      );
    case "image":
      return (
        <figure>
          <img
            src={scene.imageUrl}
            alt={scene.alt}
            className="max-w-full mx-auto rounded"
          />
          {scene.caption && (
            <figcaption className="mt-2 text-sm text-stone-400">
              {scene.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}
