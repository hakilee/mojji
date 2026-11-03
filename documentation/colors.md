# Color ownership

The core palette and semantic names come from the pinned meki.gg theme in [design-system-source.json](design-system-source.json). `src/styles/tailwind.css` owns the actual values; [design-system.md](design-system.md) explains component usage.

| Role                    | Token/value                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| Primary/text            | primary / text-primary = neutral-950                                   |
| Secondary text          | text-secondary = neutral-700                                           |
| Tertiary text           | text-tertiary = neutral-500                                            |
| Black action            | neutral-900; hover neutral-700                                         |
| Page background         | background = rgb(246,247,249)                                          |
| Surface                 | white; neutral-50 weak surface                                         |
| Border/divider          | divider = neutral-200                                                  |
| Legacy semantic names   | fg/bg/stroke aliases resolve to these core tokens                      |
| Error / success         | fg-critical #bb3041 / fg-positive #216b51 (editor feedback extensions) |
| Canvas guide            | stroke-guide #ff2ba6 (editor content geometry)                         |
| Slack selected reaction | fg/stroke-reaction #0968a8, bg-reaction #e3f5fc                        |
| Inspection checkerboard | bg-checker-base #f7f8f9, tile #eeeff1                                  |

User text/gradient/character/background colors are document content, not UI tokens. Brand assets and font specimen rendering remain independent. No UI theme changes are written into exported GIF pixels.
