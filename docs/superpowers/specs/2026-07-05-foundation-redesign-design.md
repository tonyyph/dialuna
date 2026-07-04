# Dialuna Redesign — Phase 1: Foundation — Design Spec

Date: 2026-07-05
Status: Approved by user (mascot direction, personality, palette approach confirmed via visual brainstorm; remaining details decided by Claude per user's explicit "don't ask me about small things" instruction)

## 1. Context

Dialuna's business logic (cycle engine, Hormone Twin scoring, mock AI coach, mock premium — all in `src/services/*` and `src/store/*`) is solid and out of scope. The full audit (see conversation) found the app's visual layer undershoots its own copy: the i18n strings already sound like a warm companion ("a gentle note", "quiet, important work"), but the UI renders as a generic flat-white tracker template — system font only, 2 flat shadows, a fully-default Expo Router tab bar, zero custom illustration, and only 3 files touching any animation API.

This is Phase 1 of a 6-phase redesign roadmap:
1. **Foundation** (this spec) — brand/mascot, color system v2, typography, motion tokens, elevation scale, shared primitives
2. Navigation shell (custom tab bar + AI orb center tab)
3. Home screen
4. Daily Log + AI Chat
5. Calendar + Insights
6. Premium/Paywall + Settings + Onboarding polish

Every later phase depends on the tokens and mascot component built here. Phases 2–6 are out of scope for this spec and will each get their own brainstorm → spec → plan cycle.

## 2. Brand Mascot — Luna

**Concept:** Luna, a living crescent moon. Chosen over Dream Rabbit / Cloud Cat / Soft Fox because it's literal to "Hormone Twin" and the moon motif already present in the tab bar icon and copy, and a crescent shape maps naturally to cycle-phase visuals later (waxing/waning could echo cycle progress, though that mapping is not built in this phase).

**Personality:** Gentle & nurturing — soft-spoken, patient, reassuring, low energy / high warmth. Matches existing copy register exactly; no copy changes needed to fit Luna's voice, only new UI moments where she appears.

**Construction:** One SVG component, `src/components/mascot/Luna.tsx`, built with `react-native-svg` — a single crescent path (fill `colors.softRose`, stroke `colors.primary`) shared across all expressions; only eyes/mouth/eyebrows/particles swap per expression. This keeps her cheap to animate (only small path/opacity changes, not a full character rig) and consistent as a silhouette users recognize instantly.

```ts
type LunaExpression = 'happy' | 'thinking' | 'sleeping' | 'celebrating' | 'comforting';

interface LunaProps {
  expression?: LunaExpression; // default 'happy'
  size?: number;               // default 96
  animated?: boolean;          // default true — subtle idle motion (see §5)
}
```

**Expression set (v1 — ship these 5, add more later only when a real screen needs them, per YAGNI):**
- `happy` (default/resting) — small smile, soft cheek blush. Used wherever Luna appears with no specific context.
- `thinking` — raised brow, small dashed orbit dot near her. Used while the AI coach composes a reply.
- `sleeping` — closed curved eyes, floating "z" glyphs. Used in loading states and rest/night contexts.
- `celebrating` — star-shaped eyes, big open smile, small sparkle burst. Used for streaks, milestones, premium unlock.
- `comforting` — soft half-closed eyes, gentle heart-glow beneath her. Used on PMS/pain-logged days and difficult moments.

**Where Luna appears (this phase builds the component only; wiring into each screen happens in that screen's own phase):**
- Onboarding hero (phase 6)
- AI chat avatar, replacing the current moon-emoji bubble avatar (phase 4)
- Loading states app-wide (this phase — `LoadingLuna` wrapper)
- Empty states app-wide (this phase — update `EmptyState` to accept a `lunaExpression` prop instead of a raw emoji)
- Milestone/celebration moments (phase 3/6)
- Comfort moments — PMS window, pain logged (phase 4/5)

**This phase's deliverable:** the `Luna` component with all 5 expressions, plus `EmptyState` updated to render Luna instead of an emoji glyph. Wiring Luna into every screen listed above happens in that screen's own phase — not here.

## 3. Color System v2

Keep the existing brand anchors (validated: Luna's mockups already read as premium using them, and rebuilding hue wouldn't fix any audit finding — the problem was missing tiers/elevation, not the hues themselves).

**Kept verbatim:** `primary #FF6B8A`, `softRose #FFE4EA`, `lavender #B99CFF`, `deepPlum #2A1438`, `cream #FFF8F2`, `mint #6ED6B5`, `peach #FFB86B`, `error #F45B69`, the 4 `phase`/`phaseSoft` pairs.

**New additions to `src/theme/colors.ts`:**
```ts
surface: {
  background: colors.cream,      // page background (existing)
  card: '#FFFFFF',                // existing colors.card, renamed conceptually
  elevated: '#FFFFFF',            // same hex as card; distinguished by shadow tier (§5), not color
  overlay: 'rgba(42, 20, 56, 0.5)', // existing colors.overlay
},
text: {
  primary: colors.textPrimary,    // existing
  secondary: colors.textSecondary,// existing
  tertiary: '#B3A3B8',            // NEW — for the lowest-emphasis text (timestamps, meta captions)
  onDark: '#FFF8F2',              // NEW — text on deepPlum/gradient surfaces (paywall hero, etc.)
},
semantic: {
  success: colors.mint,
  warning: colors.peach,
  danger: colors.error,
  info: colors.lavender,
},
divider: 'rgba(122, 102, 127, 0.12)', // NEW — lighter than existing border, for internal card dividers
```
`border` and `glass` stay as-is. No hex values change for anything that already ships — this is additive, so nothing currently on-screen shifts color.

**Dark mode:** not implemented in this phase (no user-facing need yet — MVP spec scoped light-only). But the additions above are grouped by semantic role rather than flat name, so a future `colors.dark.*` sibling object can be introduced without renaming call sites — deferred, not built now.

## 4. Typography

**Pairing:** Fraunces (display/headline — variable-weight soft serif, optical sizing) + DM Sans (title/body/caption/button/micro). Chosen over a single-family (Plus Jakarta Sans) or a cooler geometric pairing (Urbanist + DM Sans) because it's the most distinctive against Flo/Stardust's all-sans convention and best matches the brand's "premium, feminine, luxury" keywords — a warm editorial serif for moments like the Home greeting and score reveal, clean geometric sans everywhere information-dense.

**New dependencies:** `@expo-google-fonts/fraunces`, `@expo-google-fonts/dm-sans`, loaded via `expo-font`'s `useFonts` in the root layout with a splash-screen hold until loaded (Expo's standard pattern — no new architecture needed).

**Scale (`src/theme/typography.ts`, replacing the current 7 presets with an expanded 8, all still flowing from the same `base` object):**

| Token | Font | Size / Line-height | Weight | Letter-spacing | Use |
|---|---|---|---|---|---|
| `display` | Fraunces | 36 / 42 | 600 | -0.2 | Home greeting, score reveal, hero headlines |
| `headline` | Fraunces | 26 / 32 | 600 | 0 | Screen titles (was `h1`) |
| `title` | DM Sans | 20 / 26 | 700 | 0 | Section headers (was `h2`) |
| `subtitle` | DM Sans | 17 / 22 | 600 | 0 | Card titles (was `h3`) |
| `body` | DM Sans | 16 / 23 | 400 | 0 | Default copy |
| `bodySmall` | DM Sans | 14 / 20 | 400 | 0 | Secondary copy |
| `caption` | DM Sans | 12 / 16 | 500 | 0.1 | Meta text |
| `micro` | DM Sans | 11 / 14 | 600 | 0.6 (uppercase) | Eyebrow labels, badges |

Renames (`h1`→`headline`, `h2`→`title`, `h3`→`subtitle`) are mechanical find-replace across the codebase since every screen already imports `typography.*` by name — no visual regression risk, verified by `tsc --noEmit` after the rename.

## 5. Motion Tokens

New file `src/theme/motion.ts`:
```ts
export const duration = {
  instant: 120, // press/tap feedback
  fast: 200,    // chip select, toggle, tab switch
  base: 300,    // card reveal, sheet open, standard transitions
  slow: 500,    // score ring sweep, celebration burst
  ambient: 1400 // looping/breathing motion (Luna idle, skeleton shimmer)
} as const;

export const easing = {
  standard: Easing.out(Easing.cubic), // entrances, reveals
  spring: { damping: 15, stiffness: 120, mass: 1 }, // playful/interactive (buttons, tab switch, Luna reactions)
} as const;
```
**Rule going forward:** no component may pass a raw `withTiming(x, { duration: 250 })` — every duration/easing must reference this file. This is the fix for the audit finding that only 3 files touch animation at all; subsequent phases add motion to Calendar, Insights, Paywall, Settings, AI chat, and onboarding, all pulling from these tokens so the feel stays consistent app-wide rather than each screen inventing its own timing.

## 6. Elevation / Shadow Scale

Replace the current 2 flat presets in `src/theme/shadows.ts` with:
```ts
export const shadows = {
  none: {},
  xs: { shadowColor: colors.deepPlum, shadowOffset: {width:0,height:1}, shadowOpacity:0.04, shadowRadius:4, elevation:1 },  // pressed states, chips
  sm: { shadowColor: colors.deepPlum, shadowOffset: {width:0,height:3}, shadowOpacity:0.05, shadowRadius:10, elevation:2 }, // was 'card'
  md: { shadowColor: colors.deepPlum, shadowOffset: {width:0,height:6}, shadowOpacity:0.07, shadowRadius:16, elevation:3 }, // was 'soft'
  lg: { shadowColor: colors.deepPlum, shadowOffset: {width:0,height:12}, shadowOpacity:0.10, shadowRadius:28, elevation:6 }, // modals, sheets, floating tab bar
  glow: { shadowColor: colors.primary, shadowOffset: {width:0,height:4}, shadowOpacity:0.25, shadowRadius:20, elevation:4 }, // primary CTAs, celebration moments — colored glow instead of neutral shadow
} satisfies Record<string, ViewStyle>;
```
`card`/`soft` remain as aliases pointing at `sm`/`md` respectively for one release to avoid a breaking rename across every screen at once — call sites migrate to the new names as each phase touches that screen, and the aliases get deleted once nothing references them (tracked, not indefinite).

**`Card` component fix:** the `glass` variant currently still inherits `shadows.card` from `styles.base`, which is why "glass" cards look like solid cards with a lighter fill. Fix: `glass` variant sets `shadows.none` (or `shadows.xs` at most) and relies on translucency + `border` for definition — actual blur (`expo-glass-effect`, already a dependency but currently unused) is a candidate for a later phase, not required here.

## 7. Shared Primitives (fixing audit-flagged duplication)

Built in this phase, in `src/components/ui/`:

- **`ProgressBar`** (`variant: 'linear' | 'segmented'`, `value: 0-100`, `color?: string`) — replaces the 4 independently hand-rolled bar implementations in `ForecastCard`, `InsightsScreen`'s phase bars, `WeekStrip`, and `DayDetailSheet.ScoreRow`. Those 4 call sites get refactored to use it as each one's owning screen is touched in a later phase (refactor lands with the phase, not as a standalone sweep, to avoid touching screens that aren't otherwise being changed this cycle).
- **`ChipGroup`** — wraps the `flexDirection:row, flexWrap:wrap, gap` pattern currently re-declared inline in Log's 4 chip sections, Goals, age-range pickers, and language selection.
- **`sizes.ts`** — new token file: `{ iconSm: 16, iconMd: 20, iconLg: 24, touchTarget: 44 }`, replacing scattered raw pixel literals for icon/touch-target dimensions.
- **`radius.xl: 32`** added for hero/full-bleed surfaces (paywall hero, onboarding welcome), which currently reuse `radius.lg` (24) undersized for that context.

**Explicitly not in this phase:** the calendar-grid duplication between `CalendarScreen` and onboarding's `DatePickerCalendar`, and full `Screen`-wrapper adoption in `AiChatScreen`/`PaywallScreen` — those are addressed when phases 4–6 touch those specific screens, not as a cross-cutting sweep now (keeps this phase's diff reviewable and focused on tokens + primitives).

## 8. Explicitly Out of Scope for This Phase

- Any screen redesign (Home, Calendar, AI Chat, Log, Insights, Paywall, Settings, Onboarding) — those are phases 2–6.
- Custom tab bar / AI orb — phase 2.
- Dark mode implementation — token structure is ready, theme not built.
- Luna appearing anywhere in the actual UI beyond the `EmptyState` component — wiring her into Home/AI Chat/onboarding/etc. happens per-screen in later phases.
- Figma / design-system documentation deliverable — not requested as a concrete task yet; revisit if the user wants a Figma handoff once the coded system stabilizes.

## 9. Acceptance Criteria

- `npx tsc --noEmit` clean after the `h1`/`h2`/`h3` → `headline`/`title`/`subtitle` rename across all call sites.
- `npx expo lint` clean.
- No new hardcoded hex/rgba in `src/features` or `src/components` (grep sweep, matching the existing MVP acceptance gate).
- `Luna` renders all 5 expressions without crashing on iOS/Android/web (Expo `react-native-svg` is already a dependency).
- `EmptyState` renders Luna instead of an emoji glyph in both of its current call sites (AI empty chat, Insights not-enough-logs) without layout regression.
- Existing screens render unchanged (this phase is additive/renaming tokens, not redesigning any screen) — spot-check Home, Log, Calendar, Settings visually after the typography rename to confirm no truncation/overflow from the new font metrics.
