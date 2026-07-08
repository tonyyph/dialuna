# Moon Identity Foundation — Design Spec

**Phase 1 of the full app redesign.** Every other phase (Home, Calendar, AI Chat,
Premium, Onboarding, Settings, empty states) inherits from what's built here, so
it goes first.

## Context

The app now has an approved App Icon: a glassy crescent moon cradling a glowing
pearl/moonstone orb, on a deep indigo-violet night sky with gold stars and
lilac clouds swirling at the base (`assets/images/dialuna.png`). Per the
product brief, this icon is now the sole visual identity of the app. No
mascot. Every screen must feel like it was designed *after* the icon, deriving
its language from it — crescent curves, pearl/moonstone materials, aurora
light, night sky depth.

The codebase already has a partial "Aurora Night" foundation (dark/light theme
tokens, a `useTheme` hook, an animated `AuroraBackground`, glass cards, a
floating tab bar). This phase evolves that existing system in place rather
than replacing it — see "Approach" below.

**Conflicting in-flight work:** an uncommitted change to `LunaOrb.tsx` expands
it into a fully illustrated mascot character. This directly contradicts the
new brief and will be discarded (not committed) as part of this phase.

## Non-goals (deferred to later phases)

- Redesigning Home, Calendar, AI Chat, Premium, Onboarding, Settings screen
  layouts/composition — those are separate phases that consume what's built
  here.
- New iconography set (moon-curve-inspired icons) beyond what's needed for the
  tab bar and MoonMark.
- Content/copy changes.

## Approach

Evolve the existing token and component files in place rather than building a
parallel v2 system. This is a pre-release branch mid-redesign already (no
production users on the current visual language), so there's no migration
risk that would justify maintaining two systems side by side. Concretely:

- `src/theme/tokens/{dark,light,types}.ts` get renamed/cleaned keys, not new
  files.
- `GlassCard` gains a new variant rather than a parallel `MoonstoneCard`
  component.
- `LunaOrb` is deleted outright and replaced by a new `MoonMark` component at
  every call site.

## 1. Color tokens

Rename ambiguous existing keys to the semantic vocabulary from the brief, and
add the named hues it explicitly calls for. Both `dark.ts` and `light.ts` get
the same key set, re-tuned per mode (dark = the icon's night sky; light =
same hues lifted onto a pale pearl ground, not an inverted palette).

Directional palette (dark mode; exact hex fine-tuned against the icon source
during implementation, not pixel-locked here):

| New key | Old key it replaces | Direction |
|---|---|---|
| `deepMidnight` | `background`/`night` | `#0E0B1A` → `#150C33`-ish, the icon's sky base |
| `royalViolet` | `deepPlum` | `#4B2F98`-ish, deep cloud/shadow tone |
| `lavender` | `primary`/`lavender` (kept) | `#8B6FE8`, unchanged — already correct |
| `lilac` | `lavenderLight`/`iris` | `#C9A8E8`-ish, refined toward the icon's orb lilac |
| `moonWhite` | `cream` | `#FFF8ED`-ish, crescent highlight |
| `pearl` | `pearl` (redefined) | `#EAD9FF`-ish, orb sheen — was a near-black surface color, that meaning moves to `surface.card` |
| `champagneGold` | `gold` | `#F5C878`-ish, star/rim light |
| `softPeach` | `peach`/`coral` | `#FFD1A6`-ish |
| `auroraBlue` | `auroraBlue` (kept) | `#5AA9E6`, unchanged |

