# WonderSteps
**Phase 1: Foundation & Design System**

**Current phase: Phase 4.1.1 — Voice Guidance & Audio Balance Polish**

Phase 2 added the illustrated adventure entrance and responsive world environments. Phase 3 added the reusable progression engine, safe browser persistence, protected play routes and confirmed progress reset. Phase 4 integrated five real World 1 games. Phase 4.1 polished their audio, reactions and mobile presentation. Phase 4.1.1 adds lightweight voice guidance and rebalances the music without changing educational content, scoring or progression.

A fully static, responsive educational game foundation for curious children ages 4–8. The visual identity combines friendly violet, sky blue, warm gold, rounded surfaces, and Pip, an original inline-SVG mascot.

## Development
Use Node.js 22.12+ (Node 24 recommended) and npm.
```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
```
Development URL: http://localhost:5173/wondersteps/
Production preview: `npm run preview`.
The lockfile records installed stable compatible versions: React 19, TypeScript 6, Vite 8, Tailwind CSS 4 with its Vite plugin, React Router 7, Framer Motion 13, Lucide React 1. Oxlint and Playwright are development tools.

## Structure
- `src/components/ui`: buttons, badges, cards and reusable QuickDestination links.
- `src/components/layout`: reusable header/HUD, page container, navigation and footer.
- `src/components/game`: Pip, world illustrations, GameShell, StarDisplay and reset controls.
- `src/components/map`: WorldSection, LevelPath, LevelNode.
- `src/pages`: Home, lazy-loaded Levels and phase-aware empty screens.
- `src/data`: static world and level configuration.
- `src/games`: game registry, separate educational content pools, pure session transitions, shared UI, original SVG artwork and session hook.
- `src/types`: typed game, progression, achievement and reward contracts.
- `src/hooks`: UI-facing progress selectors and engine operations.
- `src/store`: centralized reactive progress store/provider and independent persistent audio preferences.
- `src/audio`: lightweight AudioProvider, semantic events, safe preference storage, one audio manager and an on-demand native Web Audio synthesizer.
- `src/engine`: pure validated progression, wallet and star-threshold functions.
- `src/storage`: versioned browser storage adapter and data sanitizer.
- `src/utils`: readable compact wallet-counter formatting.
- `unit`: engine, store and persistence tests using the Node.js test runner.
- `src/index.css`: centralized semantic design tokens and responsive styles.
- `public/favicon.svg`: original vector brand asset.
- `tests`: production-route, responsive, navigation and initial-state checks.
- `artifacts`: locally generated screenshots, ignored by Git.

## Design and accessibility
CSS variables centralize backgrounds, surfaces, primary/secondary/accent, status colors, text, borders, spacing, radii, shadows, typography, transitions and container sizing. Tailwind is integrated through the official Vite plugin; the component styling uses the same token source. Fonts are local system fallbacks, with no remote font dependency.
Controls have 44–56px minimum targets, clear keyboard focus, descriptive icon labels, semantic links/buttons, a skip link and meaningful headings. Locked nodes use icons and disabled semantics; completed nodes support checkmarks and labels. Reduced-motion preferences disable mascot and level pulsing.

## Responsive strategy
Mobile places the headline and description above Pip, followed by full-width Play and Explore controls. Tablets and desktop use a two-column hero within a 1120px container. The header prioritizes brand, sound and settings on phones; real star/coin counters appear at 480px and above, on a secondary row below 768px. Large balances use compact formatting with exact accessible labels. Safe edge spacing remains at least 16px. Map worlds stay sequential at every width: winding vertical trails on phones, landscape regions with curved horizontal trails at 768px and above. Node labels remain at least 14px and controls are 76px.
Browser checks cover 320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280, 1440 and 1920px, plus 667×375 landscape.

## Routes
Hash-based routes work on static GitHub Pages without server rewrites:
`/`, `/levels`, `/play/:levelId`, `/results/:levelId`, `/achievements`, `/rewards`, `/settings`.
An unknown-route screen provides a way home. Home Play, Explore and Start journey lead to Levels. Unlocked Levels 1–5 open a short intro and Start button; Levels 6–20 retain their coming-soon stage. Invalid/noncanonical IDs and locked play routes redirect to Levels with replacement navigation. Completed levels remain accessible for replay. Page visits never record attempts or completion. Real completion results appear inside the play route; the separate results route, achievements and rewards remain future-system empty states. Music/SFX controls persist independently. Animations follow the device reduced-motion preference and page entrances take 180ms.

