# Cadence Lab Astro 7

Cadence Lab is an Astro 7 website with TinaCMS-backed content editing, Astro Content Collections, Tailwind CSS, local web fonts, and statically generated routes.

The project supports:

- Markdown-based blog posts and page content
- Local TinaCMS visual editing
- TinaCloud integration
- Date-based blog URLs
- Local Graphik and Tiempos web fonts
- TypeScript validation
- Static Astro builds with the Node adapter

## Tech stack

- [Astro](https://docs.astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [TinaCMS](https://tina.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- Astro Content Collections
- Node.js adapter
- npm

## Requirements

- Node.js 22.23.4 or newer (Astro 7.4 refuses to run on older versions)
- npm

Check the installed versions:

```sh
node --version
npm --version
```

Use the version defined by `.nvmrc` when that file is present:

```sh
nvm use
```

## Local setup

Clone the repository and enter the project directory:

```sh
git clone https://github.com/matt-rabah/cadencelab-astro7.git
cd cadencelab-astro7
```

Install dependencies:

```sh
npm install
```

Create a local environment file:

```sh
cp .env.example .env
```

Add the required TinaCMS values to `.env`:

```dotenv
NEXT_PUBLIC_TINA_CLIENT_ID=
TINA_READ_ONLY_TOKEN=
TINA_SEARCH_TOKEN=
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Do not commit `.env` or expose Tina tokens publicly.

## Development

Start TinaCMS and Astro together:

```sh
npm run dev
```

The local site is available at:

```text
http://localhost:4321
```

The TinaCMS admin is available at:

```text
http://localhost:4321/admin/index.html
```

The local Tina GraphQL API is available at:

```text
http://localhost:4001/graphql
```

When Tina displays **local mode**, content changes are written directly to the Markdown files in the local repository.

## Editor MCP servers

The repository defines its MCP servers once, in `mcp_config.json`. That file uses the Windsurf / Antigravity format, where each remote server has a `serverUrl`.

| Server | Use it for |
| --- | --- |
| `cloudflare`, `cloudflare-docs`, `cloudflare-bindings`, `cloudflare-builds`, `cloudflare-observability` | Cloudflare account, docs, bindings, builds, and logs |
| `astro-docs` | Searching the current Astro documentation |
| `mdn` | MDN web docs and browser compatibility (Baseline) data. MDN describes this server as experimental. |

`AGENTS.md` ("Reference sources") tells coding agents which server to use for which question.

Editor-specific copies are generated from it. Do not edit them by hand:

| File | Editor | Format |
| --- | --- | --- |
| `mcp_config.json` | Windsurf, Antigravity (source of truth) | `mcpServers` → `serverUrl` |
| `.vscode/mcp.json` | VS Code | `servers` → `type: "http"`, `url` |
| `.cursor/mcp.json` | Cursor | `mcpServers` → `url` |

VS Code and Cursor load their file from the workspace automatically. Windsurf and Antigravity read a global config rather than the repository, so copy the servers from `mcp_config.json` into that file (for Windsurf, `~/.codeium/windsurf/mcp_config.json`).

Claude Code and Codex keep MCP servers in your user settings, not in this repository. Add the documentation servers once per machine.

Claude Code:

```sh
claude mcp add --transport http --scope user astro-docs https://mcp.docs.astro.build/mcp
claude mcp add --transport http --scope user mdn https://mcp.mdn.mozilla.net/
claude mcp list
```

Codex:

```sh
codex mcp add astro-docs --url https://mcp.docs.astro.build/mcp
codex mcp add mdn --url https://mcp.mdn.mozilla.net/
```

Use `--scope user` for Claude Code. Do not use `--scope project`, which writes a `.mcp.json` file outside the `mcp_config.json` workflow.

After changing `mcp_config.json`, regenerate the editor files:

```sh
npm run mcp:sync
```

Check that the generated files are current:

```sh
npm run mcp:check
```

## Project structure

```text
/
├── .vscode/                    # VS Code workspace settings
│
├── public/
│   ├── admin/                  # Generated TinaCMS admin application
│   ├── fonts/                  # Local Graphik and Tiempos web fonts
│   ├── uploads/                # Tina-managed media
│   └── favicon.svg
│
├── src/
│   ├── assets/                 # Assets imported by Astro components
│   │
│   ├── components/             # Reusable Astro components
│   │   ├── NavHeader.astro
│   │   ├── Footer.astro
│   │   └── ...
│   │
│   ├── content/
│   │   ├── blog/               # Blog post Markdown files
│   │   └── pages/              # Tina-managed page Markdown files
│   │
│   ├── layouts/
│   │   └── Layout.astro        # Shared site layout
│   │
│   ├── lib/
│   │   └── tina/
│   │       ├── data.ts         # Tina data helpers
│   │       └── islands.ts      # Tina island registration
│   │
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [year]/
│   │   │       └── [month]/
│   │   │           └── [slug].astro
│   │   │
│   │   ├── tina-island/
│   │   │   └── [name].ts
│   │   │
│   │   ├── [...slug].astro
│   │   ├── fit-check.astro
│   │   ├── index.astro
│   │   └── thanks.astro
│   │
│   ├── styles/                 # Global and feature-level CSS
│   │
│   └── content.config.ts       # Astro content collection schemas
│
├── tina/
│   ├── __generated__/          # Generated Tina client and TypeScript types
│   ├── config.ts               # TinaCMS collections and configuration
│   └── tina-lock.json
│
├── .env.example                # Environment variable template
├── .gitignore
├── AGENTS.md                   # Repository instructions for coding agents
├── astro.config.mjs            # Astro integrations and build configuration
├── CLAUDE.md                   # Claude project instructions
├── package-lock.json
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

The project must have only one application root. There should not be another complete `cadencelab-astro7/` project directory nested inside this repository.

## Generated directories

The following directories are generated locally and are not maintained as source code:

```text
.astro/
dist/
node_modules/
tina/__generated__/.cache/
```

Their purposes are:

| Directory | Purpose |
| --- | --- |
| `.astro/` | Astro-generated metadata and types |
| `dist/` | Production build output |
| `node_modules/` | Installed npm packages |
| `tina/__generated__/` | Tina GraphQL client and TypeScript types |
| `tina/__generated__/.cache/` | Temporary Tina build cache |
| `public/admin/` | Generated TinaCMS admin application |

Do not manually edit generated cache files.

## Content model

### Blog posts

Blog posts are stored in:

```text
src/content/blog/
```

Each Markdown filename becomes the URL slug.

For example:

```text
src/content/blog/adoption-fatigue.md
```

may generate:

```text
/blog/2026/06/adoption-fatigue/
```

Blog URLs use this pattern:

```text
/blog/YYYY/MM/slug/
```

The year and month are derived from the post’s `date` field.

Because the URL comes from `date` and the filename, changing either after a post is published changes its URL. When that happens, add the old URL to the post's **Previous URLs** field in Tina (`redirectFrom` in frontmatter):

```yaml
redirectFrom:
  - /blog/2026/05/adoption-fatigue/
```

Each previous URL becomes a permanent (301) redirect to the current URL. The build adds these rules to `dist/_redirects` (see `src/pages/blog-redirects.txt.ts` and the `blog-redirects` step in `astro.config.mjs`). The build fails if a previous URL is a live post URL or is listed on two posts. To correct a typo in a date, prefer `updatedDate` for revisions and only change `date` when the original was wrong.

A typical blog post contains frontmatter similar to:

```yaml
---
title: The Hidden Operational Cost of User Adoption Fatigue
subtitle: An investigation into workflow friction and enterprise adoption.
date: 2026-06-23
readTime: 9 min read
category: Advisory
---
```

The shared article route is:

```text
src/pages/blog/[year]/[month]/[slug].astro
```

That file controls the layout, typography, metadata, and Markdown rendering for individual posts.

The blog index is:

```text
src/pages/blog/index.astro
```

### Pages

Tina-managed page content is stored in:

```text
src/content/pages/
```

The catch-all page route is:

```text
src/pages/[...slug].astro
```

## TinaCMS

The TinaCMS configuration is defined in:

```text
tina/config.ts
```

It defines:

- Content collections
- Editable fields
- Blog routing
- Page routing
- Media configuration
- TinaCloud connection settings
- Optional search configuration

The generated Tina client and types are stored in:

```text
tina/__generated__/
```

To regenerate Tina files during development, restart the development server:

```sh
npm run dev
```

To regenerate them during a production build:

```sh
npm run build
```

### Local editing

Open:

```text
http://localhost:4321/admin/index.html
```

In local mode, Tina edits files directly in:

```text
src/content/
```

After saving an edit, verify the change with:

```sh
git status
git diff
```

### TinaCloud editing

For TinaCloud editing, the deployed site must have the required environment variables configured.

The deployed admin route is:

```text
https://your-domain.example/admin/index.html
```

Cloud-connected saves can create commits in the linked GitHub repository.

## Environment variables

The project uses these environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_TINA_CLIENT_ID` | Connects the Tina admin to the TinaCloud project |
| `TINA_READ_ONLY_TOKEN` | Provides read-only TinaCloud access during server-side builds |
| `TINA_SEARCH_TOKEN` | Provides Tina search indexing access |
| `PUBLIC_TURNSTILE_SITE_KEY` | Renders the public Turnstile widget on the Fit Check form |
| `TURNSTILE_SECRET_KEY` | Verifies Fit Check Turnstile tokens in the Pages Function |

Example:

```dotenv
NEXT_PUBLIC_TINA_CLIENT_ID=your_client_id
TINA_READ_ONLY_TOKEN=your_read_only_token
TINA_SEARCH_TOKEN=your_search_token
PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
```

Never commit real token values.

The project may temporarily support an older `TINA_CLIENT_ID` variable for compatibility, but `NEXT_PUBLIC_TINA_CLIENT_ID` is the preferred name for the browser-based Tina admin.

## Fonts

Local web fonts are stored under:

```text
public/fonts/
```

The project uses Graphik and Tiempos font files configured through Astro.

Font registration and paths are managed in:

```text
astro.config.mjs
```

Global font variables and typography rules are managed under:

```text
src/styles/
```

Use the existing font variables in components instead of hardcoding font-family names repeatedly.

## Routing

Astro routes are defined by files in:

```text
src/pages/
```

Key routes include:

| Source file | URL |
| --- | --- |
| `src/pages/index.astro` | `/` |
| `src/pages/blog/index.astro` | `/blog/` |
| `src/pages/blog/[year]/[month]/[slug].astro` | `/blog/YYYY/MM/slug/` |
| `src/pages/fit-check.astro` | `/fit-check/` |
| `src/pages/thanks.astro` | `/thanks/` |
| `src/pages/[...slug].astro` | Dynamic page routes |
| `src/pages/tina-island/[name].ts` | Tina island endpoint |

## Styling

Global and reusable styles are stored in:

```text
src/styles/
```

Page-specific styles may also exist inside Astro components.

For reusable blog typography and layout, prefer a dedicated stylesheet such as:

```text
src/styles/article.css
```

Reusable article components should be placed under:

```text
src/components/blog/
```

Potential article components include:

```text
ArticleHeader.astro
ArticleSidebar.astro
ArticleToc.astro
ArticleTags.astro
AuthorBio.astro
RelatedPosts.astro
```

## TypeScript validation

Run the TypeScript compiler without emitting files:

```sh
npx tsc --noEmit
```

This command should complete without errors before changes are committed.

## Production build

Build TinaCMS and Astro:

```sh
npm run build
```

The production build is written to:

```text
dist/
```

A successful build should:

1. Generate the Tina admin
2. Generate Tina GraphQL types and client files
3. Sync Astro content collections
4. Build server entrypoints
5. Prerender static routes
6. Finish without TypeScript or routing errors

## Commands

All commands are run from the project root.

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start TinaCMS and Astro locally |
| `npm run build` | Build TinaCMS and the Astro site |
| `npm run preview` | Preview the production build locally |
| `npx tsc --noEmit` | Run TypeScript validation |
| `npm run format -- <path>` | Format an explicit file or directory with Prettier |
| `npm run format:check -- <path>` | Check an explicit file or directory without changing it |
| `npm run mcp:sync` | Regenerate editor MCP configs from `mcp_config.json` |
| `npm run mcp:check` | Fail if generated editor MCP configs are out of date |
| `npm run astro -- --help` | Display Astro CLI help |
| `git status` | Show repository changes |
| `git diff` | Review unstaged changes |
| `git diff --cached` | Review staged changes |

## Git workflow

Do not make feature work directly on `main`.

Update the local `main` branch:

```sh
git switch main
git pull origin main
```

Create a feature branch:

```sh
git switch -c feature/branch-name
```

Examples:

```sh
git switch -c feature/blog-layout
git switch -c fix/tina-routing
git switch -c cleanup/project-structure
```

Validate changes before committing:

```sh
npx tsc --noEmit
npm run build
```

Review the changes:

```sh
git status
git diff
```

Stage and commit:

```sh
git add -A
git commit -m "Describe the change"
```

Push the branch:

```sh
git push -u origin feature/branch-name
```

Open a pull request into `main`.

For branches whose history has intentionally been rewritten, use:

```sh
git push --force-with-lease origin branch-name
```

Do not use a plain `--force` push.

## Pull requests

Before merging a pull request:

- Confirm the changed files match the intended scope
- Confirm no nested duplicate project was introduced
- Confirm no environment tokens were committed
- Run `npx tsc --noEmit`
- Run `npm run build`
- Review the **Files changed** tab
- Resolve all conflicts
- Prefer **Squash and merge** for cleanup branches with multiple intermediate commits

## Security

Do not commit:

- `.env`
- Tina tokens
- API keys
- private credentials
- generated secrets
- private font license files
- temporary exports or backups

If a token is exposed in a screenshot, commit, chat, or public repository, rotate it.

## Troubleshooting

### Tina admin opens in local mode

This is expected when running:

```sh
npm run dev
```

Local mode edits Markdown files directly.

### Tina preview returns a dated blog 404

Confirm that the date in the Markdown frontmatter matches the generated route.

For example:

```yaml
date: 2026-06-26
```

should generate:

```text
/blog/2026/06/slug/
```

Restart the development server after changing Tina routing configuration.

### Tina form fields do not appear

The preview page may be rendering without contextual editing metadata.

Check:

```text
src/lib/tina/data.ts
src/lib/tina/islands.ts
src/pages/tina-island/[name].ts
```

Also confirm that the page uses the Tina-aware data and island workflow.

### Stale TypeScript configuration warning

Remove generated Tina cache files:

```sh
rm -rf tina/__generated__/.cache
```

Then reload VS Code.

Confirm that only the root TypeScript configuration exists:

```sh
find . -name tsconfig.json \
  -not -path "./node_modules/*" \
  -not -path "./.git/*"
```

Expected result:

```text
./tsconfig.json
```

### React Router future flag warnings

React Router warnings displayed inside the Tina admin are emitted by TinaCMS dependencies.

They are informational unless Tina navigation or routing stops working.

### Node `DEP0190` warning

A warning similar to this may appear when Tina launches Astro:

```text
[DEP0190] DeprecationWarning
```

It does not normally prevent the development server or build from running.

## Documentation

FitCheck submissions are reviewed manually. Use the [FitCheck Decision Brief method and reply template](docs/fitcheck-decision-brief.md) to deliver the free email brief. The optional automated answer receipt is separate from the assessment.

- [Astro documentation](https://docs.astro.build/)
- [Astro project structure](https://docs.astro.build/en/basics/project-structure/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [TinaCMS documentation](https://tina.io/docs/)
- [TinaCMS with Astro](https://tina.io/docs/frameworks/astro/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
