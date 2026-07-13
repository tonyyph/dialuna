# Handoff: Dialuna — Onboarding, AI Coach, Paywall & Settings Redesign

## Overview
This package covers the four screens/flows that still needed a full UI rebuild in the Dialuna React Native / Expo app: **Onboarding**, **AI Coach**, **Paywall (Premium)**, and **Settings**. It also includes a lightly-restyled pass of the already-shipped Today/Track/Calendar/Insights tabs so the whole app reads as one consistent design language — but those four screens' *logic and data model* are yours; treat their markup here only as the new visual language reference, not a rebuild request.

## About the Design Files
The bundled `Dialuna.dc.html` is a **design reference built in HTML** — an interactive prototype showing intended look, layout, motion, and behavior. It is not production code to copy/paste. Your task is to **recreate this design in the app's existing React Native / Expo environment** — using existing navigation (React Navigation / Expo Router), existing state management, and existing styling conventions (StyleSheet, Tailwind/NativeWind, styled-components, etc. — whatever this codebase already uses).

Open `Dialuna.dc.html` directly in a browser to click through the live prototype (onboarding → main app → tabs → Coach/Settings/Paywall).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, and copy in the prototype are final-intent — recreate them closely. Exact pixel values below (measured at a 402×874 design frame, iPhone-sized).

## Visual Direction
- Soft, premium, organic — layered/floating surfaces on a warm gradient ground, not flat rectangular cards with borders.
- Background: `linear-gradient(165deg, #fbf3ec 0%, #f7ecee 45%, #f1e9f0 100%)` (light mode). Dark mode swap: `linear-gradient(160deg, #211d24, #1c1a1f)`, text `#f3f2f2`.
- Cards/surfaces: semi-transparent white fills (`rgba(255,255,255,0.55–0.6)`), soft diffuse shadows (`0 10px 24px rgba(90,60,20,0.08)`), no visible borders. Vary corner radius per card (one corner smaller, e.g. `26px 26px 26px 10px`) instead of uniform rounded rectangles everywhere — avoid the "every card looks identical" pattern.
- Accent color: `#b68235` (warm gold), with tonal ramp 100–900 (see Design Tokens). Used for active states, highlights, the Hormone Twin badge, premium/paywall moments.
- Typography pairing: **Cormorant Garamond** (serif, weight 600) for all display/heading text — greeting, phase name, section titles, scores. **Manrope** (sans, weights 400–700) for body copy, labels, buttons, form fields.
- Buttons: pill-shaped (`border-radius: 18px`), no border. Primary = solid near-black fill (`var(--color-neutral-900)` / `#201f1d`-ish) with soft shadow. Secondary = translucent white fill, no border.
- Chips (mood/flow/symptom/goal selectors): pill shaped, unselected = translucent white; selected = soft gold gradient fill + shadow lift. No borders anywhere in the redesign — depth comes from shadow + fill, not strokes.

## Screens / Views

