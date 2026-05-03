/**
 * Mapbox helpers — token bootstrap and altitude/zoom conversion.
 *
 * Why these live here, separate from the Globe component:
 *  - The token initialization happens once, module-load. Importing this
 *    file from anywhere guarantees mapbox-gl is configured before use.
 *  - altitudeToZoom is approximate but consistent across the app.
 */
import mapboxgl from "mapbox-gl";

const token = import.meta.env.VITE_MAPBOX_TOKEN;
if (!token) {
  throw new Error(
    "VITE_MAPBOX_TOKEN is not set. Add it to .env.local and restart the dev server.",
  );
}
mapboxgl.accessToken = token;

export { mapboxgl };

/**
 * Approximate altitude (meters) → Mapbox zoom level conversion.
 * Tuned so 2,000,000m ≈ zoom 4.6 (continental), 1,500m ≈ zoom 15 (street).
 */
export function altitudeToZoom(altitudeMeters: number): number {
  return Math.log2(50_000_000 / Math.max(1, altitudeMeters));
}
