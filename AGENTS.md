# AGENTS.md

This file provides project-specific instructions for AI coding agents working in this repository.

## Project overview

This repository contains the Cadence Lab website.

The project uses:

- Astro 7
- TypeScript
- TinaCMS
- Astro Content Collections
- Tailwind CSS
- Local Graphik and Tiempos web fonts
- npm
- Node.js 22.23.4 or newer

The repository has a single application root.

Do not create or restore another nested project directory such as:

```text
cadencelab-astro7/cadencelab-astro7/
```

## Repository root

Work from the repository root:

```text
/Users/mattrabah/Downloads/cadencelab-astro7
```

Before making changes, confirm the current directory:

```sh
pwd
git rev-parse --show-toplevel
```

Both should resolve to the repository root above.

## Package manager

Use npm.

Do not introduce pnpm, Yarn, Bun, or another package manager unless explicitly requested.

Use:

```sh
npm install
npm run dev
npm run build
```

Do not add a `pnpm-workspace.yaml` file.

Do not replace `package-lock.json` with another lockfile.

## Development server

Start TinaCMS and Astro together with:

```sh
npm run dev
```

The local site runs at:

```text
http://localhost:4321
```

The TinaCMS admin runs at:

```text
http://localhost:4321/admin/index.html
```

The local Tina GraphQL API runs at:

```text
http://localhost:4001/graphql
```

Do not start a separate plain `astro dev` process unless the task specifically requires isolating Astro from TinaCMS.

The `dev` script runs `astro dev --ignore-lock` on purpose. Astro moves `astro dev` to a background process when it detects an AI agent, and `tinacms dev` then shuts down the Tina GraphQL API because its child command exited. `--ignore-lock` keeps Astro in the foreground. Do not remove it.

## Project structure

The maintained source structure is:

```text
/
├── public/
│   ├── admin/
│   ├── fonts/
│   ├── uploads/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   │   ├── blog/
│   │   └── pages/
│   ├── layouts/
│   ├── lib/
│   │   └── tina/
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [year]/
│   │   │       └── [month]/
│   │   │           └── [slug].astro
│   │   ├── tina-island/
│   │   ├── [...slug].astro
│   │   ├── fit-check.astro
│   │   ├── index.astro
│   │   └── thanks.astro
│   ├── styles/
│   └── content.config.ts
│
├── tina/
│   ├── __generated__/
│   ├── config.ts
│   └── tina-lock.json
│
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tailwind.config.js
└── tsconfig.json
```

Generated directories include:

```text
.astro/
dist/
node_modules/
tina/__generated__/.cache/
```

Do not treat generated cache files as maintained source.

## TinaCMS

The Tina configuration is:

```text
tina/config.ts
```

The project uses these environment variables:

```text
NEXT_PUBLIC_TINA_CLIENT_ID
TINA_READ_ONLY_TOKEN
TINA_SEARCH_TOKEN
```

Do not expose Tina tokens in source files, logs, screenshots, pull-request descriptions, or committed environment files.

Do not add a runtime throw that breaks the browser-based Tina admin when a server-only token is unavailable in the browser bundle.

Preserve the working pattern where server-only tokens are conditionally included.

Do not add duplicate declarations for:

```text
clientId
token
searchToken
date
year
month
slug
```

Before finishing Tina-related changes, check for conflict markers:

```sh
rg -n '<<<<<<<|=======|>>>>>>>' tina/config.ts
```

Expected result: no output.

## Tina content paths

Blog posts are stored in:

```text
src/content/blog/
```

Tina-managed pages are stored in:

```text
src/content/pages/
```

Blog URLs use this structure:

```text
/blog/YYYY/MM/slug/
```

The year and month come from the post’s `date` field.

The shared blog route is:

```text
src/pages/blog/[year]/[month]/[slug].astro
```

Do not silently fall back to the current date when a post date is missing or invalid. That can generate incorrect preview routes.

If a post date cannot be resolved, route to a safe fallback such as:

```text
/blog/
```

## Astro content collections

Astro collection definitions are stored in:

```text
src/content.config.ts
```

Preserve existing collection names and content paths unless a deliberate migration is required.

Do not rename:

```text
blog
pages
```

without updating all related Tina schemas, Astro routes, queries, and content files.

## Tina islands

Tina integration helpers are stored under:

```text
src/lib/tina/
```

Relevant files include:

```text
src/lib/tina/data.ts
src/lib/tina/islands.ts
src/pages/tina-island/[name].ts
```

When implementing contextual editing, inspect the existing Tina data flow before creating new parallel helpers.

Do not duplicate island registration or create a second Tina integration architecture.

## Blog layout

The shared article layout is controlled by:

```text
src/pages/blog/[year]/[month]/[slug].astro
```

Reusable blog components should be added under:

```text
src/components/blog/
```

Suggested component names include:

```text
ArticleHeader.astro
ArticleSidebar.astro
ArticleToc.astro
ArticleTags.astro
AuthorBio.astro
RelatedPosts.astro
```

Reusable article CSS should be placed under:

```text
src/styles/
```

Prefer a dedicated file such as:

