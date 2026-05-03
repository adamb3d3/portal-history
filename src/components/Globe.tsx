import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { mapboxgl, altitudeToZoom } from "../lib/mapbox";
import type { Flyby, Location } from "../lib/schema";

interface Props {
  location: Location;
  flyby: Flyby;
  /**
   * Called once the camera has arrived at the end state. The Incident
   * route uses this to kick off scene playback.
   */
  onFlybyComplete?: () => void;
  /**
   * Anything rendered here is overlaid on top of the map (e.g. the
   * scene player). Use absolute positioning inside the overlay.
   */
  children?: ReactNode;
}

export default function Globe({
  location,
  flyby,
  onFlybyComplete,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const completedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [arrived, setArrived] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const startZoom = altitudeToZoom(flyby.startAltitude);
    const endZoom = altitudeToZoom(flyby.endAltitude);
    const center: [number, number] = [location.lng, location.lat];

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/standard",
        projection: "mercator",
        center,
        zoom: prefersReducedMotion ? endZoom : startZoom,
        pitch: prefersReducedMotion ? flyby.pitchDeg : 0,
        bearing: prefersReducedMotion ? flyby.headingDeg : 0,
        interactive: false,
        attributionControl: true,
      });
      map.on("load", () => {
        // Force a resize after style load — defends against canvas-sizing
        // quirks where the WebGL viewport doesn't match the container.
        requestAnimationFrame(() => map.resize());
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[Globe] Map construction failed:", e);
      // Defer the setState past the current effect tick so the lint
      // rule against synchronous setState in effects is satisfied.
      queueMicrotask(() => setError(msg));
      return;
    }

    mapRef.current = map;

    map.on("error", (e) => {
      const message = e?.error?.message ?? "Unknown Mapbox error";
      console.error("[Globe] Mapbox error event:", e);
      setError(message);
    });

    const fireComplete = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setArrived(true);
      onFlybyComplete?.();
    };

    if (prefersReducedMotion) {
      map.on("load", fireComplete);
    } else {
      map.on("load", () => {
        // Tiny delay so the user sees the starting frame before the camera moves.
        window.setTimeout(() => {
          map.flyTo({
            center,
            zoom: endZoom,
            bearing: flyby.headingDeg,
            pitch: flyby.pitchDeg,
            duration: flyby.durationMs,
            curve: 1.4,
            essential: true,
          });
        }, 500);
      });
      map.once("moveend", fireComplete);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [
    flyby.durationMs,
    flyby.endAltitude,
    flyby.headingDeg,
    flyby.pitchDeg,
    flyby.startAltitude,
    location.lat,
    location.lng,
    onFlybyComplete,
    prefersReducedMotion,
  ]);

  const skip = () => {
    const map = mapRef.current;
    if (!map || arrived) return;
    map.jumpTo({
      center: [location.lng, location.lat],
      zoom: altitudeToZoom(flyby.endAltitude),
      bearing: flyby.headingDeg,
      pitch: flyby.pitchDeg,
    });
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden border border-night-700 bg-night-900">
      <div ref={containerRef} className="absolute inset-0" />

      {error && (
        <div className="absolute inset-0 z-30 bg-night-950/95 flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <p className="text-[11px] uppercase tracking-[0.3em] text-red-400 mb-3">
              Map failed to load
            </p>
            <p className="text-stone-300 text-sm leading-relaxed">{error}</p>
            <p className="text-stone-500 text-xs mt-4">
              Check the browser console (right-click → Inspect → Console) for
              the full error and share it back.
            </p>
          </div>
        </div>
      )}

      {!arrived && !prefersReducedMotion && !error && (
        <button
          type="button"
          onClick={skip}
          className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-md bg-night-900/80 hover:bg-night-800 text-stone-200 text-xs uppercase tracking-widest border border-night-700 backdrop-blur-sm transition-colors"
        >
          Skip flyby
        </button>
      )}

      <div className="absolute bottom-3 left-3 z-[5] text-[11px] uppercase tracking-widest text-stone-300/80 pointer-events-none">
        {location.label}
      </div>

      {children}
    </div>
  );
}
