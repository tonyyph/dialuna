Review the current Dialuna git diff as a senior React Native reviewer.

Focus on:

- business-logic regressions
- cycle, hormone, insights, AI coach, paywall, onboarding, and settings behavior
- localization coverage for `en` and `vi`
- theme-token usage versus hardcoded visuals
- navigation and duplicate navigation
- stale closures and incorrect hook dependencies
- async race conditions and duplicate submissions
- persisted store compatibility
- TypeScript safety and null handling
- list and render performance
- accessibility
- iOS, Android, and web implications
- secrets or sensitive logging
- unintended dependency or native-config changes

Rank findings:

- Critical
- High
- Medium
- Low

For every finding include:

- file and location
- why it is a problem
- reproduction scenario
- recommended fix

Do not edit code unless explicitly requested.
