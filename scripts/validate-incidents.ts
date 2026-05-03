/**
 * Runtime validation check for src/data/incidents.json.
 *
 * Run with:  npm run validate
 *
 * Exits non-zero on any schema violation, with the field path and the
 * reason printed to stderr. Useful as a pre-commit / CI gate when the
 * data file grows.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { IncidentsSchema } from "../src/lib/schema.ts";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../src/data/incidents.json");
const raw = JSON.parse(readFileSync(dataPath, "utf8"));

const result = IncidentsSchema.safeParse(raw);

if (!result.success) {
  console.error("✗ incidents.json failed schema validation:");
  for (const issue of result.error.issues) {
    const path = issue.path.length ? issue.path.join(".") : "(root)";
    console.error(`  [${path}] ${issue.message}`);
  }
  process.exit(1);
}

console.log(`✓ ${result.data.length} incident(s) validated`);
for (const incident of result.data) {
  console.log(`  · ${incident.id} — ${incident.title}`);
  console.log(
    `    ${incident.scenes.length} scenes, ${incident.sources.length} sources, payoff cites "${incident.payoff.sourceId}"`,
  );
}
