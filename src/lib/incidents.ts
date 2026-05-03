import rawIncidents from "../data/incidents.json";
import { IncidentsSchema, type Incident } from "./schema";

const result = IncidentsSchema.safeParse(rawIncidents);

if (!result.success) {
  console.error("[incidents.json] failed schema validation");
  console.error(JSON.stringify(result.error.format(), null, 2));
  throw new Error(
    "incidents.json failed schema validation — see browser console for details.",
  );
}

export const incidents: Incident[] = result.data;

export const getIncidentById = (id: string): Incident | undefined =>
  incidents.find((i) => i.id === id);
