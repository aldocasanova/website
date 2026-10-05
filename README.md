# aldocasanova

A small static Astro site: home, profile, and Markdown notes. Black and white interface, original-color photographs, and occasional text-art visitors. All visitor-facing content is in English.

## Run locally

Use Node.js 24 LTS (or a supported newer even-numbered version).

```sh
npm install
npm run dev
```

Open the local address printed by Astro, normally `http://localhost:4321`.

```sh
npm run check
npm run build
npm run preview
```

`dist/` contains the complete static site. No server, database, or API key is required. JavaScript enhances navigation with Astro's ClientRouter, the live clock, and decorative animation; regular page navigation and notes also work without it.

## Write a note

Add a `.md` file to `src/content/blog/`. Its filename becomes its URL; for example, `reading-notes.md` becomes `/blog/reading-notes/`. Use unique lowercase filenames with hyphens.

```md
---
title: Reading notes
date: 2026-10-04
tag: reading
---

Your text, **bold**, *emphasis*, lists, links, and code.

![Describe the image](/img/my-photo.jpg)
```

Only `title`, `date`, and `tag` are required. Dates are written as `YYYY-MM-DD`. Entries are sorted newest first and date labels use UTC so they do not shift a day. The filename breaks ties. Every `.md` in this folder is published, including future-dated files; keep unfinished notes outside this folder.

Place images in `public/img/` and reference them as `/img/filename.ext`. Paths are case-sensitive: the home photograph is `homeimage.JPG`. The original supplied images were moved here from the initial `img/` folder. To publish an update, commit and push the note and any new images.

## Profile

- Edit `src/config.ts` for name, role, location, GitHub and LinkedIn URLs.
- The supplied illustrated avatar is `public/img/uwu.jpeg`. Replace it or change `profile.image` to another path. Changes appear at the next build; a missing file is omitted instead of showing a broken image.
- Edit `src/pages/profile.astro` for your introduction, and `projects` in `src/config.ts` for the two selected projects: Sucre traffic control with MAPPO and Capital Pets. Public project URLs are left empty until verified.
- Empty social URLs are shown as “not added yet”; no guessed profile links are published.

## ASCII visitors

The Tux-inspired penguin, cat, terminal, rabbit, fox, and robot frames live in `src/scripts/visitors.ts`, alongside 28 animated kaomojis in `src/scripts/kaomojis.ts`. Text is rendered inside a decorative `<pre>`; there are no image or animation dependencies. Characters and edge positions are randomized, with no consecutive repeats of the same character.

- First appearance after 0.6–1.5 seconds (2–4 seconds on blog pages).
- Each visit lasts 6.5–9.5 seconds, followed by 18–36 quiet seconds (35–70 on blog pages).
- Only one visitor appears at a time. Its measured bounds must fit outside the content, navigation, and motion button, including a safety margin.
- Mobile randomly chooses from the kaomojis and figures no taller than four lines in unused space; if there is no room, the visit is skipped.
- A single lightly corrupted frame introduces ASCII sprites; kaomojis retain their original characters. Randomized peek/reveal entrances, varied blink timing, inward glances, gestures, and a five-pixel drift provide the remaining motion. Some ASCII visitors leave a sparse, 350 ms character trace on departure.
- With motion enabled, 14% of appearances become a small 1.1-second ASCII/Braille interference fragment instead of a character. Fragments use the same free-space checks and quiet gaps; they never run alongside a visitor.
- Scrolling, resizing, opening project details, or hiding the tab clears a visitor. Both modal viewers suspend visitors entirely. Reduced-motion shows a still character without animation, glitches, or timed replacements.
- The `[motion: on]` button controls **all** animation, including page transitions, and remembers the choice where local storage is available. In-memory preferences also survive ClientRouter navigation when storage is unavailable.

## Page transitions

Internal navigation uses only the original monochrome ASCII/Braille signal sweep, with randomized noise on each navigation. It contains no central figures or section names. No image assets or animation libraries are used.

- `src/scripts/signal-renderer.ts`: randomized glyph field and stepped distortion.
- `src/scripts/random-picker.ts`: random visitor selection without consecutive repeats.
- `src/scripts/transitions.ts`: Astro navigation lifecycle, 220 ms cover / 300 ms reveal (about half a second total), cancellation, and slow-request recovery.
- `src/scripts/motion.ts`: shared animation preference for both transitions and visitors.
- `src/scripts/site.ts`: starts and cleans up the clock, visitors, and page enhancements on every route change.

