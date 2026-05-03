# Portal History

A directory of clickable portals that drop the user into the time and place
of a historical event. Cinematic, sourced, experiential — the inverse of a
spreadsheet-on-a-webpage.

The shell is reusable: every incident is a JSON file, and adding a new one
requires zero code changes.

---

## Quick start

```bash
git clone <repo>
cd portal-history
npm install

# Add your own Mapbox token (free, 50k loads/month).
# Sign up at https://account.mapbox.com/auth/signup/
# Copy the default public token (starts with pk.) into .env.local:
echo "VITE_MAPBOX_TOKEN=pk.your-token-here" > .env.local

npm run dev
# → http://localhost:5173
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Type-check, then build production bundle to `dist/` |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run validate` | Validate `incidents.json` against the Zod schema |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build locally |

---

## Add your own incident

Adding a new incident is a JSON-only operation. No code changes needed.

### 1. Copy the template

```bash
cp src/data/incident.template.json /tmp/my-incident.json
```

Edit the fields. The schema is documented in `src/lib/schema.ts` (it's
the source of truth for both validation and TypeScript types).

### 2. Append it to `src/data/incidents.json`

The file is a JSON array; add your new object to the end.

### 3. Document sources

Add an entry per source in `src/data/sources.md` so the provenance stays
human-readable. Cite from primary or authoritative sources only — Founders
Online, Library of Congress, Mount Vernon Digital Encyclopedia, JFK/Truman
Library, Avalon Project, etc. Wikipedia is acceptable for general reference
but should not be the only source for a factual claim.

### 4. Add images to `/public/images/`

Or hot-link directly from Wikimedia Commons by setting `imageUrl` to the
full upload.wikimedia.org URL. Wikimedia is reliable and public-domain.

### 5. Validate

```bash
npm run validate
# ✓ N incident(s) validated
```

If anything fails — wrong field, broken `sourceId` reference, malformed
date — the validator will name the issue and the path.

### Pre-publish checklist

- [ ] Coordinates verified against a primary source (Founders Online,
      LoC, Mount Vernon, etc.) — cited in `sources.md`
- [ ] Every factual claim in caption text traceable to a source in the
      incident's `sources` array
- [ ] All `sourceIds` referenced by scenes resolve in the `sources` array
      (validator catches this)
- [ ] All scene `imageUrl` values reachable (`curl -I` if uncertain)
- [ ] Total runtime ≤ 90 sec for a single-act incident, or under
      2:30 if you're using a Significance Timeline
- [ ] Dates in ISO 8601 (`YYYY-MM-DD`) for `date`; human form for
      `dateLabel`
- [ ] If the incident is sensitive or contested, the language is
      precise rather than dramatic — soften any unverifiable detail
      rather than fabricate

---

## Schema (compact reference)

Authoritative copy lives in `src/lib/schema.ts`. The shape:

```jsonc
{
  "schemaVersion": "1.0",
  "id": "kebab-case-slug",
  "title": "Display title",
  "date": "YYYY-MM-DD",
  "dateLabel": "Human-readable date",
  "hook": "One sentence that makes a stranger want to click.",
  "tags": ["optional", "filtering", "tags"],
  "location": { "lat": 0, "lng": 0, "label": "Place name" },

  // Optional. If present, the experience opens with a Mapbox flyby.
  // If omitted, the experience renders as a Ken-Burns sequence of stills.
  "flyby": {
    "startAltitude": 2000000, "endAltitude": 1500,
    "headingDeg": 215, "pitchDeg": 60, "durationMs": 8000
  },

  "scenes": [
    // Discriminated union — pick a "kind" per scene:
    { "kind": "caption",          "text": "...", "imageUrl": "...", "imageAlt": "...", "year": "...", "durationMs": 8000 },
    { "kind": "image",            "imageUrl": "...", "alt": "...", "caption": "...", "durationMs": 8000 },
    { "kind": "quote",            "text": "...", "attribution": "...", "durationMs": 10000 },
    { "kind": "reenactment-step", "text": "...", "imageUrl": "...", "durationMs": 8000 }
  ],

  "payoff": { "quote": "...", "attribution": "...", "sourceId": "...", "durationMs": 9000 },
  "sources": [{ "id": "...", "label": "...", "url": "https://..." }],

  // Optional interactive timeline. Renders below the linear stage.
  "timeline": {
    "title": "Section title",
    "intro": "One-sentence framing.",
    "moments": [{
      "id": "kebab-slug", "year": "1832", "title": "...",
      "hook": "...", "detail": "Multi-paragraph...\n\nWith blank lines.",
      "imageUrl": "...", "imageAlt": "...",
      "furtherReading": [{ "label": "...", "url": "..." }]
    }]
  }
}
```

