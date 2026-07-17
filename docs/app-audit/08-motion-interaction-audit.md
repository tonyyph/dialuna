# 08 — Motion, Animation & Interaction Audit

Branch: `feature/prototype-fidelity-motion`. Stack: react-native-reanimated `4.5.0`, react-native-gesture-handler `2.32.0` (installed, unused directly), expo-haptics `~57.0.0`. All findings **Confirmed from code** unless tagged.

## 1. Shared motion token system — `src/theme/motion.ts`

```ts
duration = { instant: 120, fast: 200, base: 300, slow: 500, ambient: 1400 }
easing = { standard: Easing.out(Easing.cubic) }
springs = { soft: {damping:16, stiffness:120, mass:1}, snappy: {damping:14, stiffness:180, mass:1} }
staggerDelay(index, base=40) = index * base
```

Re-exported from `src/theme/index.ts:8`. `src/theme/motion.test.ts` only asserts `springs`/`staggerDelay` values — `duration`/`easing` are untested, a light signal they're not yet load-bearing.

### Adoption of each export

| Export | Consumers |
|---|---|
| `duration` | **Zero** — no file outside `motion.ts` imports it |
| `easing` | **Zero** — no file outside `motion.ts` imports it |
| `springs` | `Pressable.tsx` (default `springs.snappy`), `(tabs)/_layout.tsx` (`springs.soft`, tab indicator) |
| `staggerDelay` | `HomeScreen`, `LogScreen`, `InsightsScreen`, `CalendarScreen`, `SettingsScreen`, `onboarding/goals.tsx`, `onboarding/symptoms.tsx` (7 screens) |

**Key finding**: `duration` and `easing` are fully built and tested-adjacent but **never referenced by any screen or component** — every entrance/timing animation hardcodes its own millisecond value instead. `springs`/`staggerDelay` are genuinely adopted, though not always precisely (see §3).

## 2. Full Animation/Interaction Inventory

Source of truth: 19 files importing `react-native-reanimated`, 9 files calling `Haptics.*`. **Confirmed absent anywhere in `src/`**: React Native's own `Animated` module, `LayoutAnimation`, `react-native-gesture-handler` `Gesture.*`/`useAnimatedGestureHandler`, Lottie.

