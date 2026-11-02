# UI implementation review

Loading, composition, transitions, writing and accessibility review.

## 1. React best practices

- src/components/editor/FontPicker.tsx:1 - static catalog import moved to on-demand import with loading, error and retry behavior; deferred search keeps input immediate.
- src/pages/EditorPage.tsx:1 - static preview no longer schedules continuous frames; reduced-motion changes update live and listeners clean up.

## 2. Composition patterns

- src/components/ui/SettingGroup.tsx:1 - three real consumers share a semantic fieldset/legend wrapper through children, without boolean variant props.
- Existing explicit font/settings callbacks remain appropriate. No provider or compound-component framework is needed for this one-screen app.

## 3. React view transitions

- src/components/editor/FontPicker.tsx:1 - disclosure enter/exit, asynchronous catalog reveal and keyed result identity use React transitions.
- Route audit: `/` only, logo links to `/`; no detail route, shared-element pair or Suspense boundary. Those patterns do not apply. Root snapshots are disabled so persistent chrome and canvas remain live.
- src/styles/tailwind.css:1 - opacity transitions, short timing, pointer pass-through and reduced-motion override.

## 4. Writing guidelines

- README.md:1 - descriptive links replace bare URLs; feature/navigation lists gain introductions; units and paragraph structure clarified.
- documentation/design-system.md:1 - reference purpose, font-loading behavior, motion behavior and technical terms clarified.
- Docs-site metadata, Vercel-team pings and MDX Steps are not applicable to this Markdown project. User authorization to complete work governs delivery; no new approval flow is introduced.

## 5. Web design guidelines

- src/pages/EditorPage.tsx:1 - skip link, main focus target, input name/autocomplete, hidden decorative symbols and functional reaction update.
- src/components/editor/FontPicker.tsx:1 - disclosure relationship, search example/name/autocomplete/spellcheck, busy and empty/loading feedback.
- src/styles/tailwind.css:1 - touch manipulation, contained result scrolling, tabular numbers and balanced headings.
- Explicit user requirements take precedence: do not restore playback controls or put private editor content in URLs. Existing invalid-input download blocking remains the product contract. No speculative navigation guard, theme or third-party UI library added.

Verification evidence and remaining gaps belong to the issue-linked pull request. Existing renderer tests cover GIF behavior; browser checks cover catalog loading, transitions, search, export and responsive layout.

## Browser-driven correction

Full-button ViewTransition boundaries made font-result clicks unreliable in Aside after filtering. Boundaries now animate the result labels while the buttons remain live. The corrected flow passed: catalog requests 0 before opening and 1 after opening, Gaegu selected, gradient GIF downloaded, and mobile layout retained. The renderer suite still has 34 passing tests. Unsupported-browser and actual OS preference toggling are not claimed as tested.
