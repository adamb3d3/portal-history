/**
 * Adds imageUrl for the two AI-generated timeline images that were
 * dropped into public/images/timeline/. Idempotent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../src/data/incidents.json");
const data = JSON.parse(readFileSync(dataPath, "utf8"));

const PATCHES = {
  "war-powers-1973": {
    imageUrl: "/images/timeline/war-powers-1973.png",
    imageAlt:
      "Override vote on the War Powers Resolution, U.S. House chamber, November 7, 1973",
    imagePosition: "50% 45%",
  },
  "reconstruction-1867": {
    imageUrl: "/images/timeline/reconstruction-1867.png",
    imageAlt:
      "Newly emancipated Black men registering to vote under federal Reconstruction, 1867 (Harper's Weekly–style engraving)",
    imagePosition: "50% 50%",
  },
};

let count = 0;
for (const incident of data) {
  if (!incident.timeline) continue;
  for (const m of incident.timeline.moments) {
    const patch = PATCHES[m.id];
    if (!patch) continue;
    Object.assign(m, patch);
    count++;
  }
}

writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ Patched ${count} moment(s) with AI-generated imageUrl`);