## Planned adventure
| World | Levels |
| --- | --- |
| Sunny Meadow | 1. Color Match; 2. Count It; 3. Alphabet Match; 4. Animal Match; 5. Fruit Match |
| Magic Forest | 6. Shape Match; 7. Memory Cards; 8. Letter Hunt; 9. Number Order; 10. Mini Challenge |
| Cloud Kingdom | 11. Addition; 12. Subtraction; 13. Animal Home; 14. Food Sort; 15. Shape Puzzle |
| Star Galaxy | 16. Missing Letter; 17. Missing Number; 18. Advanced Memory; 19. Speed Challenge; 20. Final Adventure |

The winding journey supports current, locked and completed presentations. Only Level 1 is available initially; completing each level unlocks exactly the next. World 1 is playable; World 2–4 metadata remains a future plan.

## World 1 gameplay
Levels 1–5 share a lightweight ephemeral session layer above the existing progression engine:

- **Color Match:** ten clearly named colors and labeled swatches, including visible borders for white.
- **Count It:** 1–10 stars, apples or flowers arranged in countable, non-overlapping grids; four numeric choices.
- **Alphabet Match:** uppercase A–Z matched to familiar illustrated words.
- **Animal Match:** sixteen familiar animals with original SVG pictures and word labels.
- **Fruit Match:** twelve distinct fruit pictures with word labels.

Start selects ten unique questions and shuffles choice order once. Counting, alphabet, animal and fruit pools contain 30, 26, 16 and 12 questions respectively; colors use all ten required colors. Randomness is injectable in the pure session utilities. Rendering does not reshuffle or record attempts.

Each round awards 100 points on the first try, 70 on the second, or 40 on the third or later. Wrong answers never subtract points or advance the round. Every round must eventually be answered correctly. Ten first-try answers earn a 100-point perfect bonus: maximum 1100. World 1 metadata defines 500/750/950 as the one/two/three-star thresholds. A score below 500 earns zero stars but still completes and unlocks the next step.

First completion pays 30/50/75 coins for one/two/three stars (zero coins for zero stars). The existing completion API enforces the one-time reward. Replay retains independent highest score and highest stars and never pays completion coins again, including improvement after an initial zero-coin completion. Results show actual session score/stars, ten correct answers, coins earned, saved bests, and a new-best indicator. Unlock messaging appears only on first completion. Levels 1–4 offer Next Level; Level 5 returns to Adventure and explains that unlocked Level 6 is coming soon.

Start calls the existing attempt API exactly once. Back or refresh discards unfinished rounds, while the recorded attempt remains. Returning opens the intro and requires another Start. Transient questions, feedback, timers and score are never stored in PlayerProgress. Replay returns to the intro for a fresh attempt.

Correct feedback locks all choices for 650ms before advancing; question IDs reject stale input and synchronous session refs reject double scoring and repeated SFX. Feedback delay is injectable in the session hook. Keyboard-repeat Enter/Space is ignored; focus moves to each new question and the result heading. Choice buttons support keyboard activation, visible focus, meaningful names and polite live feedback. Color names and illustrated word labels avoid relying on visuals alone. Reduced motion disables answer bounce/shake.

The stage stays within 780px on desktop, uses large two-column phone choices and four-column desktop choices, and recomposes the prompt beside compact choices on phone landscape. Browser checks exercise all five games at the twelve target widths and 667×375 landscape.

## Progress engine and persistence
The scoped ProgressProvider owns one synchronous external store, subscribed through React's useSyncExternalStore and the existing useProgress hook. Pure engine functions return typed success/error results, never mutate input, and reject invalid IDs, locked completion, invalid stars/scores/coins, insufficient funds and safe-integer overflow. No new state or validation library is required.

Browser saves use `wondersteps.player-progress`, schema **version 1**. Stored data includes 20 per-level records (completion, best stars, best score, attempts and first completion time), the wallet, future achievement/reward IDs and creation/update timestamps. Initial levels have no completions, zero stars/scores/attempts and no completion timestamp; the wallet and ID collections are empty.

Unlocked flags, highest unlocked level, current level and total stars are **derived**, avoiding duplicated totals and synchronization bugs. The completed prefix determines availability: completing N unlocks N+1; Level 20 never creates Level 21. The current level is the first unfinished sequential level (the highest unlocked unfinished level). When all 20 are complete, current level is null and every level can be replayed.

`completeLevel({ levelId, score, stars, coinsEarned })` preserves independent highest stars and best score on replay. Completion coins are awarded **only on the first successful completion**, even if that reward was zero. Replays cannot repeatedly grant the base reward. `awardCoins` and `spendCoins` remain validated wallet APIs; no shop exists. `recordAttempt` is called explicitly once per genuinely started gameplay session; completing a result does not implicitly count another attempt.

Optional per-level `starThresholds` and `calculateStars` provide configurable score boundaries. World 1 now configures its thresholds in level metadata; later levels remain unconfigured. ScoreResult and GameResult supply small result contracts.