```text
src/styles/article.css
```

Do not duplicate large article style blocks across individual posts.

## Typography and fonts

Local fonts are stored under:

```text
public/fonts/
```

Font registration is handled in:

```text
astro.config.mjs
```

Use existing CSS custom properties and project font variables.

Do not hardcode repeated font-family stacks throughout components when an existing variable is available.

Do not rename or move font files without updating all matching paths in:

```text
astro.config.mjs
src/styles/
```

## Writing and voice

All site copy, form messages, emails, and FitCheck™ Decision Briefs follow:

```text
docs/voice.md
```

Read it before writing or editing any visible text. Key rules: first person
as Matt, contractions, no em dashes, no invented facts or numbers, every
statistic sourced on the page, and FitCheck™ spelled exactly that way.

## Styling conventions

`DESIGN.md` at the repository root is the design contract. Read section 0.1
(implemented decisions) before any visual change. In short:

- neutral paper and graphite (no brown or navy tint), never pure black blocks
- one action blue (`--color-blue`), the logo's yellow dot as the only accent
- Graphik for every role
- three tonal surface levels per theme; neighbouring areas always differ
- 4px controls, 8px panels, no pills, no shadows on static content
- sentence-case, muted labels; no forced uppercase or letter-spacing
- the Friction Trace as the signature diagram grammar

Avoid decorative gradients, glass blur, purple or lavender tints, per-card
accent colors, colored top borders, hover lift on cards, card walls where a
list or rows would do, and unrelated UI frameworks.

### Corners, borders, and depth