| # | File | Trigger | Mechanism | Duration/Easing/Spring | Uses theme tokens? |
|---|---|---|---|---|---|
| 1 | `components/ui/Pressable.tsx` | Press in/out, app-wide | `useSharedValue` + `withSpring` on scale | `springs.snappy` default, overridable | Yes |
| 2 | `components/ui/BlobGlow.tsx` | Mount (Home, onboarding welcome) | `withRepeat(withTiming(...), -1, true)` | 9000ms, `Easing.inOut(Easing.quad)` — hardcoded | No |
| 3 | `components/ui/ScoreRing.tsx` (dead code) | `score` prop change | `withTiming` on `strokeDashoffset` | 900ms — hardcoded | No |
| 4 | `components/ai/TypingDots.tsx` | Mount (AI typing indicator) | `withDelay(withRepeat(withSequence(...)))` opacity pulse | 260/220/320/400ms per dot, staggered 0/200/400ms — hardcoded | No |
| 5 | `components/ai/MessageBubble.tsx` | New chat message | `entering={FadeInDown.duration(260)}` | 260ms — hardcoded | No |
| 6 | `(tabs)/_layout.tsx` (FloatingDock) | Tab change | `withSpring` ×2 on indicator x/width | `springs.soft` | Yes |
| 7 | `paywall/PaywallScreen.tsx` (PlanRow) | Plan selection | `withTiming` + `interpolateColor` | 150ms — hardcoded | No |
| 8 | `paywall/PaywallScreen.tsx` (root) | Story-slide step change | `entering={FadeIn.duration(220)}`, keyed by step | 220ms — hardcoded | No |
| 9 | `components/ui/Screen.tsx` | Every screen mount | `entering={FadeInDown.duration(360)}` | 360ms — hardcoded | No |
| 10 | `components/ui/BottomAction.tsx` | Bottom CTA mount | `entering={FadeInUp.duration(260)}` | 260ms — hardcoded | No |
| 11 | `HomeScreen.tsx` | Mount, 6 sections | `FadeInDown.delay(staggerDelay(i)).duration(360)` | 360ms + stagger | Partial |
| 12 | `LogScreen.tsx` | Mount, 5 sections + reflection card | Same pattern, 340ms; reflection card 400ms flat | 340/400ms + stagger | Partial |
| 13 | `InsightsScreen.tsx` | Mount, up to 5 sections | Same pattern, 340ms | 340ms + stagger | Partial |
| 14 | `CalendarScreen.tsx` | Mount, 4 sections | Same pattern, 340ms | 340ms + stagger | Partial |
| 15 | `calendar/DayDetailSheet.tsx` | Day cell tap (Modal open) | `entering={SlideInDown.springify().damping(17).stiffness(150)}` | Custom one-off spring, near-dupe of `springs.soft` (16/120) | No |
| 16 | `settings/SettingsScreen.tsx` (root) | Mount | `FadeInDown.duration(380).springify().damping(18).stiffness(140)` | Custom spring, near-dupe of `springs.soft` | No |
| 17 | `settings/SettingsScreen.tsx` (sections) | Mount, 6 sections | `FadeInDown.delay(staggerDelay(i)).duration(300)` | 300ms + stagger | Partial |
| 18-19 | `onboarding/goals.tsx`, `symptoms.tsx` | Mount, chip grid | `FadeInDown.delay(staggerDelay(index,25)).duration(260)` per chip | 260ms + custom stagger base (25ms) | Partial |
| 20 | `ai/AiChatScreen.tsx` | Mount | `entering={FadeIn.duration(280)}` | 280ms — hardcoded | No |
| 21 | `onboarding/_layout.tsx` | Step navigation | `Stack` `animation:'fade'`, `animationDuration:180` | 180ms — hardcoded | No |
| 22 | `app/_layout.tsx` | Root stack navigation | 3 route classes with different overrides | 220 / 150 (`settings`) / 380ms (`paywall`, modal) | No |
| 23 | Haptics-only (no reanimated) | Tap/select/step actions across `AppButton`, `Chip`, `CircleButton`, `SegmentedToggle`, `LevelSlider`, `Stepper`, `DatePickerCalendar`, `LogScreen` (save), `PaywallScreen` (select/subscribe) | `Haptics.selectionAsync()`/`.impactAsync(Light)`/`.notificationAsync(Success)` | N/A | N/A |

## 3. Consistency Assessment

**Partially consistent.** `staggerDelay` is used uniformly for stagger indexing across 7 screens — a genuinely working shared language. `springs.snappy` is the default spring for the shared `Pressable` primitive, so nearly every tappable control app-wide gets the same press-feedback feel "for free" — the strongest piece of shared motion language in the app. `springs.soft` is used in exactly one place.

`duration` and `easing`, however, are dead tokens. Every entrance animation hardcodes its own duration ad hoc: 220, 260, 280, 300, 340, 360, 380, 400ms for Fade variants, plus 150/900/9000ms for `withTiming`, plus 180/220/150/380ms for the three stack-transition configs. None reference `duration.instant/fast/base/slow` (120/200/300/500) by name even where values coincide. Two screens (`SettingsScreen` root, `DayDetailSheet`) hand-roll spring configs that are near-duplicates of `springs.soft` rather than reusing it — organic drift, not an intentional third preset.

**Inferred**: per-screen durations cluster tightly (within ~80ms), reading as deliberate hand-tuning per screen — but because none reference the token system, a future global timing change requires touching every screen individually.

## 4. Recent Motion Work (git history context)