### 1. Onboarding (4 steps + welcome)
**Purpose:** first-run setup — collect cycle baseline, goals, symptom history, and create an account before entering the main app.
- **Welcome**: full-bleed gradient background, soft blurred gold blob glow top-left (`radial-gradient` circle, `filter: blur(4px)`, animates position dial 9–10s loop — optional polish, safe to implement as a static blob if Reanimated isn't warranted for a single screen). App mark (72×72 rounded-square dark tile with an offset cream circle to suggest a moon), serif "Dialuna" wordmark at 42px, one-line subhead, single pill CTA "Get started".
- **Cycle basics**: back chevron (circular icon button, white fill) + 4-dot step progress (6px dots, gold when active, light gray otherwise) + two stepper rows (Average cycle length, Period length: circular −/+ buttons flanking a serif number readout) inside soft cards, plus a native date input for "first day of last period," also in a soft card. Bottom-pinned pill "Continue".
- **Goals**: multi-select pill chips, 6 options: Understand my body / Reduce PMS symptoms / Plan pregnancy / Avoid pregnancy / Track fertility / General wellness.
- **Symptom history**: multi-select pill chips, 8 options: Cramps / Bloating / Headaches / Fatigue / Mood swings / Acne / Tender breasts / Insomnia.
- **Account creation**: Name + Email fields in soft cards, primary pill "Create account", secondary pill "Continue with Apple" (stub — wire to your real auth).

### 2. AI Coach
**Purpose:** cycle-aware Q&A chat with suggested prompts.
- Header: serif "Coach" title, top-padded to clear the status bar/notch (56px).
- Scrollable message list: coach bubbles = translucent white pill (left-aligned), user bubbles = gold-tinted pill (right-aligned), `border-radius: 16px`, max-width 78%. Typing indicator = 3 bouncing dots when the coach is "thinking."
- Suggested prompt chips (horizontally scrollable row) above the input: "Why am I so tired today?", "When's my next period?", "Tips for PMS bloating", "What does my Hormone Twin score mean?" — tapping a chip sends it as a message immediately.
- Input row: pill text field (translucent white, no border) + circular send button (solid dark fill, paper-plane icon).
- Reply logic (reference implementation, adapt to real LLM/backend): keyword-matches the user's message (tired/energy, next/period, pms/bloat, hormone twin/score) against the user's *current computed cycle phase* and returns a phase-aware canned response; falls back to a generic phase blurb. In production this is where you'd call your real AI backend, passing current cycle-day/phase context.

### 3. Paywall (Premium)
**Purpose:** convert free users to Premium — story-style swipeable value screens, then a plan picker.
- Full-screen modal, near-black background (`#1f1c18`), cream text (`#f4ede1`).
- Top: thin segmented progress bar (4 segments, Instagram-story style) + close (X) button top-right.
- **Story slides (3)**: tap right two-thirds of screen = next, left third = back. Centered icon (simple line-icon), serif headline, one-line supporting copy. Slide copy:
  1. "Know your patterns" — full Hormone Twin trend & signal correlations across the cycle.
  2. "Your Hormone Twin, deeper" — trend vs. score.
  3. "Never guess your PMS window" — two-cycle symptom forecast.
- **Plan picker (slide 4)**: "Choose your plan" headline, two selectable plan rows (Monthly $9.99/mo, Annual $59.99/yr · $5/mo with a "SAVE 40%" badge) — selected row gets a gold border + tinted fill. Below: 4-item checkmark feature list. Bottom-pinned solid-gold pill CTA "Start 7-day free trial". Footer: "Restore purchase · Terms · Privacy" (plain text, wire to real links/StoreKit/Play Billing flows).

### 4. Settings
**Purpose:** account, cycle configuration, notifications, appearance, privacy, and subscription management.
Six soft-card sections, each with an uppercase tracked-letter-spacing label above it:
1. **Profile & account** — Name, Email fields, "Sign out" button.
2. **Cycle setup** — Average cycle length, Period length, Luteal phase length (all as circular −/+ steppers with a serif number readout), Last period start date (native date input).
3. **Notifications** — Period reminder / Ovulation reminder / Daily log reminder, each an On/Off segmented toggle.
4. **Appearance** — Units (US/Metric) and Theme (Light/Dark) segmented toggles. Dark mode actually swaps the whole app's background/text tokens (see Design Tokens) — implement as a real theme switch, not cosmetic-only.
5. **Privacy & data** — "Export my data" and "Delete all data" buttons, each showing an inline confirmation line on tap.
6. **Subscription** — shows current plan status; "Upgrade" button (opens Paywall) if free, "Manage" button if Premium.

Settings opens as a full-screen sheet over whichever tab was active (slide/fade in from bottom, ~380ms), with a circular back-chevron button + serif title at the top.

### Main tab shell (reference — logic already exists, this is the visual layer only)
- **Floating "fluid dock" bottom bar**: NOT a bar flush with the screen edge — floats 14px above the safe area, inset 18px from each side, fully rounded (`border-radius: 31px`), translucent white with backdrop blur, soft shadow. A sliding pill indicator (gold-tinted gradient) glides behind the active tab icon (`transition: left .4s cubic-bezier(.34,1.56,.64,1)`). Active tab's icon gets a subtle gold drop-shadow glow and lifts slightly; only the active tab shows its label (others show icon only).
- **Today hero**: asymmetric-radius gradient panel (`32px 32px 32px 12px`) with a blurred gold blob glow in one corner, phase name in serif display size, and a floating circular "Hormone Twin" score badge that overlaps the panel's bottom edge (not contained inside it) — this overlap/layering is intentional, a core motif of the redesign (see also the Insights cards, which use three different asymmetric radii rather than one repeated card shape).

## Interactions & Behavior
- Tab switch: content fades + translates up on entry (~400–450ms ease).
- Button/chip press: no defined native press animation in the HTML prototype (CSS `:active` isn't meaningful in RN) — use your app's standard `Pressable` opacity/scale feedback, or add `react-native-reanimated` scale-down-on-press (~0.94, 120ms) for consistency with the "soft, tactile" direction.
- Modals (Settings, Paywall): animate in with a slight upward slide + fade, ~380–400ms, ease-out.
- Chat: new message appends with a fade+slide-up entrance; auto-scrolls to bottom on new message; typing indicator (3 dots, staggered bounce) shows for ~700ms before the coach's reply lands.
- Onboarding steppers/chips: value changes are instant (no animation needed) but should have a visible pressed state.
- Dock indicator: slides continuously between tab positions rather than snapping.

## State Management
Reference-only (mirror however this app already manages state — Context, Zustand, Redux, etc.):
- `profile`: `{ avgCycle, periodLen, lastPeriod (ISO date), name, email, goals[], symptoms[] }`
- `settings`: `{ notifPeriod, notifOvulation, notifDaily, lutealLen, units, theme }`
- `logs`: map of ISO date → `{ mood, flow, symptoms[], energy, stress, sleep, workout, notes }` (already exists in Track — Settings/Insights only read it)
- `premium`: boolean; `plan`: `'monthly' | 'annual'`
- `chatMessages`: array of `{ role: 'user' | 'coach', text }`; `coachTyping`: boolean
- Cycle-day/phase computation (used by Today, Coach, Calendar, Insights): given `lastPeriod`, `avgCycle`, `periodLen`, `lutealLen`, compute `cycleDay` (1-indexed, wraps every `avgCycle` days) and bucket into Menstrual / Follicular / Ovulation / Luteal phases. See `computePhase()` in the prototype's script for the exact formula — port this logic directly, it's pure date math with no dependencies.

## Design Tokens

**Colors**
- Background gradient (light): `#fbf3ec → #f7ecee → #f1e9f0`
- Background gradient (dark): `#211d24 → #1c1a1f`
- Text: `#201f1d` (light) / `#f3f2f2` (dark)
- Accent (gold): base `#b68235`; ramp 100 `#fff3e4`, 200 `#ffe3bf`, 300 `#facb8d`, 400 `#e1ad66`, 500 `#c28d41`, 600 `#a06f24`, 700 `#7d5411`, 800 `#5a3b0a`, 900 `#3a270d`
- Neutral ramp: 100 `#f8f4f4` … 900 `#2d2b2b` (900 is the primary-button fill `#201f1d`-ish, use `#2d2b2b`/neutral-900)
- Paywall background: `#1f1c18`; paywall text: `#f4ede1`
- Card fill: `rgba(255,255,255,0.55–0.6)` over the gradient background
- Card shadow: `0 10px 24px rgba(90,60,20,0.08)` (soft cards) / `0 18px 40px rgba(120,84,17,0.14)` (hero panel)

**Typography**
- Display/Heading: Cormorant Garamond, weight 600. Sizes: welcome wordmark 42px, screen titles 28px, hero phase name 34px, section headers 26px, card titles 16–19px, score readouts 30–32px.
- Body/UI: Manrope, weights 400 (body) / 600–700 (labels, buttons, kickers). Sizes: body 13–14px, captions/kickers 10–11px (uppercase, `letter-spacing: 0.1em`), button labels 13.5–14px.

**Spacing & Radius**
- Screen padding: 18–20px horizontal, ~56px top (clears status bar/notch).
- Card radius: 20–22px standard; asymmetric variants (one corner reduced to 10–12px) for hero/insight cards to break uniformity.
- Button/chip radius: 14–18px (fully pill for short labels).
- Dock: 31px radius, 62px tall, floats 14px off the bottom safe area, 18px side insets.

**Shadows**
- Soft card: `0 10px 24–26px rgba(90,60,20,0.08)`
- Hero panel: `0 18px 40px rgba(120,84,17,0.14)`
- Floating badge/dock: `0 14px 28–34px rgba(60,40,20,0.16), 0 2px 8px rgba(60,40,20,0.08)`
- Primary button: `0 10px 22px rgba(0,0,0,0.16)`

## Assets
- No custom icon set/illustrations — all icons are simple inline line-art (circle, plus, calendar, bar-chart, sparkle/star, chevrons, gear, lock, checkmark, paper-plane, X). Recreate with your app's existing icon library (e.g. `lucide-react-native`, `@expo/vector-icons`) matching these simple line-icon shapes at 1.6–1.7px stroke weight.
- Fonts: Cormorant Garamond (600) and Manrope (400/500/600/700) — both on Google Fonts; use `expo-font` / `@expo-google-fonts/cormorant-garamond` + `@expo-google-fonts/manrope`.

## Files
- `Dialuna.dc.html` — the full interactive prototype (open in any browser). Click through Onboarding → main app tabs → gear icon (Settings) → premium banner or Insights lock icon (Paywall) → Coach tab (chat).