Inline links in any narrative `text`, `hook`, or `detail` field use a
markdown-style syntax:

```
"text": "[George Washington](https://en.wikipedia.org/wiki/George_Washington) called the meeting."
```

You can use a direct URL or a `sourceId` from the incident's `sources`
array — both are resolved at render time.

---

## Architecture

```
src/
├── data/
│   ├── incidents.json        ← single source of truth for incident data
│   ├── incident.template.json ← copy/paste starter
│   └── sources.md            ← human-readable citation registry
├── lib/
│   ├── schema.ts             ← Zod schema + inferred TS types
│   ├── incidents.ts          ← loader (validates JSON at module load)
│   └── mapbox.ts             ← Mapbox token bootstrap + helpers
├── components/
│   ├── Globe.tsx             ← Mapbox 3D globe + flyby (used when incident.flyby is set)
│   ├── ScenePlayer.tsx       ← Caption overlay over the globe
│   ├── StillStage.tsx        ← Ken Burns still-image stage (used when no flyby)
│   ├── TimelineExplorer.tsx  ← Serpentine timeline + magnify modal
│   ├── IncidentCard.tsx      ← Home grid card
│   └── RichText.tsx          ← Markdown-link parser for narrative text
├── routes/
│   ├── Home.tsx              ← Directory grid
│   └── Incident.tsx          ← Per-incident experience page
├── App.tsx                   ← Routes
└── main.tsx                  ← Entry
```

### Stack

- **Vite + React + TypeScript** — toolchain
- **Tailwind v4** — styling, dark cinematic palette via `@theme` tokens
- **Framer Motion** — scene transitions, Ken Burns animation, modal
- **Zod** — runtime JSON validation; doubles as TypeScript type source
- **React Router v7** — `/` (directory) and `/incident/:id`
- **Mapbox GL JS v3** — globe + flyby (only loaded when an incident
  defines a `flyby`)

### Why these choices

The shell is decoupled from the engine. Each incident's `flyby` field
selects the renderer: present → `Globe` (Mapbox), absent → `StillStage`
(curated period stills with Ken Burns + crossfade). Future incidents
could swap to a Three.js scene, a video player, or anything else without
touching `Home.tsx`, the schema, or any other incident.

The Newburgh seed uses still-image rendering because period authenticity
mattered more than satellite accuracy. The Cincinnatus seed does the same.
A future incident with strong landscape stakes could use the map.

---

## Deploy to Netlify

`netlify.toml` is configured. Two deploy paths:

### Option A — connected to GitHub

1. Push to a GitHub repo.
2. In Netlify: New site → Import from Git → select repo.
3. Netlify reads `netlify.toml` automatically (build command, publish
   directory, SPA redirects).
4. Add `VITE_MAPBOX_TOKEN` as a site environment variable in Netlify's UI.
5. After first deploy, restrict the Mapbox token to your Netlify URL in
   the Mapbox dashboard.

### Option B — drag-and-drop

```bash
npm run build
# drop the dist/ folder onto https://app.netlify.com/drop
```

You'll need to set `VITE_MAPBOX_TOKEN` in Netlify environment variables
after the first deploy if you want any future map-driven incidents to
work.

---

## Accessibility

- Reduced-motion fallback: scenes do not animate, Ken Burns is disabled.
- All interactive elements keyboard-reachable; visible focus rings.
- ARIA labels on the timeline nodes, scene player, modal, and toggles.
- Body scroll locked while the magnify modal is open; Esc closes.
- Caption text against a dark gradient for high contrast.

---

## Credits

- Period imagery from [Wikimedia Commons](https://commons.wikimedia.org)
  (public domain — see each incident's `sources` array for individual
  credits).
- Citations against [Founders Online](https://founders.archives.gov),
  [Mount Vernon Digital Encyclopedia](https://www.mountvernon.org/library/digitalhistory/),
  the Truman Library, JFK Library, the Library of Congress, and others.
- Aesthetic influences: Ken Burns documentaries, NYT *Snow Fall* and the
  *1619 Project*, Pudding.cool, the Met's Heilbrunn Timeline, Stripe Press.