```
b1bf120 update pressable
201398a update app info
e6b9afe feat: animate onboarding welcome blob, quicken step transitions, stagger chip grids
4280f21 feat: drive Settings entrance from the component, stagger its six sections
53b6dd6 feat: replace paywall's ad-hoc zoom/fade with a shared crossfade, animate plan selection
242e19c feat: fade in AI Coach screen root, retune typing indicator bounce
e6cee3b feat: restore per-card blur+unlock and varied card radii on Insights
b582ac0 feat: stagger Calendar entrance, unwrap month grid, add glass sheet backdrop
e0a20b4 feat: stagger Log screen cards and add a Saved confirmation pill
39db668 feat: recompose Home hero — floating score badge, blob glow, inline signal bars
c375c9c feat: rebuild tab bar with sliding indicator and real glass background
9f52db8 feat: add animated radial BlobGlow component
4f8683e feat: add cross-platform GlassSurface (Liquid Glass on capable iOS, BlurView elsewhere)
707cedc feat: add spring-driven Pressable primitive, wire into core buttons/chips
217f78e fix: include theme tests in vitest config so motion.test.ts actually runs
606285a feat: add shared spring presets and stagger helper to motion tokens
```

This is a coherent, sequential "prototype fidelity and motion pass": token scaffolding → `Pressable` primitive → `GlassSurface` → `BlobGlow` → tab bar rebuild → per-screen hero/stagger passes → AI Coach retune → paywall crossfade → Settings entrance → onboarding blob/stagger → `b1bf120` "update pressable" (a cleanup/consistency pass over `Pressable` adoption touching most screens, plus adding `docs/superpowers/plans/2026-07-13-prototype-fidelity-review.md`). **Unclear / requires confirmation**: whether that plan doc already tracks the unused `duration`/`easing` tokens as known follow-up work (not read in this pass).

## 5. Risk Patterns

### 5a. Repeating animations without explicit cleanup
- **`BlobGlow.tsx`** (lines 23-29): starts an infinite `withRepeat` in `useEffect` with no returned cleanup and no `cancelAnimation`. Used in 2 long-lived screens — low real-world risk, but the pattern is copy-pasteable into a shorter-lived context without anyone noticing.
- **`TypingDots.tsx`** (lines 20-33): same pattern. `TypingDots` mounts/unmounts frequently (conditionally rendered on `typing` state) — the highest-risk repeating-animation site for mount/unmount churn, though Reanimated's own view-teardown should handle it in practice. Neither is a confirmed bug (static read, not a runtime profile).

### 5b. Gesture conflicts
**None found.** `react-native-gesture-handler` is installed but not imported anywhere in `src/` — it's present only as a transitive Expo Router/React Navigation requirement. `DayDetailSheet` uses RN's built-in `Modal`, not a gesture-driven sheet. No ScrollView/gesture-handler contention risk exists in the current codebase.

### 5c. JS-thread vs UI-thread
All animation uses Reanimated's worklet-based UI-thread APIs. No RN `Animated` module usage anywhere — no JS-thread animation path competing with Reanimated.

### 5d. Decorative vs UX-supporting
- **Decorative/ambient**: `BlobGlow`'s continuous drift, chip/section stagger entrances.
- **UX-supporting**: `Pressable`'s press-scale (touch confirmation), `TypingDots` ("AI is composing" signal), tab bar sliding indicator (nav-state confirmation), paywall plan-row crossfade (selection confirmation), `DayDetailSheet`'s slide-in (standard sheet affordance).
- No animation gates a critical action behind unskippable motion; the longest loop (`BlobGlow`, 9s) is non-blocking, `pointerEvents="none"`.

### 5e. Reduced motion / accessibility
**Confirmed absent.** Zero references to `AccessibilityInfo`, `isReduceMotionEnabled`, `prefersReducedMotion`, or Reanimated's `ReduceMotion` config anywhere in `src/`. Every animation in this inventory — including the always-on `BlobGlow` loops and every screen's mandatory entrance fade — runs unconditionally regardless of the user's OS-level Reduce Motion setting. See `14-risk-register.md`.

## 6. Lottie
Confirmed absent — no `lottie-react-native` dependency, no import sites anywhere.

## Open questions
1. Whether `duration`/`easing` are intentional not-yet-adopted placeholders (may be tracked in the referenced plan doc).
2. Whether the two custom one-off springs are deliberate feel-tuning or accidental drift.
3. Whether the missing-cleanup pattern has ever caused an observed runtime issue — not tested at runtime in this audit.

## Files reviewed
`src/theme/motion.ts(.test.ts)`, all 19 files importing `react-native-reanimated`, all 9 files calling `Haptics.*`, `git log` + `git show --stat` on the last 5 commits.
