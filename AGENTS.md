# Dialuna Agent Guide

## Project Overview

Dialuna is an Expo React Native app using Expo Router, strict TypeScript, Zustand stores, Vitest tests, localized `en`/`vi` copy, and a refined lunar wellness visual system.

Codex agents working in this repo should read `package.json`, `app.json`, `tsconfig.json`, and the relevant source files before making implementation assumptions.

## Stack

- Package manager: npm, based on `package-lock.json`
- Expo: `~57.0.2`
- React Native: `0.86.0`
- React: `19.2.3`
- Routing: Expo Router with typed routes enabled
- State: Zustand stores under `src/store`
- Tests: Vitest under `src/**/*.test.ts`
- Styling: React Native `StyleSheet` plus theme tokens under `src/theme`
- Localization: i18next resources under `src/i18n/en.json` and `src/i18n/vi.json`

## Source Map

- `src/app`: Expo Router route entries and layouts
- `src/app/(tabs)`: main tab route shells
- `src/features`: screen-level feature implementations
- `src/components/ui`: shared UI primitives
- `src/components/cycle`: cycle-specific UI components
- `src/components/ai`: AI chat components
- `src/components/mascot`: Luna mascot components
- `src/components/paywall`: premium/paywall components
- `src/services`: domain engines and business logic
- `src/store`: app state
- `src/theme`: colors, typography, spacing, radius, shadows, motion
- `src/types`: shared domain types
- `docs/superpowers`: existing design specs and implementation plans

## Operating Rules

- Preserve existing business logic, user flows, navigation behavior, and localized content.
- Make the smallest safe change required by the task.
- Prefer existing components, stores, hooks, services, and theme tokens.
- Avoid unrelated refactors, formatting churn, dependency upgrades, and generated output.
- Treat `ios/` and `android/` as generated/ignored unless the user explicitly asks for native work.
- Do not modify `.claude/settings.local.json`; it is local personal configuration.
- Do not discard or overwrite uncommitted user changes.

## Required Workflow

Before editing:

1. Inspect `git status --short`.
2. Read `package.json`, `app.json`, and files directly involved in the task.
3. Search for existing patterns before introducing new components or helpers.
4. Identify whether the task affects localization, navigation, persisted state, design tokens, tests, or Expo native config.
5. For non-trivial work, state the implementation plan and expected files to change.

During implementation:

1. Keep changes scoped to the requested behavior.
2. Preserve public interfaces unless the task requires changing them.
3. Avoid `any`, broad type assertions, suppressed TypeScript errors, and silent error swallowing.
4. Do not add a dependency unless it is clearly necessary.
5. Do not edit generated files.

After implementation:

1. Run the narrowest useful validation first.
2. Use the project scripts listed below.
3. Run `git diff --check` when files changed.
4. Review the final diff before declaring completion.
5. Report changed files, validation, and anything not verified.

## Validation Commands

- TypeScript: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm test`
- Single Vitest file: `npx vitest run path/to/file.test.ts`
- Start Expo: `npm run start`
- iOS dev build: `npm run ios`
- Android dev build: `npm run android`
- Web: `npm run web`

Do not claim a command passed unless it was actually run successfully.

## Architecture Rules

- Route files in `src/app` should stay thin and delegate real screens to `src/features`.
- Business logic belongs in `src/services`, stores, hooks, or typed helpers, not visual components.
- Shared UI belongs in `src/components/ui` only when it is genuinely reused.
- Reuse domain engines in `src/services` instead of duplicating cycle, hormone, insights, or AI-coach calculations.
- Avoid duplicating the same source of truth in component state and Zustand.

## UI And Localization Rules

- Use existing theme primitives from `src/theme` before adding visual constants.
- Avoid hardcoded colors, spacing, radii, font sizes, and shadows unless narrowly justified.
- Preserve Dialuna's refined lunar wellness identity and clear hierarchy.
- Do not replace established screen composition with generic stacked cards unless requested.
- Respect safe areas, keyboard behavior, content growth, small-device layouts, and accessible touch targets.
- User-visible strings should use the existing i18n setup.
- When adding or changing copy, update both `src/i18n/en.json` and `src/i18n/vi.json`.

## Navigation, Async, And Store Rules

- Use Expo Router conventions and typed routes.
- Prevent duplicate navigation from rapid taps where relevant.
- Preserve Android back behavior and modal/sheet dismissal behavior.
- Handle loading, success, empty, and failure states where async work is introduced.
- Prevent duplicate submissions for mutation flows.
- Ignore or cancel stale async results when screens can unmount or inputs can change.
- Do not log secrets, tokens, personal health data, OTPs, or raw user identifiers.
- Be conservative with persisted-store migrations and default values.

## Expo And Native Rules

- Expo config is the source of truth for native behavior in this repo.
- Do not run `expo prebuild --clean` unless explicitly approved.
- Prefer Expo config/plugins for persistent native configuration.
- State clearly when a change requires rebuilding a development client.
- Do not modify bundle IDs, app schemes, splash config, icons, signing, Gradle, CocoaPods, or deployment targets unless the task requires it.

## Git Rules

- Never use `git reset --hard`.
- Never discard uncommitted user changes.
- Never force-push.
- Do not commit unless explicitly requested.
- Do not modify unrelated files.
- Always inspect the final diff before declaring completion.

## Definition Of Done

- The requested behavior is implemented.
- Existing behavior outside the requested scope is preserved.
- Localization, theme, navigation, and platform implications are reviewed.
- TypeScript, lint, and relevant tests pass, or limitations are clearly reported.
- The final diff contains no unrelated changes.
