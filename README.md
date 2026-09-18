# WonderSteps
**Phase 1: Foundation & Design System**

**Current phase: Phase 3 — Core Game Engine, Player Progression, Local Persistence & Level Guards**

Phase 2 added the illustrated adventure entrance and responsive world environments. Phase 3 preserves those visuals and adds the reusable progression engine, safe browser persistence, protected play routes and confirmed progress reset. Real educational gameplay remains deferred.

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
- `src/types`: typed game, progression, achievement and reward contracts.
- `src/hooks`: UI-facing progress selectors and engine operations.
- `src/store`: centralized reactive progress store/provider and session-only sound preferences.
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
An unknown-route screen provides a way home. Home Play, Explore and Start journey lead to Levels. Unlocked levels open GameShell with actual level/world metadata and a clearly unfinished stage. Invalid/noncanonical IDs and locked play routes redirect to Levels with replacement navigation. Completed levels remain accessible for replay. Page visits never record attempts or completion. Results, achievements and rewards remain future-system empty states. Sound controls change a session preference only; no audio exists yet. Animations follow the device reduced-motion preference and page entrances take 180ms.

## Planned adventure
| World | Levels |
| --- | --- |
| Sunny Meadow | 1. Color Match; 2. Count It; 3. Alphabet Match; 4. Animal Match; 5. Fruit Match |
| Magic Forest | 6. Shape Match; 7. Memory Cards; 8. Letter Hunt; 9. Number Order; 10. Mini Challenge |
| Cloud Kingdom | 11. Addition; 12. Subtraction; 13. Animal Home; 14. Food Sort; 15. Shape Puzzle |
| Star Galaxy | 16. Missing Letter; 17. Missing Number; 18. Advanced Memory; 19. Speed Challenge; 20. Final Adventure |

The winding journey supports current, locked and completed presentations. Only Level 1 is available initially; Levels 2–20 are locked. Metadata is configuration, not gameplay.

## Progress engine and persistence
The scoped ProgressProvider owns one synchronous external store, subscribed through React's useSyncExternalStore and the existing useProgress hook. Pure engine functions return typed success/error results, never mutate input, and reject invalid IDs, locked completion, invalid stars/scores/coins, insufficient funds and safe-integer overflow. No new state or validation library is required.

Browser saves use `wondersteps.player-progress`, schema **version 1**. Stored data includes 20 per-level records (completion, best stars, best score, attempts and first completion time), the wallet, future achievement/reward IDs and creation/update timestamps. Initial levels have no completions, zero stars/scores/attempts and no completion timestamp; the wallet and ID collections are empty.

Unlocked flags, highest unlocked level, current level and total stars are **derived**, avoiding duplicated totals and synchronization bugs. The completed prefix determines availability: completing N unlocks N+1; Level 20 never creates Level 21. The current level is the first unfinished sequential level (the highest unlocked unfinished level). When all 20 are complete, current level is null and every level can be replayed.

`completeLevel({ levelId, score, stars, coinsEarned })` preserves independent highest stars and best score on replay. Completion coins are awarded **only on the first successful completion**, even if that reward was zero. Replays cannot repeatedly grant the base reward. `awardCoins` and `spendCoins` are validated wallet APIs; no shop or automatic reward logic exists. `recordAttempt` is called explicitly once per genuinely started gameplay session by future games; completing a result does not implicitly count another attempt.

Optional per-level `starThresholds` and `calculateStars` provide configurable score boundaries. No educational level thresholds, questions or scoring rules have been invented. ScoreResult and GameResult supply small future-facing result contracts.

The storage adapter supports load/save/clear and sanitizes unknown data before it reaches the store. Missing data initializes safely. Malformed JSON, oversized documents and unknown schema versions reset to a clean save. Partial version-1 records are recovered; invalid IDs and duplicate records are discarded, impossible numeric values become zero, and completions after a gap cannot unlock later levels. Future schema migrations can be added at the version dispatch. On denied storage or quota failure, state continues in memory and Settings explains that refresh persistence is unavailable; operation results also report whether saving succeeded.

Storage events update other tabs without writing back, preventing event loops. A fresh read when attaching the listener avoids overwriting changes made since store initialization. Synchronization uses the last stored document, with no transactional merging of simultaneous tab writes.

Settings reset requires an accessible confirmation dialog with cancel as the initial focus, keyboard trapping, Escape dismissal and restored trigger focus. Confirming clears/replaces the saved progress and restores Level 1, zero stars/coins/attempts and empty future IDs. Session sound preferences are unaffected. Persistence failure is reported. No developer harness or normal-user completion button is included.

## GitHub Pages plan
Vite uses `base: '/wondersteps/'`; all bundled assets receive the repository prefix. HashRouter produces URLs such as `https://USERNAME.github.io/wondersteps/#/levels`, which survive refresh and direct navigation.
The project is connected to https://github.com/Ahasan39/wondersteps. In a dedicated later step, enable Pages via GitHub Actions, run `npm ci` and `npm run build`, and upload/deploy `dist` with the official Pages actions. The expected URL is https://ahasan39.github.io/wondersteps/. Change Vite's base if the repository name changes. A custom-domain/root deployment needs `base: '/'`. No deployment workflow or deployment has been created.

## Intentionally deferred
No educational questions or game levels, level-specific scoring, timers, memory boards, celebration/result system, real audio, achievement unlocking, reward shop, backend, database, authentication or paid API. Only the reusable progression/wallet/star-calculation foundation is implemented in Phase 3.

## Verification
`npm run build` runs strict TypeScript checking before the production bundle. `npm run lint` checks source with Oxlint. Playwright tests the production preview under the configured repository base path, checks all routes across the widths above, verifies initial locks and sound preference behavior, tests reduced motion and keyboard skip navigation, and generates screenshots for visual inspection.

Phase 2 regression tests cover hero ordering, columns, sequential regions, readable labels, touch targets, destinations, keyboard navigation and session sound preferences. Phase 3 adds unit tests for progression, replay, wallet, thresholds, attempts, overflow, sanitization, persistence and store reset. Production-browser tests cover locked/invalid routes, replay, no attempts on visits, refresh/reopen, corrupt/denied storage, real cross-tab events, reset focus/cancel/confirmation and completed maps/GameShell/dialogs at all 12 target widths plus phone landscape. Test-generated progression fixtures exercise the real engine; they are outside the production bundle. Type checking includes source and tests, with strict mode enabled.
