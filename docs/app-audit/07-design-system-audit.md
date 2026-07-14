# 07 — Design System Audit

All findings **Confirmed from code** unless tagged otherwise. Scope: `src/theme/**`, `src/components/**`, and their consumption across `src/features/**`/`src/app/**`.

## 1. Visual Identity

Dialuna's visual language is a **warm, soft "lunar wellness" aesthetic**, built from:

1. **Warm gold/amber accent ramp** (`accent100`-`accent900`, `#fff3e4` → `#3a270d`), identical across light and dark themes — the dominant brand color for phase indicators, chip selection, CTAs, glow effects.
2. **Soft translucent surfaces**, not hard cards: `surface`/`surfaceStrong` are `rgba()` translucent fills (55-70% white in light, 7-12% white in dark) over a 3-stop background gradient. `Card` (the most-reused surface, 8 screens) is soft-translucent, not opaque.
3. **Real glassmorphism in exactly 3 places**: the floating tab dock, the calendar day-detail sheet, and the Insights premium-lock overlay — all via `GlassSurface` (native `GlassView` on capable iOS, `BlurView` fallback elsewhere). Deliberately restrained, not blur-everywhere.
4. **Ambient glow via `BlobGlow`**: animated radial gradients (9s drift loop) behind Home and onboarding-welcome hero content — the clearest "lunar" ambient-motion signature.
5. **Editorial serif + clean sans pairing**: Cormorant Garamond SemiBold for all display/headline/score numerals, Manrope for body/UI text.
6. **Generous rounded radius scale** (12→32, plus named `card`/`sheet`/`button`/`dock`/`pill`=999) — nothing sharp-cornered.
7. **Warm-tinted shadows** (`#5a3c14`, `#785411`, `#3c2814`) rather than neutral black, except `shadows.button` (pure black).
8. **A separate "always-dark" premium register**: the paywall and recurring "dark hero" panels on Insights/Calendar/Log deliberately break from the light/dark theme system — a consistent design *intent*, but currently implemented via copy-pasted hardcoded hex 3x rather than a shared token/component (see §2.3).

**Components that most define this identity**: `BlobGlow`, `GlassSurface`, `Screen` (gradient shell + safe area), `Card` (soft translucent default surface), `Chip` (gold gradient selection state), `typography.display/hero/score` (Cormorant tokens).

## 2. Color System

### 2.1 Palette tokens — `src/theme/palettes.ts`

Two themes (`light`/`dark`), selected via `useTheme()` (`src/theme/useTheme.ts:5-8`) from `useSettingsStore((s) => s.theme)`. No system-auto-detect inside the theme layer itself.

| Token | Light | Dark |
|---|---|---|
| `bgGradient` (3-stop) | `#fbf3ec → #f7ecee → #f1e9f0` | `#211d24 → #1f1b21 → #1c1a1f` |
| `heroGradient` | `#fff3e4 → #fbf3ec → #f6ecf1` | `#2c2530 → #241f27 → #221d24` |
| `goldChipGradient` | `#facb8d → #ffe3bf` | `#c28d41 → #a06f24` |
| `premiumBannerGradient` | `#2c2620 → #3a2f22` | same (intentionally always-dark) |
| `text` / `textMuted` / `textFaint` | `#201f1d` / 65%/50% rgba | `#f3f2f2` / 65%/50% rgba |
| `surface` / `surfaceStrong` / `surfaceSolid` | 55%/70% white / `#fffdfb` | 7%/12% white / `#2b272e` |
| `fillSubtle` / `track` / `overlay` | subtle black tints | subtle white tints / `rgba(0,0,0,0.6)` |
| `accent` / `accentInk` | `#b68235` / `#7d5411` | `#e1ad66` / `#facb8d` |
| `accent100`-`accent900` | shared ramp, **identical in both themes** | same |
| `primaryBtn`/`onPrimaryBtn` | `#2d2b2b`/`#fbf3ec` | `#f3f2f2`/`#201f1d` |
| `danger` / `success` | `#b3453c` / `#7d5411` | `#e08079` / `#facb8d` |
| `phase.*` / `phaseSoft.*` | accent-ramp hex | mostly same; `ovulation` differs; translucent rgba tints |
| `shadowColor` | `#5a3c14` | `#000000` |

