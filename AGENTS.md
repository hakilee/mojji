# Agent map

Read [workflow](documentation/workflow.md), [quality](documentation/quality.md), and the relevant [spec](specs/editor.md) before editing. GitHub issues own scope and delivery evidence; specs own product contracts. Research owns decisions and sources, not current behavior.

Use Aside CLI for browser tests. Do not substitute another browser automation tool. Use existing platform capabilities and dependencies; avoid speculative abstractions and test hooks. Keep TypeScript tests beside their owners and use standard Vitest lifecycle cleanup. Do not weaken lint or types to pass checks.

No GitHub Actions. Run `yarn verify` locally and preserve failures/gaps. Use feature branches, issue-linked PRs and squash merges. Never push directly to a protected branch. Do not commit credentials, generated artifacts or personal data.
