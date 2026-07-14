# Prototype Fidelity Review

Reviews the branch `feature/prototype-fidelity-motion` (14 tasks, commits `9c94d4c..201398a`
plus an unstaged Task 14b follow-up) against `design_handoff_dialuna/Dialuna.dc.html`.

## Verification

- [x] **typecheck/lint/test trio**: `npm run typecheck` — 0 errors. `npm run lint` — 0 errors,
  2 pre-existing i18next warnings in `src/i18n/index.ts` (unrelated to this branch). `npm test`
  — 39/39 passing (36 pre-existing + 3 new `motion.test.ts` cases from Task 1).
- [x] **Web boot check**: an Expo dev server was already running for this project (Metro
  `packager-status:running`); fetching the web bundle (`expo-router/entry.bundle?platform=web`)
  returned HTTP 200 with a fully-built ~3.9MB bundle and no `UnableToResolveError`/transform
  errors. This confirms the app compiles cleanly for web after all 14 tasks.
- [ ] **Light/dark mode pass**: verified structurally (grep + read), not by eyeballing a
  rendered screen — see "Needs a real device" below. Every new motion-pass surface
  (`FloatingDock`, `HomeScreen` hero blob, Insights' `LockedCard`, `DayDetailSheet` backdrop)
  branches on `p.name === 'dark'` or consumes a theme-token color (`p.overlay`, etc.) rather
  than a hardcoded light-only value, so dark mode should render correctly, but this was not
  visually confirmed.
- [ ] **Small/large screen check**: not run — no simulator/device was available in this
  environment (consistent with the design spec's stated constraint). All motion-pass layout
  changes use `spacing()`/percentage/flex values rather than fixed pixel widths (e.g. the tab
  bar dock is `left/right: spacing(2.25)` not a fixed width, `QuickAction` cards are
  `width: '47.8%'`), which should hold up across sizes, but this is inferred from the code, not
  observed.

## Changes made (by area)

**Tab bar** — Replaced the default RN Tab bar with a custom `FloatingDock` (`src/app/(tabs)/_layout.tsx`):
absolutely-positioned floating pill (`left/right: 18`, `bottom: 14`, `height: 62`, `radius: 31`)
matching the prototype's dock exactly (spot-checked byte-for-byte: prototype uses the same
`18px`/`14px`/`62px`/`31px`/indicator `top:8,height:46,radius:23`), `GlassSurface` background,
a spring-driven sliding indicator (`withSpring`, `springs.soft`) instead of a static icon-color
swap, and standard React Navigation tap semantics.

**Home** — Recomposed the hero: `BlobGlow` (SVG radial-gradient) replacing the flat gradient
patch, a floating score badge as a sibling overlapping the hero card, an inline `SignalBar` row
replacing the old `MetricTile` grid, and the week strip moved up to match the prototype's
information order. Quick-action cards and the settings icon button now use the shared spring
`Pressable` (Task 14b) instead of a static `pressed &&` opacity/scale style.

**Log** — Staggered entrance (`FadeInDown` with `staggerDelay`) across the five sections, plus a
"Saved" confirmation pill on submit.

**Calendar** — Staggered entrance, the month grid unwrapped from its `Card` so it floats directly
on the background (matching the prototype's borderless grid), the month header given its own
background/padding, and the day-detail sheet backdrop switched to a real `GlassSurface` blur.

**Insights** — Restored the prototype's per-card blur+unlock lock UI (`LockedCard`): locked cards
render their real content underneath a blurred `GlassSurface` overlay with a lock icon and an
"Unlock" pill routing to `/paywall`, replacing the old single generic teaser card. Three cards
also got the prototype's varied/asymmetric corner radii instead of uniform rounding.

**AI Coach** — Full-screen fade-in on mount, and `TypingDots` retuned to an asymmetric
4-step `withSequence` (260/220/320/400ms) instead of a linear bounce. The send button now uses
the shared spring `Pressable` (Task 14b).

**Paywall** — Unified the screen's own `FadeIn` transitions (removed the ad-hoc `ZoomIn`), and
`PlanRow`'s selection state now cross-fades border/background color via `interpolateColor` +
`withTiming` instead of an instant style swap. As of Task 14b, `PlanRow` also gets the shared
spring-scale press feedback on top of the color crossfade (previously it had color animation but
no press feedback, since it built its own bare `Animated.createAnimatedComponent(Pressable)`).
The close button, CTA, and story tap-zones also moved to the shared `Pressable`.

**Settings** — Switched to `Screen edgeToEdge` with a single real spring entrance
(`FadeInDown.springify()`) and the six sections individually staggered, replacing the previous
static mount with no entrance animation. All pill buttons now use the shared spring `Pressable`.

**Onboarding** — `BlobGlow` replacing the static welcome blob `View`s, quicker step transitions
(`animation: 'fade', animationDuration: 180`), and staggered chip grids on the goals/symptoms
steps.

**Cross-cutting (Task 14b, this session)** — Audited every screen for components still using the
raw RN `Pressable`/`TouchableOpacity` instead of the shared spring-driven `@/components/ui/Pressable`
built in Task 2. Found and fixed 11 files that had been missed by the original per-screen tasks
(`PremiumBanner`, `LevelSlider`, `SegmentedToggle`, `AiChatScreen`, `CalendarScreen`, `HomeScreen`,
`DatePickerCalendar`, `Stepper`, `PaywallScreen`, `SettingsScreen`) so tactile press feedback is
now applied consistently everywhere instead of on a handful of core components only. Removed the
now-redundant manual `pressed && styles.pressed` scale/opacity hacks each of those files had
grown independently. Left `DayDetailSheet`'s full-screen modal backdrop on the raw `Pressable`
since it's an invisible tap-to-dismiss layer with no visible content to scale.

## Known gaps vs. the prototype, and why

- **Native "Liquid Glass" is iOS 26+ only.** `GlassSurface` falls back to `expo-blur`'s
  `BlurView` on Android, older iOS, and web — a strong approximation, not the identical native
  effect the prototype's CSS `backdrop-filter` implies.
- **React Native has no CSS `radial-gradient`.** `BlobGlow` uses `react-native-svg`'s
  `RadialGradient`, close but not pixel-identical to the CSS reference.
- **Some prototype values are percentage/viewport-relative CSS** that don't map 1:1 to RN's
  layout model (e.g. blob position as a percentage of a 402px-wide frame) — reproduced as the
  closest faithful equivalent, not a literal unit conversion.
- **Insights' `LockedCard` overlay uses a fixed corner radius** (`radius.xl - 2`) regardless of
  which card it wraps. On the symptoms card, which uses the asymmetric `radiusC` style, the
  overlay's uniform corners don't perfectly match the card's own asymmetric corners underneath —
  a cosmetic mismatch, not a functional one (still confirmed present as of this review).
- **`home.level.low` / `home.level.steady` / `home.level.high`** i18n keys (en + vi) are now
  unused after Task 6 removed the `wellnessTone` helper that referenced them. Safe cleanup
  candidate, not removed here since it's outside this task's scope.
- **`package-lock.json` is stale relative to `yarn.lock`.** Task 3 added `expo-blur` via
  `npx expo install`, which fell back to yarn (repo has both lockfiles tracked, and `npm install`
  is blocked by a sandbox policy hook in this environment). `package-lock.json` still has zero
  `expo-blur` entries. This needs a human decision (npm vs. yarn as the canonical lockfile) and a
  resync — not something to force silently.

## Needs a real device

- **`GlassSurface`'s native "Liquid Glass" path** (iOS 26+) — only verifiable on an actual iOS
  26 device/simulator; the `BlurView` fallback is what web/this environment exercises.
- **Haptic feedback** (`expo-haptics` calls throughout Chip/CircleButton/Stepper/etc.) — no-op in
  a web/CI context, needs a physical device.
- **Spring-physics feel** — `springs.soft`/`springs.snappy` damping/stiffness values, the tab
  indicator's slide, `PlanRow`'s color crossfade, and the new Task 14b press-feedback on 11
  additional components are all verified structurally (correct hooks, correct config objects)
  but the actual 60fps native-thread feel needs an on-device pass, not a diff review.
- **Light/dark and small/large-screen visual passes** (see Verification above) — done via code
  inspection only in this environment; a simulator or device pass is still owed.

## Environment note (unrelated to the app itself)

While finishing Task 14b, `src/components/ui/Pressable.tsx` was repeatedly rewritten in the
working tree — reformatted to double quotes and, twice, with its `Pressable` import silently
changed from `react-native` to `react-native-gesture-handler` (a real but functionally different
package). This happened while the file was open in the user's editor, consistent with an
auto-organize-imports/format-on-save feature misresolving the symbol. It was restored to the
correct `react-native`-based version (verified via `npm run typecheck`) before this report was
written, but the editor behavior itself is worth checking, since it will silently reintroduce the
same regression on the next save if left as-is.