**Confirmed observation**: `accent100`-`accent900` is spread unchanged into both palettes (`palettes.ts:80,117`). This means e.g. `accent100` (a near-white gold tint, `#fff3e4`) is used as-is on dark backgrounds too — a deliberate design choice already partially compensated for (`Chip.tsx:48` special-cases dark-theme label color instead of relying on the ramp), suggesting the team is aware of this and handles it ad hoc rather than systemically.

### 2.2 Paywall-only palette — `palettes.ts:140-152`

```
paywallColors = { bg:'#1f1c18', text:'#f4ede1', textDim, textFaint, segment, border, closeFill, accent:'#b68235', accentTint, badge:'#5a3b0a', ctaText:'#1a1712' }
```
Comment: "The paywall is always dark, independent of app theme" (`palettes.ts:139`) — a deliberate, separate token set.

### 2.3 Hardcoded colors outside the theme system

| File:Line | Literal | Note |
|---|---|---|
| `onboarding/welcome.tsx:59` | `#000` (shadowColor) | should reference `shadows.*`/`p.shadowColor` |
| `onboarding/welcome.tsx:18` | `rgba(182,130,53,0.20/0)` | BlobGlow gradient — matches `accent` in rgba form, not token-derived |
| `InsightsScreen.tsx:43,59` | `#2c2620` | matches `premiumBannerGradient[0]` exactly, hardcoded |
| `InsightsScreen.tsx:45,61` | `#f4ede1` | matches `paywallColors.text` exactly, hardcoded |
| `InsightsScreen.tsx:233` | `rgba(244,237,225,0.78)` | derivative of `#f4ede1` |
| `InsightsScreen.tsx:192` | `rgba(28,26,31,0.55)`/`rgba(251,243,236,0.55)` | theme-conditional glass tint, inline |
| `CalendarScreen.tsx:68,71` | `#2c2620` / `#f4ede1` | same dark-hero pattern (2nd occurrence) |
| `CalendarScreen.tsx:169,220` | `rgba(225,173,102,0.28)` / `rgba(244,237,225,0.78)` | theme-conditional / derivative |
| `LogScreen.tsx:120,122,276` | `#2c2620` / `#f4ede1` / `rgba(244,237,225,0.78)` | same dark-hero pattern (3rd occurrence) |
| `HomeScreen.tsx:55-56` | `rgba(225,173,102,*)` / `rgba(182,130,53,*)` | BlobGlow gradient, theme-conditional, ≈ `accent`/`accent400` in rgba |
| `(tabs)/_layout.tsx:51,62` | theme-conditional rgba | GlassSurface tint / tab indicator fill |
| `components/ui/Chip.tsx:48` | `'#201f1d'` (dark-theme selected label) | one-off override; only correct because it equals light's `text` value today |
| `components/cycle/CalendarDayCell.tsx:36` | `rgba(225,173,102,0.28)` (dark) vs `p.accent200` (light) | same predicted-period pattern as `CalendarScreen.tsx:169` |
| `components/paywall/PremiumBanner.tsx:50,54` | `'#f4ede1'`, `'rgba(244,237,225,0.75)'` | should reference `paywallColors.text`/`textDim` but doesn't import `paywallColors` at all |

**Key duplicate-color finding**: the pair `#2c2620` + `#f4ede1` ("dark hero panel") is hand-copied into **three separate screens** (Insights, Calendar, Log — 6 occurrences total), plus a near-identical set independently lives in `PremiumBanner.tsx` and `paywallColors`. None of the three screens import `paywallColors` or reference `premiumBannerGradient` — values are re-typed as raw hex. This is a duplicated-markup issue, not just a token issue; a shared `DarkHeroPanel`/`HeroPanel` component or token would remove 6+ hardcoded occurrences at once. See `13-technical-debt.md`.

## 3. Typography

### 3.1 Type scale — `src/theme/typography.ts`

