# WonderSteps
**Phase 1: Foundation & Design System**

**Current phase: Phase 2 — Premium Home Experience, Navigation & Responsive Visual Polish**

Phase 2 preserves the foundation and adds an illustrated adventure entrance, a mobile-first Pip composition, reusable quick destinations, distinct world environments, responsive vertical/horizontal map trails, fast page entrances and deliberate achievements/rewards empty states. No gameplay or progression engine is implemented.

A fully static, responsive educational game foundation for curious children ages 4–8. The visual identity combines friendly violet, sky blue, warm gold, rounded surfaces, and Pip, an original inline-SVG mascot.

## Development
Use Node.js 22.12+ (Node 24 recommended) and npm.
```sh
npm ci
npm run dev
npm run typecheck
npm run lint
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
- `src/components/game`: original Pip SVG mascot and lightweight shared world Environment illustrations.
- `src/components/map`: WorldSection, LevelPath, LevelNode.
- `src/pages`: Home, lazy-loaded Levels and phase-aware empty screens.
- `src/data`: static world and level configuration.
- `src/types`: typed game, progression, achievement and reward contracts.
- `src/hooks`: read-only initial progress adapter.
- `src/store`: session-only sound preference context.
- `src/index.css`: centralized semantic design tokens and responsive styles.
- `public/favicon.svg`: original vector brand asset.
- `tests`: production-route, responsive, navigation and initial-state checks.
- `artifacts`: locally generated screenshots, ignored by Git.

## Design and accessibility
CSS variables centralize backgrounds, surfaces, primary/secondary/accent, status colors, text, borders, spacing, radii, shadows, typography, transitions and container sizing. Tailwind is integrated through the official Vite plugin; the component styling uses the same token source. Fonts are local system fallbacks, with no remote font dependency.
Controls have 44–56px minimum targets, clear keyboard focus, descriptive icon labels, semantic links/buttons, a skip link and meaningful headings. Locked nodes use icons and disabled semantics; completed nodes support checkmarks and labels. Reduced-motion preferences disable mascot and level pulsing.

## Responsive strategy
Mobile places the headline and description above Pip, followed by full-width Play and Explore controls. Tablets and desktop use a two-column hero within a 1120px container. The header prioritizes brand, sound and settings on phones; neutral star/coin placeholders appear at 480px and above. Safe edge spacing remains at least 16px. Map worlds stay sequential at every width: winding vertical trails on phones, landscape regions with curved horizontal trails at 768px and above. Node labels remain at least 14px and controls are 76px.
Browser checks cover 320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280, 1440 and 1920px, plus 667×375 landscape.

## Routes
Hash-based routes work on static GitHub Pages without server rewrites:
`/`, `/levels`, `/play/:levelId`, `/results/:levelId`, `/achievements`, `/rewards`, `/settings`.
An unknown-route screen provides a way home. Home Play, Explore and Start journey lead to Levels; Level 1 opens an honest future-game screen. Locked levels remain locked even when directly visited. Results, achievements and rewards display explicit empty states. Achievement/reward CTAs return to the adventure map. Sound controls change a session preference only; no audio exists yet. Animations follow the device reduced-motion preference and page entrances take 180ms.

## Planned adventure
| World | Levels |
| --- | --- |
| Sunny Meadow | 1. Color Match; 2. Count It; 3. Alphabet Match; 4. Animal Match; 5. Fruit Match |
| Magic Forest | 6. Shape Match; 7. Memory Cards; 8. Letter Hunt; 9. Number Order; 10. Mini Challenge |
| Cloud Kingdom | 11. Addition; 12. Subtraction; 13. Animal Home; 14. Food Sort; 15. Shape Puzzle |
| Star Galaxy | 16. Missing Letter; 17. Missing Number; 18. Advanced Memory; 19. Speed Challenge; 20. Final Adventure |

The winding journey supports current, locked and completed presentations. Only Level 1 is available initially; Levels 2–20 are locked. Metadata is configuration, not gameplay.

## Future progress layer
`useProgress` currently returns immutable initial data: zero earned stars and coins, no completed levels, achievements or rewards. There is no progression engine or persistence.
In a future phase, replace this adapter with a dedicated versioned/validated storage service for highest unlocked level, completed levels, stars, best scores, coins, achievements and rewards. UI should continue consuming hooks, rather than calling localStorage. Sound persistence can be added behind the preference provider.

## GitHub Pages plan
Vite uses `base: '/wondersteps/'`; all bundled assets receive the repository prefix. HashRouter produces URLs such as `https://USERNAME.github.io/wondersteps/#/levels`, which survive refresh and direct navigation.
The project is connected to https://github.com/Ahasan39/wondersteps. In a dedicated later step, enable Pages via GitHub Actions, run `npm ci` and `npm run build`, and upload/deploy `dist` with the official Pages actions. The expected URL is https://ahasan39.github.io/wondersteps/. Change Vite's base if the repository name changes. A custom-domain/root deployment needs `base: '/'`. No deployment workflow or deployment has been created.

## Intentionally deferred
No actual game levels, questions, scoring, star calculation, coin economy, level unlocking, persistent progress, achievement/reward logic, game sounds, celebration system, backend, database, authentication or external paid API. These remain deferred after Phase 2 visual polish.

## Verification
`npm run build` runs strict TypeScript checking before the production bundle. `npm run lint` checks source with Oxlint. Playwright tests the production preview under the configured repository base path, checks all routes across the widths above, verifies initial locks and sound preference behavior, tests reduced motion and keyboard skip navigation, and generates screenshots for visual inspection.

Phase 2 adds assertions for mobile hero ordering, desktop column placement, sequential world regions, controlled desktop region height, label containment/readability, minimum node touch targets, all Home destinations, back controls, keyboard activation, session preference continuity and absence of localStorage data. Five browser tests cover 120 route/viewport combinations plus composition, interactions and representative screenshots.
