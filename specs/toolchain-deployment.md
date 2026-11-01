# Local toolchain and production deployment

Owner: GitHub issue #3.

- T1: All direct packages, TypeScript, Yarn and the installed Vercel CLI use their current stable registry releases at delivery. Keep an immutable lockfile; do not retain compatibility-only pins or force peer ranges.
- T2: oxlint replaces ESLint, and oxfmt replaces Prettier. Remove obsolete dependencies/configuration; retain correctness, TypeScript and React hooks/refresh checks through supported Oxc rules. Formatting and lint errors fail local hooks.
- T3: `yarn verify` checks formatting, lint, source/test types, all Vitest tests and production build. Husky keeps the same gates. No GitHub Actions or hosted build/test pipeline.
- D1: Publish locally built static output using Vercel CLI to the confirmed slackmoji project and `slackmoji.haklee.me`. Do not transfer domains, change nameservers or affect unrelated DNS records. Authentication may use the user's authorized Aside session.
- D2: Deploy only the verified merged commit. Confirm Vercel READY state, intended project/team, public HTTPS response and custom-domain assignment. Verify editing and GIF download through Aside. Record commit and evidence on the issue/PR.

Version evidence: compare package manifest/lockfile with npm stable tags. Toolchain evidence: immutable install and complete local verification. Deployment evidence: CLI inspect, domain verification and production browser checks. Credentials and `.vercel` state must not enter Git.