Two font families: `CormorantGaramond_600SemiBold` (serif, display/headline/score) and `Manrope_{400,500,600,700}` (sans, body/UI). Marked "2026-07 design handoff" scale (`typography.ts:4`).

| Token | Family | Size | Line height | Letter spacing | Transform |
|---|---|---|---|---|---|
| `display` | Cormorant 600 | 42 | 46 | — | — |
| `hero` | Cormorant 600 | 34 | 38 | — | — |
| `headline` | Cormorant 600 | 28 | 33 | — | — |
| `headlineSm` | Cormorant 600 | 24 | 28 | — | — |
| `title` | Cormorant 600 | 19 | 24 | — | — |
| `score` | Cormorant 600 | 32 | 34 | — | — |
| `serifValue` | Cormorant 600 | 20 | 24 | — | — |
| `subtitle` | Manrope 600 | 15 | 20 | — | — |
| `body` | Manrope 400 | 14 | 21 | — | — |
| `bodySmall` | Manrope 400 | 13 | 19 | — | — |
| `caption` | Manrope 500 | 12 | 16 | — | — |
| `kicker` | Manrope 700 | 11 | 14 | 1.1 | uppercase |
| `micro` | Manrope 600 | 11 | 14 | 0.8 | uppercase |
| `button` | Manrope 600 | 14 | 18 | — | — |

Fonts loaded once via `useFonts` in `src/app/_layout.tsx:56-62`; only weights actually used are imported (no unused font-weight imports).

### 3.2 Hardcoded typography outside the scale

**(a) fontSize literal with no `typography.*` reference**: `(tabs)/_layout.tsx:162` (9.5, tab label), `HomeScreen.tsx:345,374` (34, 9), `CalendarScreen.tsx:259` (14), `onboarding/Stepper.tsx:74` (fully hand-rolled 18/22/Manrope_600), `CalendarDayCell.tsx:116` (9, energy badge).

**(b) `...typography.X` spread then overridden** (12 occurrences) — notably `onboarding/account.tsx:116` and `SettingsScreen.tsx:408` share a byte-identical override `{ ...typography.body, fontSize: 15, minHeight: 24, padding: 0 }`, a concrete candidate for a shared `inputText` style. Also: `SettingsScreen.tsx:417,433`, `PaywallScreen.tsx:241,255,272,299` (4 overrides), `MessageBubble.tsx:42`, `DisclaimerBox.tsx:31`, `ScoreRing.tsx:88` (dead component, see §5), `PremiumBanner.tsx:49`.

**fontWeight literals** (the type scale carries no `fontWeight` field, so bold/emphasis is always manual): `LogScreen.tsx:288`, `DatePickerCalendar.tsx:133`, `LevelSlider.tsx:57`, `PhaseBadge.tsx:44`, `CalendarDayCell.tsx:100,103` — all `'600'`/`'700'` literals, untracked by any token.

**Assessment (Inferred)**: headline/body scale adoption is reasonably good; numeric micro-adjustments recur per screen, and `fontWeight` is an entirely untracked pattern. Low risk overall except the byte-identical duplicate input-text style.

## 4. Spacing, Radius, Shadow, Sizes

**`src/theme/spacing.ts`**: `spacing(n) = n * 8` (8pt grid function, used pervasively) plus a parallel `space = {xxs:4, xs:8, sm:12, md:16, lg:20, xl:24, xxl:32}` object. **Confirmed**: `space` is **not re-exported** from `src/theme/index.ts` (only `spacing` is) — it is currently dead/unreachable via the `@/theme` barrel. **Unclear / requires confirmation** whether this is intentional or an oversight.

**`src/theme/radius.ts`**: `sm:12, md:16, lg:20, xl:24, xxl:32, card:24, sheet:32, button:18, dock:31, pill:999`.

