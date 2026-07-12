Generate a Git commit message based ONLY on the current staged or unstaged git diff.

Instructions:

1. Read the current git diff.
2. Do NOT modify any files.
3. Do NOT stage files.
4. Do NOT commit.
5. Do NOT push.
6. Ignore whitespace-only changes.
7. Group related changes into one logical summary.
8. If the diff contains unrelated changes, explicitly mention that multiple commits are recommended.

Output exactly in this format:

## Conventional Commit

<type>(<scope>): <summary>

## Description

- change 1
- change 2
- change 3

## Breaking Changes

None

## Suggested Commit

```text
<single line commit message>