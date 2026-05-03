/**
 * One-shot script that mutates incidents.json to:
 *   1. Add bridges between Cincinnatus and Newburgh
 *   2. Add an `aiPrompt` field to every timeline moment that doesn't
 *      already have one — this is the AI image-generation brief the
 *      user can hand to ChatGPT/DALL-E/Midjourney/Firefly later.
 *
 * Idempotent — running it twice does nothing the second time.
 *
 * Run: node scripts/add-bridges-and-prompts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../src/data/incidents.json");
const data = JSON.parse(readFileSync(dataPath, "utf8"));

// ── Bridges ────────────────────────────────────────────────────────

const BRIDGES = {
  "cincinnatus-458-bce": {
    incidentId: "newburgh-conspiracy-1783",
    headline: "And again, twenty-three centuries later.",
    subhead:
      "March 1783. George Washington walks into a meeting of his unpaid officers, conscious of being measured against the man at the plow.",
    cta: "Continue to The Newburgh Conspiracy",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/75/General_George_Washington_Resigning_his_Commission.jpg",
    imageAlt:
      "John Trumbull, General George Washington Resigning His Commission, 1824",
    imagePosition: "50% 38%",
    aiPrompt:
      "Cinematic period painting in the style of John Trumbull, late 18th century. Continental Army officer George Washington in dress uniform, handing a sealed scroll to a seated Continental Congress. Warm candle-light, sepia and slate palette, dignified gravity, painterly. No modern elements.",
  },
  "newburgh-conspiracy-1783": {
    incidentId: "cincinnatus-458-bce",
    headline: "The standard he was measured against.",
    subhead:
      "458 BCE. A Roman farmer named Cincinnatus is summoned from his plow to take absolute power. Sixteen days later he gives it back.",
    cta: "Continue to Cincinnatus",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/81/Cincinato_abandona_el_arado_para_dictar_leyes_a_Roma%2C_c.1806_de_Juan_Antonio_Ribera.jpg",
    imageAlt:
      "Juan Antonio Ribera, Cincinnatus Abandons the Plow to Dictate Laws to Rome, c. 1806",
    imagePosition: "50% 45%",
    aiPrompt:
      "Cinematic Neoclassical-style oil painting, c. 1800. Roman senators in togas approaching an older man at a plow in a sunlit field by a river. The man is wiping dirt from his face. Distant Roman city visible. Sepia and ochre palette, painterly, warm late-afternoon light. No modern elements.",
  },
};

// ── AI prompts for each timeline moment ────────────────────────────

const PROMPTS = {
  "quasi-war-1798":
    "Period oil-portrait of Alexander Hamilton in late-1790s American military uniform as Major General, sepia and candle-lit, painterly, no modern elements.",
  "jefferson-1801":
    "Painting of Thomas Jefferson at his March 1801 inauguration on the steps of the unfinished US Capitol, ceremonial robe, sepia and slate palette, no modern elements.",
  "war-1812":
    "19th-century engraving style: the British burning of Washington in August 1814 — flames silhouetting the Capitol against a night sky, smoke, distant figures fleeing, dark sepia.",
  "nullification-1832":
    "Period portrait of Andrew Jackson seated at a desk holding the Force Bill proclamation, stern expression, oil painting, mid-19th-century, sepia.",
  "scott-polk-1846":
    "Period oil portrait of General Winfield Scott in 1840s American dress uniform, half-length, framed by maps of Mexico in the background, sepia.",
  "lincoln-command-1861":
    "Period black-and-white photograph: Abraham Lincoln in 1861 standing at his White House desk, papers strewn around, dim window light, formal melancholy.",
  "lincoln-mcclellan-1862":
    "Period black-and-white photograph of Lincoln meeting McClellan in McClellan's tent at Antietam, October 1862. Both standing, Lincoln in tall hat, autumn light through tent canvas.",
  "appomattox-1865":
    "19th-century painting of Robert E. Lee surrendering to Ulysses S. Grant in McLean House parlor, April 9 1865. Period-accurate uniforms, oil painting, warm interior light.",
  "reconstruction-1867":
    "Period engraving (Harper's Weekly style): Union soldiers overseeing the voter registration of freed Black men in the post-Civil-War South, 1867. Sepia, formal, dignified.",
  "spanish-american-1898":
    "Period photograph of President McKinley at his White House desk signing the war declaration against Spain, April 1898. Sepia tone, formal, advisors in background.",
  "wilson-pershing-1917":
    "Black-and-white period photograph of General John J. Pershing in WWI American Expeditionary Force uniform, formal portrait, 1917, sepia.",
  "bonus-army-1932":
    "1932 black-and-white photograph: the Bonus Army camp at Anacostia Flats, Washington DC, with smoke rising from burning shanties and silhouetted soldiers in the foreground.",
  "nat-sec-act-1947":
    "1947 black-and-white photograph of President Truman at a desk signing the National Security Act, advisors and military officers standing behind him. Formal Oval Office setting.",
  "truman-macarthur-1951": null /* already has imageUrl */,
  "little-rock-1957":
    "1957 black-and-white photograph: soldiers from the 101st Airborne Division in helmets and rifles escorting the Little Rock Nine into Central High School. Stark, dignified.",
  "missile-crisis-1962":
    "1962 black-and-white photograph: President Kennedy and ExComm advisors around a long cabinet table during the Cuban Missile Crisis. Formal, tense, papers spread out.",
  "war-powers-1973":
    "1973 photograph of the U.S. Capitol building at dusk with the dome lit, newspapers visible in foreground showing 'War Powers Act' headlines. Documentary feel.",
  "nixon-resigns-1974":
    "August 9, 1974 photograph of Richard Nixon at the helicopter steps on the South Lawn, arms raised in farewell wave, after announcing his resignation. Documentary, color or sepia.",
  "goldwater-nichols-1986":
    "1986 photograph of President Reagan at a desk signing the Goldwater-Nichols Defense Reorganization Act, surrounded by uniformed Joint Chiefs and Secretary of Defense. Formal Oval Office.",
  "gulf-war-1991":
    "1991 photograph of General Norman Schwarzkopf in desert fatigues at a press conference podium, large map of Iraq behind him, pointer in hand. Documentary, color.",
  "dadt-1993":
    "1993 photograph of President Clinton at his desk signing the DADT compromise legislation, military service chiefs standing behind in dress uniform. Documentary, color.",
  "mcchrystal-2010":
    "2010 photograph of General Stanley McChrystal in U.S. Army camouflage fatigues in Afghanistan, standing in front of a map, looking pensive. Documentary, color.",
  "lafayette-square-2020":
    "June 1, 2020 photograph: Chairman Mark Milley in Army Combat Uniform walking past Lafayette Square with President Trump and other officials toward St. John's Episcopal Church. Documentary, color, dusk.",
  "jan-6-2021":
    "Wide photograph of the U.S. Capitol Rotunda at night on January 6, 2021. National Guard troops sleeping in formation on the marble floor, statues looming above, dim light.",
  "present-day":
    "Stylized minimalist composition: the U.S. Constitution document fading into a contemporary military uniform sleeve, sepia and slate tones. Suggestive of continuity, not literal — for a closing card.",
};

// ── Apply ──────────────────────────────────────────────────────────

let bridgesAdded = 0;
let promptsAdded = 0;

for (const incident of data) {
  // Bridge
  if (BRIDGES[incident.id] && !incident.bridgeTo) {
    incident.bridgeTo = BRIDGES[incident.id];
    bridgesAdded++;
  }

  // Timeline moment AI prompts
  if (incident.timeline && Array.isArray(incident.timeline.moments)) {
    for (const m of incident.timeline.moments) {
      const prompt = PROMPTS[m.id];
      if (prompt && !m.aiPrompt) {
        m.aiPrompt = prompt;
        promptsAdded++;
      }
    }
  }
}

writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ Added ${bridgesAdded} bridge(s) and ${promptsAdded} aiPrompt(s)`);