**`src/theme/shadows.ts`**: presets `tiny, soft, float, hero, button, chip`, each a full `ViewStyle`. **Confirmed inconsistency**: shadow colors are not uniform — `warm = '#5a3c14'` for most presets, but `float`/`hero`/`button` use `#3c2814`/`#785411`/`#000000` respectively. `shadows.ts` does not import `useTheme` at all, so dark-mode shadow tinting instead comes from a separate, disconnected `palette.shadowColor` concept (`palettes.ts:97,134`) — two independent "shadow color" ideas that don't visibly connect.

**`src/theme/sizes.ts`**: `iconSm:16, iconMd:20, iconLg:24, touchTarget:44, buttonHeight:54, inputHeight:52, screenPadding:20, cardPadding:20, bottomActionMinHeight:86`.

**Hardcoded radius literals** (selected, not exhaustive): `(tabs)/_layout.tsx:156` (16, = `radius.md`), `onboarding/welcome.tsx:57,71` (28 unmatched; 24 = `radius.xl`), `InsightsScreen.tsx:306` (14), `HomeScreen.tsx:358,368` (64, 26), `AiChatScreen.tsx:160` (21), `PaywallScreen.tsx:214,224,276` (2,17,10), `Stepper.tsx:69` (19, half of hardcoded 38), `OnboardingStepHeader.tsx:44` / `TypingDots.tsx:59` (3, dot — duplicated pattern), `PremiumBanner.tsx:40` (22). The value `22` (`radius.xl - 2`) recurs in two independent places (`Card.tsx:23` comment, `InsightsScreen.tsx` lock overlay) as a computed magic number with no named token, despite `radius.card` already existing at `24` (a different value).

**Assessment**: spacing-scale adherence is good (`spacing(n)` used consistently); radius adherence has meaningfully more one-off custom values; shadow tinting is the least consistent of the three.

## 5. Component Inventory

| Component | File | Purpose | Used by | Reuse status |
|---|---|---|---|---|
| AppButton | `ui/AppButton.tsx` | Primary button primitive | Only via `Button` alias | Internal; not a duplicate |
| Button | `ui/Button.tsx` | `export { AppButton as Button }` | 9 files | Live, well-reused — pure re-export, not a competing implementation |
| BlobGlow | `ui/BlobGlow.tsx` | Ambient radial-gradient glow (9s loop) | Home, onboarding welcome (2) | Core to the lunar identity |
| BottomAction | `ui/BottomAction.tsx` | Fixed bottom CTA wrapper | Via `Screen`'s `bottomAction` prop, 5 screens | Reused indirectly |
| Card | `ui/Card.tsx` | Soft translucent surface | 8 screens | Widely reused; `variant?: 'solid'\|'glass'` prop is a vestigial no-op (both render identically — comment: "kept for compatibility") |
| Chip / ChipGroup | `ui/Chip.tsx`/`ChipGroup.tsx` | Selectable pill + wrap layout | 4-5 screens | Reused |
| CircleButton | `ui/CircleButton.tsx` | Icon-only circular button, **required** `label` prop | Settings, OnboardingStepHeader | Reused; good systemic a11y guard |
| DisclaimerBox | `ui/DisclaimerBox.tsx` | Leaf-emoji muted info box | 4 screens | Reused |
| EmptyState | `ui/EmptyState.tsx` | Luna mascot + title/body | InsightsScreen only | Single-use, purpose-built for reuse |
| **GlassCard** | `ui/GlassCard.tsx` | `return <Card style={style}>{children}</Card>` — self-documented "Legacy wrapper" | **0 imports anywhere** | **Dead code.** `contentStyle`/`gradient` props declared but never consumed even if used |
| GlassSurface | `ui/GlassSurface.tsx` | Real native blur/glass | InsightsScreen, DayDetailSheet, tab dock (3) | Reused; the only component rendering real blur/glass |
| LevelSlider | `ui/LevelSlider.tsx` | 1-10 discrete level picker | LogScreen only | Single-use, domain-specific |
| Pressable | `ui/Pressable.tsx` | Native-thread spring scale-on-press wrapper | 11 files directly + nearly every interactive component indirectly | **Foundational** — base interaction primitive app-wide |
| ProgressBar | `ui/ProgressBar.tsx` | Generic fill bar | HomeScreen only | Single-use, generic API |
| **ScoreRing** | `ui/ScoreRing.tsx` | Animated circular score ring | **0 imports anywhere** | **Dead code** — fully built (animated stroke, a11y `progressbar` role) but unwired |
| Screen | `ui/Screen.tsx` | Full-screen shell (gradient, safe area, scroll, keyboard-avoiding, bottom action slot) | 11 screens | **Foundational**, near-universal shell |
| SectionTitle | `ui/SectionTitle.tsx` | Kicker section header | InsightsScreen only | Single-use, generic |
| SegmentedToggle | `ui/SegmentedToggle.tsx` | Radio-group control | SettingsScreen only | Single-use; uses double-quote imports (minor style inconsistency) |
| CalendarDayCell / PhaseBadge / WeekStrip | `cycle/*` | Cycle-domain visuals | Calendar/Home contexts | Appropriately domain-scoped |
| Luna | `mascot/Luna.tsx` | SVG mascot, 5 expressions | EmptyState + other AI/onboarding contexts | Core brand asset, theme-aware |
| PremiumBanner | `paywall/PremiumBanner.tsx` | Dark-gradient upsell banner | Home | Uses hardcoded colors instead of `paywallColors` — see §2.3 |
| MessageBubble / SuggestedPrompts / TypingDots | `ai/*` | Chat UI | AiChatScreen | AI-chat-specific; `SuggestedPrompts` correctly reuses `Chip` |

