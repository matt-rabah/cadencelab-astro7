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
- Node.js 22.12 or newer

The repository has a single application root.

Do not create or restore another nested project directory such as:

```text
cadencelab-astro7/cadencelab-astro7/
```

## Repository root

Work from the repository root:

```text
/Users/mattrabah/Library/Mobile Documents/com~apple~CloudDocs/cadencelab-astro7
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

## Styling conventions

Preserve the current Cadence Lab visual direction:

- clinical editorial presentation
- square or nearly square corners
- restrained use of color
- no unnecessary shadows
- strong typography hierarchy
- readable desktop and mobile layouts
- semantic HTML
- accessible focus states

Avoid generic SaaS styling, excessive rounded cards, decorative gradients, or unrelated UI frameworks unless explicitly requested.

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