The storage adapter supports load/save/clear and sanitizes unknown data before it reaches the store. Missing data initializes safely. Malformed JSON, oversized documents and unknown schema versions reset to a clean save. Partial version-1 records are recovered; invalid IDs and duplicate records are discarded, impossible numeric values become zero, and completions after a gap cannot unlock later levels. Future schema migrations can be added at the version dispatch. On denied storage or quota failure, state continues in memory and Settings explains that refresh persistence is unavailable; operation results also report whether saving succeeded.

Storage events update other tabs without writing back, preventing event loops. A fresh read when attaching the listener avoids overwriting changes made since store initialization. Synchronization uses the last stored document, with no transactional merging of simultaneous tab writes.

Settings reset requires an accessible confirmation dialog with cancel as the initial focus, keyboard trapping, Escape dismissal and restored trigger focus. Confirming clears/replaces the saved progress and restores Level 1, zero stars/coins/attempts and empty future IDs. Audio preferences are unaffected. Persistence failure is reported. No developer harness or normal-user completion button is included.

## Phase 4.1 game feel and audio
The compact HUD toggles all audio; Settings controls Music and SFX independently. Both default to off, preserving the previous silent default. Preferences use `wondersteps.audio-preferences`, version 1, separately from player progress. Invalid saves recover safely; denied storage leaves controls working in memory.

AudioContext creation/resume occurs after an intentional interaction, never during initial rendering. Synthesis code loads on demand when audio is enabled. This follows [Web Audio autoplay guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices). Playback/load failures are caught without blocking gameplay. Music starts with an accepted Start, continues through the result, and stops on Replay or leaving the game. Visibility, page lifecycle and native context state changes stop hidden/interrupted playback; only previously activated, enabled audio can resume. One manager owns one context, one synthesizer and one loop, with cleanup on unmount.

**Audio credits:** all music and effects are original, project-generated Web Audio synthesis; there are no third-party audio assets, hotlinks or audio binaries. The original eight-bar, 20-second, 96-bpm adventure score uses a soft bell melody, warm triangle chords and quiet bass. Physical-device feedback raised music gain moderately from 0.25 to 0.34 while SFX remains 0.55. During speech, music ramps to 0.12 and returns smoothly to avoid clicks. Semantic cues cover gameStart, buttonTap, correct, incorrect, star, coin, levelComplete and levelUnlock. Incorrect feedback uses soft descending notes rather than a buzzer. No additional audio or animation library was added.

**Voice guidance:** browser-native `SpeechSynthesis` reads each active task from its current question data, gives rotating short praise or encouragement, and announces “Level complete!” Questions replace stale speech instead of building a queue. A 44px Hear Again control repeats the current instruction. English voice selection prefers a local voice and otherwise uses any available English voice or the browser default. Speech rate 0.92 and pitch 1.04 favor clarity. The Voice setting is independent of Music and SFX and is included in the master toggle. It defaults on for a new or migrated save but speaks only after Start, so nothing autoplays on page load. Speech is supplemental: every visual, label, live region and keyboard interaction remains intact when voice is off or unsupported. System voices vary across Windows, Android, iOS and macOS, so timbre and pronunciation cannot be identical. Failures are silent and never block gameplay. No TTS service, backend, library, prerecorded file or network request is used.

Pip has idle, thinking, happy, encouraging and celebrating SVG states with unique gradient IDs. Correct cards pop, show a check and four tiny stars; wrong cards give a 350ms gentle shake and encouraging Pip feedback. The current challenge fades briefly at the end of the unchanged 650ms success period; the next enters in 160ms. Results celebrate for about two seconds with eight tiny sparkles, sequential earned-star reveals, one coin icon/count-up and a first-completion-only unlock reveal. Actions are available immediately, and animation never changes the saved reward. Unmount cancels delayed celebration cues.

Active phone gameplay has Back, level and audio/settings in a compact HUD, a viewport-aware stage, safe-area padding and large touch controls. Landscape places Pip/task on the left and choices on the right. Desktop keeps a centered 780px game surface. Feedback, prompt and reward regions reserve space to avoid layout shifts. Motion uses transforms/opacity; reduced motion removes floating, shaking and particles and shows rewards immediately. Zoom remains enabled.

**Footer credit:** “Design and Developed by Ahasan39” links to https://ahasan39.github.io/ unchanged. It is hidden only in the active immersive phone/landscape game viewport; normal pages, intros, results and desktop keep it visible.

**Performance baseline:** pre-polish production main JS 356.08 KB / 113.08 KB gzip, gameplay 28.02 / 9.21 KB, CSS 38.00 / 9.15 KB; shared progress chunk 56.11 / 20.29 KB. Favicon is 196 bytes. Audio rendering has no download/decode dependency and introduces no initial audio requests. The synthesizer remains a small lazy chunk; gameplay/result changes stay in the existing lazy play route. Local comparison artifacts are ignored. Lighthouse is not installed, so no Lighthouse or PageSpeed scores are claimed.

