# Portal History — sources

This file is the human-readable source-of-truth for citations that
appear in the app. Every claim a user reads on screen should trace
to an entry below. Each `id` matches a `sources[].id` in
`incidents.json`, which scenes reference via `sourceIds`.

When you add an incident, add its sources here AND in the incident's
`sources` array in `incidents.json`. They must match by `id`.

---

## Newburgh Conspiracy — March 15, 1783, and the arc forward

### Primary and historical sources

#### `founders-newburgh-address`
**From George Washington to Officers of the Army, 15 March 1783**
National Archives, Founders Online.
<https://founders.archives.gov/documents/Washington/99-01-02-10840>

The address itself, in Washington's hand. Source for the "Let me
conjure you..." pull quote and the framing of his prepared remarks.

#### `mv-newburgh-address`
**Newburgh Address — Mount Vernon Digital Encyclopedia**
<https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/newburgh-address>

Authoritative narrative summary: Armstrong's authorship, the
counter-meeting, the spectacles moment, and Major Samuel Shaw's
journal note that "many were convulsed with tears."

#### `mv-new-windsor-cantonment`
**New Windsor Cantonment — Mount Vernon Digital Encyclopedia**
<https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/new-windsor-cantonment>

Establishes the army wintered at New Windsor (distinct from
Washington's Newburgh headquarters), and locates the New Building
within it.

#### `mv-spectacles-quote`
**"Gentlemen, you will permit me to put on my spectacles..." — Mount Vernon Quotes**
<https://www.mountvernon.org/library/digitalhistory/past-projects/quotes/article/gentlemen-you-will-permit-me-to-put-on-my-spectacles-for-i-have-grown-not-only-gray-but-almost-blind-in-the-service-of-my-country>

Source for the payoff quote. Multiple slightly differing formulations
of this remark are attested; the Mount Vernon page documents the most
commonly cited version, which is the one used in the manifest.

#### `nys-parks-cantonment`
**New Windsor Cantonment State Historic Site — NY State Parks**
<https://parks.ny.gov/visit/historic-sites/new-windsor-cantonment-state-historic-site>

Establishes the present-day site location (374 Temple Hill Road,
New Windsor, NY); the lat/lng in the manifest correspond to the
marked Temple Building location at this site.

### Significance arc — December 1783 onward

#### `mv-resignation`
**Resignation of Commission — Mount Vernon Digital Encyclopedia**
<https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/resignation-of-commission>

December 23, 1783, Annapolis. Washington returns his commission to
the Continental Congress, completing the precedent he established at
Newburgh nine months earlier.

#### `mv-greatest-man`
**King George III — Mount Vernon Digital Encyclopedia**
<https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/king-george-iii>

Source for the line "If he does that, he will be the greatest man in
the world," reported to have been said by King George III on hearing
that Washington intended to resign and return to his farm. The
remark was recorded by the painter Benjamin West.

#### `constitution-article-ii`
**The Constitution of the United States — Article II — National Archives**
<https://www.archives.gov/founding-docs/constitution-transcript>

Article II, Section 2: "The President shall be Commander in Chief of
the Army and Navy of the United States..." Codifies civilian
supremacy in federal law in 1787.

#### `mv-farewell`
**Washington's Farewell Address — Mount Vernon Digital Encyclopedia**
<https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/washingtons-farewell-address>

Context for Washington's voluntary departure after two terms in 1797
— the first peaceful transfer of executive power between elected
leaders in the modern era.

#### `truman-macarthur`
**Truman Relieves MacArthur of Command — Truman Library**
<https://www.trumanlibrary.gov/education/online-collections/korean-war/relief-general-macarthur>

April 11, 1951. President Truman dismisses General Douglas MacArthur
for insubordination during the Korean War. A 20th-century test of
the civilian-control norm; the norm holds.

### Image attributions (Wikimedia Commons, public domain)

| ID | Image |
|---|---|
| `wm-hudson-valley` | B.L. Singley, *Hudson River Valley, N.Y.* |
| `wm-armstrong-portrait` | Rembrandt Peale, John Armstrong Jr. |
| `wm-cantonment-temple` | Reconstructed Temple at New Windsor Cantonment |
| `wm-morris-portrait` | Charles Willson Peale, *Robert and Gouverneur Morris*, 1783 |
| `wm-stuart-washington` | Gilbert Stuart, Williamstown portrait of Washington |
| `wm-trumbull-resignation` | John Trumbull, *General George Washington Resigning His Commission*, 1824 |
| `wm-king-george-iii` | Allan Ramsay, *King George III in coronation robes* |
| `wm-christy-constitution` | Howard Chandler Christy, *Scene at the Signing of the Constitution of the United States*, 1940 (PD via Architect of the Capitol) |
| `wm-lansdowne` | Gilbert Stuart, *George Washington (Lansdowne Portrait)*, 1796 |
| `wm-truman-macarthur` | President Truman with General MacArthur at Wake Island, October 1950 |

URLs for each are recorded in `incidents.json` and link directly to
the Wikimedia Commons file pages, where the underlying source and
license details can be inspected.
