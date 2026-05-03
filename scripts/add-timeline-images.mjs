/**
 * One-shot: adds verified Wikimedia public-domain imageUrls to each
 * timeline moment that doesn't have one yet. Idempotent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../src/data/incidents.json");
const data = JSON.parse(readFileSync(dataPath, "utf8"));

const IMAGES = {
  "quasi-war-1798": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/John_Trumbull_-_Alexander_Hamilton_-_Google_Art_Project.jpg",
    imageAlt: "John Trumbull, posthumous portrait of Alexander Hamilton, 1806",
    imagePosition: "50% 30%",
  },
  "jefferson-1801": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/Official_Presidential_portrait_of_Thomas_Jefferson_%28by_Rembrandt_Peale%2C_1800%29.jpg",
    imageAlt: "Rembrandt Peale, official presidential portrait of Thomas Jefferson, 1800",
    imagePosition: "50% 25%",
  },
  "war-1812": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f2/Burning_of_Washington_1814.jpg",
    imageAlt: "Period illustration: the British burning of Washington, August 1814",
    imagePosition: "50% 50%",
  },
  "nullification-1832": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Andrew_jackson_head_%28cropped%29.jpg",
    imageAlt: "Formal portrait of Andrew Jackson, c. 1835",
    imagePosition: "50% 30%",
  },
  "scott-polk-1846": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Winfield_Scott_by_Fredricks%2C_1862_crop.jpg",
    imageAlt: "General Winfield Scott in dress uniform, photograph by Fredricks, c. 1862",
    imagePosition: "50% 25%",
  },
  "lincoln-command-1861": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/57/Abraham_Lincoln_1863_Portrait_%283x4_cropped%29.jpg",
    imageAlt: "Iconic 1863 photographic portrait of Abraham Lincoln",
    imagePosition: "50% 30%",
  },
  "lincoln-mcclellan-1862": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/92/Lincoln_and_McClellan_1862-10-03.jpg",
    imageAlt: "Lincoln and McClellan in McClellan's tent at Antietam, October 1862",
    imagePosition: "50% 50%",
  },
  "appomattox-1865": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/General_Robert_E._Lee_surrenders_at_Appomattox_Court_House_1865.jpg",
    imageAlt: "Print depicting Lee's surrender to Grant at Appomattox Court House, April 1865",
    imagePosition: "50% 50%",
  },
  "spanish-american-1898": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/84/Collage_infobox_for_Spanish-American_War.jpg",
    imageAlt: "Period collage of imagery from the Spanish-American War, 1898",
    imagePosition: "50% 50%",
  },
  "wilson-pershing-1917": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/General_John_Joseph_Pershing_head_on_shoulders.jpg",
    imageAlt: "Photographic portrait of General John J. Pershing, c. 1917",
    imagePosition: "50% 25%",
  },
  "bonus-army-1932": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/00/Evictbonusarmy.jpg",
    imageAlt: "Bonus Army shacks burning at Anacostia Flats, July 1932",
    imagePosition: "50% 50%",
  },
  "nat-sec-act-1947": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/60/Photograph_of_President_Truman_at_his_desk_in_the_Oval_Office%2C_signing_the_National_Security_Act_Amendments_of_1949..._-_NARA_-_200168.jpg",
    imageAlt: "President Truman signing the National Security Act Amendments at his Oval Office desk, 1949",
    imagePosition: "50% 50%",
  },
  "little-rock-1957": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e5/Operation_Arkansas%2C_Little_Rock_Nine.jpg",
    imageAlt: "101st Airborne troops escorting the Little Rock Nine into Central High School, September 1957",
    imagePosition: "50% 50%",
  },
  "missile-crisis-1962": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/17/McNamara_and_Kennedy.jpg",
    imageAlt: "President Kennedy and Secretary McNamara in an EXCOMM meeting during the Cuban Missile Crisis, October 1962",
    imagePosition: "50% 35%",
  },
  "nixon-resigns-1974": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a4/President_Richard_Nixon_Departing_the_White_House_on_the_Presidential_Helicopter_for_the_Last_Time_as_President.jpg",
    imageAlt: "Richard Nixon departing the White House on the presidential helicopter for the last time, August 9, 1974",
    imagePosition: "50% 50%",
  },
  "goldwater-nichols-1986": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e7/GoldwaterNichols.jpg",
    imageAlt: "Senators Barry Goldwater and Bill Nichols, co-sponsors of the Goldwater-Nichols Act of 1986",
    imagePosition: "50% 35%",
  },
  "gulf-war-1991": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/17/NormanSchwarzkopf.jpg",
    imageAlt: "Official portrait of General Norman Schwarzkopf in uniform, 1988",
    imagePosition: "50% 25%",
  },
  "dadt-1993": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/ff/Screenshot_of_Video_Recording_of_President_William_Jefferson_Clinton.png",
    imageAlt: "President Clinton announcing the Don't Ask Don't Tell policy, 1993",
    imagePosition: "50% 30%",
  },
  "mcchrystal-2010": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/68/Gen._Stanley_McChrystal_USFOR-Y.jpg",
    imageAlt: "Official portrait of General Stanley A. McChrystal, c. 2009",
    imagePosition: "50% 25%",
  },
  "lafayette-square-2020": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3c/President_Trump_Visits_St._John%27s_Episcopal_Church_%2849964152976%29.jpg",
    imageAlt: "President Trump and officials walking from the White House through Lafayette Square to St. John's Episcopal Church, June 1, 2020",
    imagePosition: "50% 35%",
  },
  "jan-6-2021": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d3/2021_storming_of_the_United_States_Capitol_09.jpg",
    imageAlt: "Wide shot of the U.S. Capitol during the January 6, 2021 attack",
    imagePosition: "50% 50%",
  },
  "present-day": {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6c/Constitution_of_the_United_States%2C_page_1.jpg",
    imageAlt: "First page of the United States Constitution, engrossed by Jacob Shallus, 1787",
    imagePosition: "50% 30%",
  },
};

let count = 0;
for (const incident of data) {
  if (!incident.timeline) continue;
  for (const m of incident.timeline.moments) {
    const update = IMAGES[m.id];
    if (!update) continue;
    if (m.imageUrl) continue; // skip already-set
    Object.assign(m, update);
    count++;
  }
}

writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ Added imageUrl to ${count} timeline moment(s)`);
