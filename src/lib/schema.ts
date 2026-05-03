import { z } from "zod";

/**
 * Schema for a Portal History "incident" — one historical moment a user
 * can drop into. Adding a new incident is a JSON-only operation; this
 * schema is the contract that JSON must satisfy.
 *
 * Two patterns to know:
 *  1. Discriminated union for `scenes` — each `kind` defines its own
 *     required fields, so TypeScript narrows correctly and bad data
 *     produces a precise error.
 *  2. Sources are objects with `id`s; scenes & payoff reference them by
 *     id. Lets the UI render inline citations and lets a validator
 *     check that every cited id resolves.
 */

export const SOURCE_ID = z.string().min(1);

export const SourceSchema = z.object({
  id: SOURCE_ID,
  label: z.string().min(1),
  url: z.string().url(),
});

const baseSceneFields = {
  durationMs: z.number().int().positive(),
  sourceIds: z.array(SOURCE_ID).optional(),
  /**
   * Optional date marker rendered as a small corner overlay on the
   * stage. Use it to anchor scenes in time, especially across chapter
   * jumps. Free-form string so authors can write "March 1783",
   * "Winter 1783", "1797", or "Today" as appropriate.
   */
  year: z.string().optional(),
};

export const CaptionSceneSchema = z.object({
  kind: z.literal("caption"),
  text: z.string().min(1),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  imagePosition: z.string().optional(),
  ...baseSceneFields,
});

export const ImageSceneSchema = z.object({
  kind: z.literal("image"),
  imageUrl: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  imagePosition: z.string().optional(),
  ...baseSceneFields,
});

export const QuoteSceneSchema = z.object({
  kind: z.literal("quote"),
  text: z.string().min(1),
  attribution: z.string().min(1),
  ...baseSceneFields,
});

export const ReenactmentStepSchema = z.object({
  kind: z.literal("reenactment-step"),
  text: z.string().min(1),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  imagePosition: z.string().optional(),
  ...baseSceneFields,
});

export const SceneSchema = z.discriminatedUnion("kind", [
  CaptionSceneSchema,
  ImageSceneSchema,
  QuoteSceneSchema,
  ReenactmentStepSchema,
]);

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().min(1),
});

/**
 * Camera flyby parameters. Units follow Mapbox conventions:
 *  - altitudes are meters (start & end)
 *  - headingDeg: 0 = N, 90 = E, 180 = S, 270 = W
 *  - pitchDeg: 0 = top-down (camera straight down), 85 = nearly horizon
 *  - durationMs: total flyby duration in milliseconds
 */
export const FlybySchema = z.object({
  startAltitude: z.number().positive(),
  endAltitude: z.number().positive(),
  headingDeg: z.number().min(0).max(360),
  pitchDeg: z.number().min(0).max(85),
  durationMs: z.number().int().positive(),
});

export const PayoffSchema = z.object({
  quote: z.string().min(1),
  attribution: z.string().min(1),
  sourceId: SOURCE_ID,
  durationMs: z.number().int().positive(),
});

export const ReadingItemSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

/**
 * A single node on a timeline serpent. Clicking it magnifies into a
 * modal showing the full detail, image (if any), inline-linked
 * narrative paragraphs, and a "further reading" list.
 *
 * Narrative-text fields (hook, detail) may contain markdown-style
 * links: [label](url) for absolute URLs, or [label](sourceId) which
 * are resolved against the incident's sources array at render time.
 * detail may use blank lines to separate paragraphs.
 */
export const TimelineMomentSchema = z.object({
  id: z.string().min(1),
  year: z.string().min(1),
  date: z.string().optional(),
  title: z.string().min(1),
  hook: z.string().min(1),
  detail: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  imagePosition: z.string().optional(),
  sourceIds: z.array(SOURCE_ID).optional(),
  furtherReading: z.array(ReadingItemSchema).optional(),
});

/**
 * Optional interactive timeline rendered below the linear stage.
 * Lets users explore moments at their own pace rather than passively
 * watching a scripted sequence.
 */
export const TimelineSchema = z.object({
  title: z.string().optional(),
  intro: z.string().optional(),
  moments: z.array(TimelineMomentSchema).min(1),
});

export const IncidentSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    id: z.string().min(1),
    title: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use ISO 8601: YYYY-MM-DD"),
    dateLabel: z.string().min(1),
    hook: z.string().min(1),
    tags: z.array(z.string().min(1)).optional(),
    location: LocationSchema,
    /**
     * Optional. When present, the experience opens with a Mapbox flyby
     * to the location. When absent, the experience is rendered as a
     * Ken-Burns sequence of still images instead (each scene's
     * imageUrl drives the visual). Newburgh uses still images.
     */
    flyby: FlybySchema.optional(),
    posterImageUrl: z.string().optional(),
    scenes: z.array(SceneSchema).min(1),
    payoff: PayoffSchema,
    sources: z.array(SourceSchema).min(1),
    /**
     * Optional interactive timeline rendered below the linear stage,
     * for charting an event's significance through subsequent
     * moments the user can explore at their own pace.
     */
    timeline: TimelineSchema.optional(),
  })
  .superRefine((incident, ctx) => {
    const sourceIds = new Set(incident.sources.map((s) => s.id));

    if (!sourceIds.has(incident.payoff.sourceId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payoff", "sourceId"],
        message: `payoff.sourceId "${incident.payoff.sourceId}" does not match any sources[].id`,
      });
    }

    incident.scenes.forEach((scene, i) => {
      if (!scene.sourceIds) return;
      scene.sourceIds.forEach((id, j) => {
        if (!sourceIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scenes", i, "sourceIds", j],
            message: `scene #${i} references unknown sourceId "${id}"`,
          });
        }
      });
    });
  });

export const IncidentsSchema = z.array(IncidentSchema);

export type Source = z.infer<typeof SourceSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type CaptionScene = z.infer<typeof CaptionSceneSchema>;
export type ImageScene = z.infer<typeof ImageSceneSchema>;
export type QuoteScene = z.infer<typeof QuoteSceneSchema>;
export type ReenactmentStep = z.infer<typeof ReenactmentStepSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Flyby = z.infer<typeof FlybySchema>;
export type Payoff = z.infer<typeof PayoffSchema>;
export type ReadingItem = z.infer<typeof ReadingItemSchema>;
export type TimelineMoment = z.infer<typeof TimelineMomentSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
