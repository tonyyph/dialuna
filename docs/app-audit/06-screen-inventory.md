# 06 — Screen-by-Screen UX Audit

Combines findings from the navigation, design-system, and motion audits. All findings **Confirmed from code** unless tagged.

| Screen | File | Goal | Primary action | Secondary action | Loading | Error | Empty | Entry/exit transition | Notable UX issue |
|---|---|---|---|---|---|---|---|---|---|
| Index (redirect) | `src/app/index.tsx` | Route to correct root | n/a | n/a | n/a | n/a | n/a | Instant `Redirect` | — |
| Onboarding Index (redirect) | `src/app/onboarding/index.tsx` | Route into onboarding | n/a | n/a | n/a | n/a | n/a | Instant `Redirect` to welcome | — |
| Welcome | `onboarding/welcome.tsx` | First-impression hero, brand intro | "Get started" → disclaimer | none | absent | absent | n/a | Stack fade 180ms; `BlobGlow` ambient hero animation | No back button on this screen |
| Disclaimer | `onboarding/disclaimer.tsx` | Medical disclaimer acknowledgment | CTA → cycle-basics | none | absent | absent | n/a | Same stack fade | No back button on this screen |
| Cycle Basics | `onboarding/cycle-basics.tsx` | Collect cycle stats | Continue (disabled until date picked) | Back | absent | absent | n/a | Stack fade | Stepper bounds (21-40) narrower than the zod schema (20-45) — see `03-business-rules.md` |
| Goals | `onboarding/goals.tsx` | Collect user goals | Continue (disabled until ≥1 goal) | Back | absent | absent | n/a | Chip grid stagger, `FadeInDown.delay(staggerDelay(i,25))` | — |
| Symptoms | `onboarding/symptoms.tsx` | Collect symptom history | Continue (always enabled) | Back | absent | absent | n/a | Same chip stagger | — |
| Account | `onboarding/account.tsx` | Collect nickname/email, complete onboarding | Finish (validates name+email) | Back; disabled "Sign in with Apple" stub | absent | Inline validation text post-`touched` | n/a | Keyboard-avoiding `Screen` | Apple sign-in button is a non-functional placeholder |
| Home | `features/home/HomeScreen.tsx` (499 lines) | Daily hub: cycle status, hormone twin, quick actions | Quick actions (Log/AI/Calendar/Insights) | Settings gear; "Ask AI"; Premium banner → paywall | absent — returns `null` if no profile, no spinner | absent | Implicit via `null` return | 6-section `FadeInDown` stagger (360ms each), `BlobGlow` hero | Largest screen in the app; blank-screen edge case if profile briefly absent |
| Log | `features/log/LogScreen.tsx` (338 lines) | Daily symptom/mood/level logging | Save (bottom action) | none | absent | absent | n/a — pre-fills from existing log | Card-by-card stagger; success haptic + "saved" pill + reflection card fade-in | — |
| Calendar | `features/calendar/CalendarScreen.tsx` (307 lines) | Month view of cycle/log history | Tap day → `DayDetailSheet` | Month prev/next | absent | absent | n/a — returns `null` if no profile | Section stagger; day sheet `SlideInDown` custom spring (17/150, not the shared `springs.soft` 16/120) | Custom spring is a near-duplicate of the shared token instead of reusing it |
| Insights | `features/insights/InsightsScreen.tsx` (332 lines) | Historical pattern analytics | Unlock CTA on locked cards → paywall | none | absent | absent | Explicit `EmptyState` (Luna "thinking") when `logCount < 3` | Stagger entrance; `GlassSurface` lock overlay on gated cards | — |
| AI Chat | `features/ai/AiChatScreen.tsx` (168 lines) | Chat-style Q&A + reflections | Send message / tap suggested prompt | none | `TypingDots` during simulated 600ms delay | absent | Explicit empty panel when no messages | Screen `FadeIn.duration(280)`; auto-scroll to end | Chat "AI" is a keyword-template engine, not a real model — see `03-business-rules.md` |
| Settings | `features/settings/SettingsScreen.tsx` (442 lines) | Account/app configuration | Inline section edits | Sign out; Delete all data (2-step confirm); Upgrade/Manage → paywall | absent | Invalid inline edits silently rejected (no error text) | n/a — returns `null` if no profile | Whole-content `FadeInDown.springify()` (custom spring 18/140, not `springs.soft`) + 6 sections staggered independently | Sign out has no confirm dialog (unlike Delete, which has one); dev premium toggle rendered unconditionally — see `14-risk-register.md`; "Export data" is a UI stub |
| Paywall | `features/paywall/PaywallScreen.tsx` (300 lines) | Present premium value + convert | Subscribe → `purchase()` + close | Close (X); tap-navigate 3 story slides; Restore (no-op); plan selector | absent | absent (purchase cannot fail — it's a local mock) | n/a | Modal `fade_from_bottom` 380ms; per-slide `FadeIn.duration(220)`; plan row border/bg `withTiming` 150ms crossfade | Purchase/Restore are fully mocked — see `11-monetization-analytics-notification.md` |

## Cross-cutting observations

- **No screen implements a loading spinner** anywhere in the app — every async-shaped seam (store hydration, "typing" delay, purchase) either blocks behind the splash screen or has no loading affordance at all. This is low-risk today because there is no real network I/O, but would need addressing the moment any real backend/IAP/AI call is introduced.
- **No screen implements an error state** for the same reason — there is nothing that can currently fail asynchronously.
- Four screens (`HomeScreen`, `CalendarScreen`, `InsightsScreen`, `SettingsScreen`) use the same defensive `return null` pattern when `profile` is absent, with no shared "no profile" empty-state component — a candidate for consolidation if this branch is ever reached in practice (see `04-user-flows.md` edge cases).
- Entrance-animation durations vary screen-to-screen (300/340/360/380ms) without referencing the shared `duration` token in `src/theme/motion.ts`, which exists but has zero consumers — see `08-motion-interaction-audit.md`.

## Files reviewed
All files listed in `04-user-flows.md` plus `13-technical-debt.md`'s large-file line counts.