Use the design tokens in `src/styles/global.css`. Don't hard-code values.

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` / `--radius-md` | 4px | Buttons, inputs, chips, small panels |
| `--radius-lg` | 8px | Panels and the few real cards |
| `--color-surface` / `-subtle` / `-pure` | levels 0 / 1 / 2 | Page, inset sections and bands, paper panels |
| `--color-surface-anchor` | graphite | Header and footer, always the same |
| `--shadow-card` | hairline only | Resting cards (no ambient shadow) |
| `--shadow-overlay` | hairline + ambient | Menus, dialogs, popovers |
| `--shadow-hairline` | 1px ring only | A crisp edge without a border |

Best practices:

- **Crisp hairlines.** For a new card without a `border`, draw the edge with
  `box-shadow: var(--shadow-hairline)` (a `0 0 0 1px` ring). Unlike a
  `border`, it doesn't change the box size and stays sharp on low-DPI
  screens. Don't combine a 1px `border` and the hairline ring on one element.
- **Depth by tone.** Static content separates by surface level and rules.
  Only overlays (`--shadow-overlay`) get a blurred shadow; never colored.
- **No corner bleed.** A rounded container that holds images, colored
  headers, or full-bleed children needs `overflow: clip` (Baseline since
  2022) so nothing spills past the curve. Don't clip containers that hold
  menus, tooltips, or focus rings that must extend outside them.
- **Concentric corners.** A rounded element inside a rounded element with
  padding uses `border-radius: max(0px, calc(outer-radius - padding))` (or
  `--radius-inner`), so the gap stays even around the curve. See MDN:
  https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
- **Dark mode.** Shadows barely read on dark surfaces; rely on the hairline
  and surface contrast there.
- **Forced colors.** Shadows disappear in Windows high contrast mode, so any
  card that has no `border` needs `border: 1px solid CanvasText` inside
  `@media (forced-colors: active)`.

## TypeScript

Use strict TypeScript-compatible code.

Run:

```sh
npx tsc --noEmit
```

before considering a task complete.

Do not suppress project-wide errors by weakening `tsconfig.json`.

Avoid broad `any` casts. If a library exposes runtime properties that are missing from its public type, scope the cast to the smallest possible expression.

Example:

```ts
const rawDate = (document as any)._values?.date;
```

Do not cast the entire configuration object to `any`.

## Astro configuration

The Astro configuration is:

```text
astro.config.mjs
```

Preserve:

- Tina integration
- Tina admin development redirect
- Tailwind Vite integration
- local font configuration
- current adapter setup

Do not add duplicate integrations.

Do not remove `tinaAdminDevRedirect()` unless the admin routing workflow is intentionally replaced.

## Generated files

Do not manually edit files under:

```text
tina/__generated__/
public/admin/
dist/
.astro/
```

unless the task explicitly requires inspecting generated output.

If Tina cache state causes stale TypeScript errors, remove only the cache:

```sh
rm -rf tina/__generated__/.cache
```

Do not delete all generated Tina files unless regeneration is part of the task.

## Environment files

The real `.env` file must remain untracked.

Use `.env.example` for placeholders only.

Never place real values in:

```text
.env.example
README.md
AGENTS.md
source files
pull-request descriptions
```

If credentials appear in a screenshot, commit, or chat, recommend rotating them.

## Git workflow

Do not make feature changes directly on `main`.

Before starting work:

```sh
git switch main
git pull origin main
git switch -c feature/descriptive-name
```

Use clear branch prefixes:

```text
feature/
fix/
cleanup/
refactor/
```

Examples:

```text
feature/blog-layout
fix/tina-routing
cleanup/project-structure
refactor/article-components
```

Before committing:

```sh
git status
git diff
npx tsc --noEmit
npm run build
```

Then:

```sh
git add -A
git commit -m "Describe the change clearly"
git push -u origin branch-name
```

Do not push directly to `main`.

Do not use `git push --force`.

Use:

```sh
git push --force-with-lease
```

only when branch history was intentionally rewritten and the reason is understood.

## Merge and conflict handling

When resolving merge conflicts:

- inspect every conflicted file
- do not guess which side to keep
- verify that no duplicate project tree is restored
- check for unresolved conflict markers
- rerun validation after the merge

Use:

```sh
git status
rg -n '<<<<<<<|=======|>>>>>>>' .
```

Do not commit a merge while Git shows unexpected files such as an entire nested project being reintroduced.

If a merge restores files under:

```text
cadencelab-astro7/
```

inside the repository root, stop and reassess before committing.

## Pull requests

Before opening or merging a pull request:

- confirm the base branch is `main`
- confirm the compare branch is correct
- review the **Files changed** tab
- verify the change scope
- confirm no secrets are included
- confirm no nested duplicate project exists
- run TypeScript validation
- run the production build

Prefer **Squash and merge** for branches containing multiple intermediate cleanup or repair commits.

## Reference sources

Check current documentation before relying on memory. Use the source that matches the question:

| Question about                                                                          | Source                                                                               |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Astro APIs, configuration, content collections, endpoints, integrations, `security.csp` | Astro Docs MCP (`astro-docs`, tool `search_astro_docs`), or https://docs.astro.build |
| HTML, CSS, JavaScript, Web APIs, HTTP headers, accessibility, browser support           | MDN MCP (`mdn`), or https://developer.mozilla.org                                    |
| Cloudflare Pages, Workers, Zaraz, DNS, redirects, security settings                     | Cloudflare skills or https://developers.cloudflare.com                               |
| TinaCMS schema and editing                                                              | https://tina.io/docs                                                                 |
| Draft web standards not yet on MDN (for example WebMCP)                                 | The specification itself                                                             |

This project's Baseline target is Baseline Widely available. Use features
that have worked across all major browsers for at least 30 months; anything
newer needs a fallback or progressive enhancement. The Modern Web Guidance
skill reads this line, and `npx modern-web-guidance@latest legacy-scan src`
checks existing code for legacy patterns (it reported 0 findings on v1.0.0).

Rules:

- Before using a CSS, HTML, JavaScript, or HTTP feature that may be new or unevenly supported, check its browser compatibility and Baseline status on MDN. Note the result in the pull-request description.
- When an Astro API looks unfamiliar or may have changed between versions, search the Astro docs before writing code.
- Check how a setting is applied, not only what it means. Astro, Cloudflare, and Tina can change the output a standard describes (for example, listing any `scriptDirective.resources` entry replaces Astro's default `'self'` in `script-src`).
- Do not send secrets, tokens, or client details in documentation queries. These servers are remote services.
- If an MCP server is unavailable, fall back to the website it serves.
- Documentation does not replace validation. Run `npx tsc --noEmit` and `npm run build`, and test changed behaviour in a browser.

The servers are listed in `mcp_config.json`. See the README section "Editor MCP servers" for setup in each tool.

## Validation requirements

Every meaningful code change must pass:

```sh
npx tsc --noEmit
npm run build
```

A successful build should generate the expected blog routes, including:

```text
/blog/YYYY/MM/slug/
```

Do not report completion if either command fails.

## Dependency changes

Before changing dependencies:

- inspect the current `package.json`
- check the current lockfile
- confirm compatibility with Astro 7
- avoid unnecessary package additions
- avoid forced installations as a permanent fix

Do not run:

```sh
npm audit fix --force
```

Do not downgrade TinaCMS or Astro to silence a warning unless explicitly approved.

Do not add debugging libraries unless the existing browser console, Astro logs, Tina GraphQL playground, and build output are insufficient.

## Warnings

Treat warnings according to impact.

Informational warnings that do not block development may include:

- React Router future-flag warnings inside TinaCMS
- Node `DEP0190` warnings from the Tina CLI child process
- Tina local search indexing notices

Do not treat these as application failures unless they are accompanied by broken behavior.

Prioritize:

- TypeScript errors
- build errors
- route failures
- Tina configuration failures
- missing content
- broken editor behavior

## Documentation

Update `README.md` when changes affect:

- setup instructions
- project structure
- commands
- environment variables
- content paths
- routing
- deployment
- validation workflow

Keep `README.md` human-facing.

Keep `AGENTS.md` focused on operating rules for coding agents.

## Completion checklist

Before finishing a task:

1. Confirm the intended files changed.
2. Confirm no duplicate project directory was created.
3. Confirm no secrets were exposed.
4. Run:

   ```sh
   npx tsc --noEmit
   npm run build
   ```

5. Review:

   ```sh
   git status
   git diff
   ```

6. Summarize:
   - what changed
   - which files changed
   - validation performed
   - any remaining warnings or risks

Do not claim success unless the validation output supports it.