The next document loads concurrently with the covering effect. The effect is skipped entirely with motion off or reduced-motion enabled. Escape skips the current effect. Modified clicks, external links, downloads, and same-page anchors retain their normal navigation behavior. A one-second limit clears the overlay if a request stalls; it never blocks pointer input. Back/forward navigation uses a reversed sweep when moving back.

## Small interactions

- **Navigation:** the original `home / profile / blog` links, with the active section in bold.
- **Commands:** Ctrl+K or ⌘K opens a keyboard-accessible command palette. Type `home`, `profile`, `blog`, `motion off`, or `motion on`; navigation also accepts `cd ~/home` (and the other paths). Arrow keys select, Enter runs, Escape closes. Command results also support click/tap. These are predefined site actions, never shell execution. System reduced motion continues to take precedence over `motion on`.
- **Notes directory:** the list shows each note's identifier with `.md`, its readable title, date, and tag. Article metadata uses `date:` and `tag:` labels.
- **Code blocks:** fenced Markdown gains a language label and `[copy]`. Successful copying shows `[copied]`; if clipboard access fails, the code is selected for manual copying and an accessible status explains the fallback. Plain Markdown code remains available without JavaScript.
- **404:** a lost ASCII cat accompanies `404 — path not found` and a `cd ~/home` recovery link.
- **Image viewer:** Home and Profile photos open in a monochrome native `<dialog>`. Markdown images are enhanced automatically after each navigation, except images already inside links or buttons. Close with `[×]`, Escape, or a backdrop click. Focus returns to the image link; background scrolling is locked while the viewer is open. Home/Profile image links also open their original files without JavaScript.
- **Project details:** the name, short summary, and technology list stay visible. Native `<details>` sections reveal the longer descriptions via `[+]`, including with a keyboard or JavaScript disabled. Edit summaries and descriptions in `src/config.ts`.
- **Links:** a brief underline accent accompanies hover and keyboard focus; photo links expose a small `[+]` affordance (always visible on touch devices).
- **Reading progress:** a one-pixel white line appears only in individual notes, following scroll position and recalculating after image loads or resizing. It reaches 100% when the end of the article is visible. Its position updates directly, without decorative smoothing.

The viewer, disclosures, and reading progress live in `src/scripts/enhancements.ts`; commands in `src/scripts/terminal.ts`; clipboard controls in `src/scripts/code-blocks.ts`. Motion off or reduced-motion disables the viewer/disclosure entrance effects and CSS link effects; the underlying controls remain functional. Event listeners, observers, and animations are cleaned up between routes. Both dialogs use the browser's modal focus handling, and each disclosure retains its native keyboard behavior.

Project descriptions were checked against the local MAPPO README and Capital Pets documentation and package manifests. They do not claim live deployment, individual team roles, or real-world traffic performance; the MAPPO evaluation is described explicitly as simulation with synthetic demand.

For artwork changes, edit the frame strings; for frequency changes, edit the timing ranges in `schedule()`. Keep frames small and similarly sized.

### Options considered

- **Native text frames + Web Animations API (chosen):** direct control over tiny original sprites, intermittent scheduling, and whitespace placement, with no extra packages.
- [Three.js AsciiEffect](https://threejs.org/docs/pages/AsciiEffect.html): converts rendered scenes to ASCII; useful if the site later needs a 3D scene.
- [Drawille](https://github.com/madbence/node-drawille): draws using Unicode Braille; an option for generating denser text frames offline.

Visual references: [James Scholz](https://jvscholz.com/) for the photo/time composition and [XXIIVV](https://wiki.xxiivv.com/site/home.html) for restrained navigation and monochrome presentation. The brief's DedSec influence appears in short ASCII/Braille signal transitions, brief sprite corruption, and small text characters.

## GitHub and Vercel

1. Push this project to your GitHub repository, including `package-lock.json`.
2. In Vercel, import that repository and choose the **Astro** preset.
3. Set Node.js to **24.x**, build command to `npm run build`, and output directory to `dist` (the preset normally supplies these).
4. Deploy. Future pushes rebuild the site and notes automatically.

The Vercel project name determines the initial domain; `aldocasanova.vercel.app` is subject to availability. No Vercel adapter is needed for this static output. No account or deployment is created by this repository.
