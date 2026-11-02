# UI color tokens

Issue #19. No SEED package/runtime dependency is installed.

## Sources

- [SEED palette](https://seed-design.io/foundations/color/palette)
- [SEED roles](https://seed-design.io/foundations/color/color-role): foreground/background/stroke, role and state separation.
- [Pinned upstream](https://github.com/daangn/seed-design/tree/94b46349675a04bf445aa50265a42c0fd1b3a033), checked 2026-11-02. Palette values copied as a small light-theme subset, not a complete or automatically synchronized SEED theme.
- Upstream license and attribution retained in [LICENSE](licenses/seed-design-LICENSE) and [NOTICE](licenses/seed-design-NOTICE). No Daangn logo/character assets copied.

## Ownership and use

`src/colors.css` is the UI source of truth: `--palette-*` holds upstream values; app-owned `--color-{fg|bg|stroke}-*` aliases define meaning. Component CSS consumes semantic aliases only. Change a semantic mapping to adjust a role globally; do not add one-off hex colors to component rules.

| Role                              | Palette                 | Consumers                              |
| --------------------------------- | ----------------------- | -------------------------------------- |
| Layer basement / default          | gray-200 / gray-00      | Page / panels                          |
| Neutral weak / pressed            | gray-100 / gray-300     | Fields, toggle / interaction           |
| Neutral / muted foreground        | gray-1000 / gray-800    | Main / secondary text                  |
| Brand solid / pressed             | purple-800 / purple-900 | Download button                        |
| Brand weak / pressed              | purple-100 / purple-200 | Selected options                       |
| Brand foreground / stroke / focus | purple-800              | Selected text, borders, keyboard focus |
| On brand solid                    | gray-00                 | Download text                          |
| Positive weak / foreground        | green-100 / green-800   | Message avatar                         |
| Critical foreground               | red-800                 | Validation errors                      |
| Neutral / strong stroke           | gray-400 / gray-500     | Dividers, controls                     |
| Disabled background / foreground  | gray-200 / gray-800     | Unavailable download                   |
| Checker base / tile               | gray-100 / gray-300     | Transparency visualization             |

Purple is a Slackmochi mapping, not SEED's default carrot brand mapping. Secondary small text intentionally uses gray-800 for readability. This is a light-only UI; no dark theme is introduced. Typography/layout and icon artwork remain unchanged.

GIF colors (`Settings.color`, background and per-character overrides) are user-created content, not UI theme roles. Their defaults remain unchanged to avoid silently altering exports. Logo SVGs and opaque platform-icon/manifest backgrounds retain their existing brand-art colors independently of the page background.