Dropped entirely: `lunaEyeColor`, `lunaShadowColor` (mascot-only), and the
generic `coral`/`iris`/`aqua`/`berry` names (superseded by the semantic set
above — grep-replace call sites, don't keep aliases).

Everything under `surface`, `text`, `semantic`, `phase`, `phaseSoft`,
`gradients` keeps its existing *shape* (consumers like `Card.tsx` destructure
these paths); only the flat top-level legacy keys are renamed. `gradients`
gains a `pearl` stop set (`moonWhite → pearl → lilac`) for the new moonstone
material below.

`accents.ts`'s `applyAccent` keeps working exactly as today — it overrides
`primary`/`primaryPressed`/`lavender`/`gradients.hero` only, and the renamed
keys don't change that contract.

**Testing:** `useTheme.test.ts` and `accents.test.ts` assert exact hex values
today (e.g. `expect(colors.background).toBe('#0E0B1A')`) — these get updated
to the new values as part of this change; the *behavior* they verify
(accent-slot isolation, dark/light resolution) is unchanged.

## 2. Material system

**Moonstone card variant.** `GlassCard` gains a `variant?: 'glass' | 'moonstone'`
prop (default stays `'glass'` for everyday surfaces). `moonstone`:

- Diagonal multi-stop gradient sheen using the new `gradients.pearl` stops
  (replacing the current flat 2-stop `gradients.glass` overlay for this
  variant only).
- A soft colored bloom shadow — `shadowColor: colors.royalViolet` (dark) /
  `colors.lilac` (light) instead of the flat `#000000` every other shadow
  token uses — at a new `shadows.bloom` entry (larger radius, lower opacity
  than `shadows.glow`, tuned for "floating" rather than "pressed down").
- A 1px luminous edge (`borderColor` at low-opacity `moonWhite`, not the flat
  `glassBorder` gray) instead of a hard border.

Used for hero moments only (cycle card, AI insight card, premium cards) —
call sites decided per-screen in later phases, not enumerated here. Regular
cards stay on the lighter `glass` variant so hero surfaces read as distinct.

## 3. MoonMark — the new brand mark

Replaces `LunaOrb` (and the `mascot/` folder) everywhere: tab bar center
button, `EmptyState`, AI thinking/typing indicator. A small SVG component: a
glassy crescent arc (same silhouette family as the App Icon, simplified)
cradling a glowing pearl circle. No face, no eyes, no expressions — states
(`idle` / `thinking` / `listening` / `celebrating`) are conveyed purely through
glow intensity, subtle scale breathing, and particle sparkle count, reusing
the animation plumbing already in the current `LunaOrb` (Reanimated shared
values, `reduceMotion` gating) but driving light/glow instead of a face.

```
interface MoonMarkProps {
  state?: 'idle' | 'thinking' | 'listening' | 'celebrating';
  size?: number;
}
```

This becomes the thing that carries brand recognition when the icon isn't on
screen, per the brief's "if the App Icon is removed, users should still
recognize the brand through the UI alone."

## 4. Tab bar + remaining shared components

- **Tab bar:** center button swaps `LunaOrb` → `MoonMark`, elevated on a small
  moonstone bump above the bar (glow, not a flat circle). The bar itself
  moves from flat glass + hard `glassBorder` to the moonstone treatment from
  §2 (bloom shadow, luminous edge) so it reads as a floating piece of the
  same material as the cards.
- **AppButton primary:** fill becomes a pearl gradient (`gradients.pearl` or a
  `lavender→pearl` 2-stop, whichever reads better against `colors.card` text)
  instead of flat `colors.primary`, plus `shadows.glow` already applied today
  stays but shadowColor sources from the resolved accent as it does now.
- **Chip selected state:** flat `softRose` fill → soft pearl/lilac glow
  (subtle gradient or glow shadow, low-opacity), same interaction/accessibility
  behavior.
- **ProgressRing / ScoreRing:** stroke becomes a gradient (`lavender → pearl`)
  via `react-native-svg`'s `LinearGradient`/`Stop` (already a dependency, used
  in the old `LunaOrb`) instead of a flat single-color stroke, plus a soft
  outer glow behind the ring, so rings read as "glowing constellations" per
  the brief rather than flat progress bars. Animation logic (shared values,
  `reduceMotion` handling) is unchanged — only the stroke paint and an added
  glow layer.

`Button.tsx`'s re-export of `AppButton` is unaffected structurally.

## 5. Ambient background + cleanup

**AuroraBackground** currently renders three drifting blurred color blobs and
nothing else. Add two more layers, both respecting the existing
`reduceMotion` still/animated split:

- A star field: a fixed set of small dots (varying size/opacity),
  twinkling slowly when motion is enabled, static when reduced.
- A floating particle layer: a handful of very small soft-glow dots drifting
  slowly (slower/subtler than the existing color blobs), using
  `champagneGold`/`moonWhite` at low opacity.

Every screen already renders `AuroraBackground` via `Screen.tsx`, so this
lands the "Stars, floating particles" identity requirement app-wide for free.

**Cleanup (this phase):**
- Delete `src/components/mascot/LunaOrb.tsx` and the `mascot/` folder.
- Remove all imports/usages: `src/app/(tabs)/_layout.tsx` (tab bar),
  `src/components/ui/EmptyState.tsx`, and discard the uncommitted
  `HomeScreen.tsx`/`LunaOrb.tsx` WIP diff entirely (not committed first, per
  the agreed decision).
- `EmptyState`'s `lunaState` prop is renamed to `markState` and typed against
  `MoonMark`'s state union.

## Testing

- Existing token/theme unit tests (`useTheme.test.ts`, `accents.test.ts`,
  `accents.test.ts`) updated for renamed keys/new hex values; assertions
  about accent-slot isolation and dark/light resolution behavior stay as
  regression coverage.
- `MoonMark` gets the same treatment `LunaOrb` would have — no existing test
  file for it today, none required beyond a smoke render if the project's
  convention is to only unit-test `services/`/`theme/` logic (confirm no
  component-level test convention is being skipped by checking for existing
  component tests — there are none in `src/components/` today, so none added
  here, consistent with current practice).
- Manual verification: run the app, confirm no `LunaOrb`/mascot references
  remain (`grep -r LunaOrb src`), confirm tab bar/EmptyState render `MoonMark`
  in both light and dark mode and with reduce-motion on/off.

## Subsequent phases (not designed here)

Screen-by-screen, each gets its own brainstorm → spec → plan cycle, consuming
the tokens/materials/components from this phase: Home, Calendar, AI Chat,
Premium/Paywall, Onboarding, Settings, empty states polish. Order/priority to
be decided when this phase ships.