**After polish:** main JS 361.63 KB / 114.95 KB gzip (+1.87 KB gzip), gameplay 44.34 / 15.67 KB, CSS 45.30 / 10.13 KB; shared progress is unchanged. The new lazy synthesizer is 1.86 / 0.94 KB. On the same 390×844 production-preview home load, encoded JS/CSS resource bodies total 144,041 bytes versus 141,189 before (+2,852 bytes, about 2%). No audio context or audio chunk is created/requested on initial load. Native Chromium audio smoke checks confirm a running 48 kHz context after interaction, suspension while hidden, resumption when visible and zero live oscillator voices after Back, without console errors. Speaker quality still needs listening on physical devices.

**After Phase 4.1.1:** main JS is 364.10 KB / 115.88 KB gzip (+0.93 KB gzip), gameplay is 44.97 / 15.84 KB (+0.17 KB gzip), CSS is 45.59 / 10.19 KB (+0.06 KB gzip), shared progress remains 56.11 / 20.29 KB, and the lazy synth is 2.03 / 1.00 KB (+0.06 KB gzip). Native speech adds no asset and no initial network request.

## Deployment
Production: https://ahasan39.github.io/wondersteps/

GitHub Actions → GitHub Pages, from branch `main`. Pushes to `main` automatically run `.github/workflows/deploy-pages.yml`: Node 24 with npm caching, `npm ci`, TypeScript, lint, unit tests and the production build, followed by official Pages artifact upload and deployment of `dist/`. The workflow also supports manual dispatch on `main`; deployment concurrency protects active runs. Generated output is not committed.

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source before the first deployment. If the initial run fails because Pages is not enabled, select that source and rerun the workflow.

Vite retains `base: '/wondersteps/'`. HashRouter retains static-host-compatible URLs such as `https://ahasan39.github.io/wondersteps/#/levels` and `#/play/1`, supporting direct links, refresh and browser history without server rewrites. Use hash routes rather than `/wondersteps/levels`.

The `wondersteps.player-progress` storage key is unchanged. Localhost and GitHub Pages are separate browser origins, so production begins with its own fresh save; no environment reset or migration is performed.

## Intentionally deferred
Levels 6–20 gameplay, memory boards, achievement unlocking, reward shop, backend, database, authentication, cloud sync and PWA/service workers remain unimplemented. Phase 5 has not started.

## Verification
`npm run build` runs strict TypeScript checking before the production bundle. `npm run lint` checks source with Oxlint. Playwright tests the production preview under the configured repository base path, checks all routes across the widths above, verifies initial locks and sound preference behavior, tests reduced motion and keyboard skip navigation, and generates screenshots for visual inspection.

Phase 2 regression tests cover hero ordering, columns, sequential regions, readable labels, touch targets, destinations, keyboard navigation and session sound preferences. Phase 3 adds unit tests for progression, replay, wallet, thresholds, attempts, overflow, sanitization, persistence and store reset. Production-browser tests cover locked/invalid routes, replay, no attempts on visits, refresh/reopen, corrupt/denied storage, real cross-tab events, reset focus/cancel/confirmation and completed maps/GameShell/dialogs at all 12 target widths plus phone landscape. Test-generated progression fixtures exercise the real engine; they are outside the production bundle. Type checking includes source and tests, with strict mode enabled.

Phase 4 adds pure session/content/scoring/reward tests and production-browser tests for the real five-level journey, replay improvement and lower scores, first-completion rewards, refresh/Back attempts, reset, keyboard input locks, counting object rendering, live feedback, reduced motion, responsive choice geometry and completion actions. Tests derive answers from the visible task and content mapping rather than requiring lucky randomness or production bypasses. Local visual screenshots remain ignored.

Phase 4.1 adds audio preference/manager/synthesis unit coverage and mocked browser-audio tests for gesture activation, accepted-event SFX, blocked playback, music visibility/navigation cleanup, reload without autoplay, result sequencing, replay reward suppression and reduced motion. Gameplay geometry covers all five games at 320×568, 360×640, 375×667, 390×844, 414×896, 430×932, 360×560, all tablet/desktop target widths and 667×375, 740×360, 844×390 landscape. Tests require no speakers.

Phase 4.1.1 adds mocked speech tests for all five prompt semantics, one narration per round, Hear Again, rotating positive feedback, cancellation, music ducking, independent/master preferences, navigation and visibility cleanup, voice-off behavior and unsupported-browser fallback. Tests never require actual speaker output.