### GlassCard vs GlassSurface
Not duplicates despite similar names — `GlassCard` is dead code with **no** glass effect at all (a same-file redirect to `Card`); `GlassSurface` is the real, actively-used blur primitive. The naming collision is a confirmed source of potential confusion for future contributors. Recommend deleting `GlassCard` or renaming it away from the "glass" implication.

## 6. Accessibility

Grep counts across `src/components`+`src/features`+`src/app`: `accessibilityLabel` in 22 files, `accessibilityRole` in 19 files, `accessibilityHint` in **0 files anywhere**, `hitSlop` in 4 files.

**Icon-only buttons spot-checked** — all labeled correctly (`HomeScreen.tsx:68-76` settings icon, `PaywallScreen.tsx:57-65` close icon, `InsightsScreen.tsx:196-200` lock CTA, and `CircleButton` enforces a required `label` prop at the type level). **Not exhaustively checked**: `AiChatScreen.tsx:96` send button, `HomeScreen.tsx:248` dynamic-icon quick action.

**Touch target sizing** (target ≈ 44×44pt per the app's own `sizes.touchTarget`):

| Component | Size | hitSlop? | Effective | Verdict |
|---|---|---|---|---|
| `onboarding/Stepper.tsx:67-69` (+/- steppers) | 38×38 | **none** | 38×38 | **Confirmed undersized, uncompensated** |
| `PaywallScreen.tsx:222-224` close button | 34×34 | `hitSlop={8}` | ~50×50 | Compensated |
| `CircleButton` default | 38×38 | `hitSlop={8}` | ~54×54 | Compensated |
| `HomeScreen.tsx:454-455` quick-action icon | 36×36 | n/a (decorative, inside larger pressable) | n/a | Not itself a target |

`Stepper.tsx`'s +/- buttons (used in onboarding cycle-basics for numeric cycle/period length) are the one clear, uncompensated undersized touch target found in this audit.

## Open items / requires confirmation
1. Whether `ScoreRing.tsx`/`GlassCard.tsx` are safe to delete or staged for near-term use.
2. Whether `space` (the `{xxs..xxl}` object) is intentionally excluded from the `@/theme` barrel.
3. Full a11y-label audit was spot-checked, not exhaustive.
4. Whether `Chip.tsx:48`'s hardcoded `'#201f1d'` (coupled to light theme's `text` value) is intentional.

## Files reviewed
All of `src/theme/**`, `src/components/ui/**`, `src/components/cycle/**`, `src/components/mascot/Luna.tsx`, `src/components/paywall/PremiumBanner.tsx`, `src/components/ai/**`, plus consumption sites across `src/features/**`/`src/app/**`.
