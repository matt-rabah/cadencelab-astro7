# DIY Markdown for Agents: Project Master Plan

This is the integrated, project-specific plan for building a free-tier equivalent of Cloudflare's paid Markdown for Agents feature for the Cadence Lab Astro/Tina codebase.

This is not a set of unrelated examples. The six files in this folder are sequential stages of one production system.

## Project goal

Deliver a custom Cloudflare Worker and static build pipeline that does the following:

- detects `Accept: text/markdown` requests at the edge
- serves Markdown only for agent-like requests
- keeps standard browser requests on normal HTML
- preserves cache correctness with `Vary: Accept`
- keeps token counts efficient by serving plain, cleaned Markdown instead of heavy HTML output
- publishes the required auth metadata for agent discovery
- runs automatically through CI/CD for future content updates

## Project-specific constraints for this repo

This repository is built on:

- Astro 7 static output
- TinaCMS-managed content in `src/content/blog` and `src/content/pages`
- nested blog routes under `/blog/[year]/[month]/[slug]`
- marketing pages generated from Tina-managed content
- Cloudflare Worker deployment through Wrangler

Because of that, the architecture must be built around:

- a static build that emits both HTML and agent-optimized Markdown artifacts
- a Worker that routes Markdown requests to the generated artifact path before falling back to HTML
- project-specific route mapping for blogs and catch-all marketing pages
- auth metadata files under `public/.well-known/` and `public/auth.md`
- automation in CI so future content changes stay in compliance without manual edits

## Overall architecture

1. Build the normal Astro site as HTML.
2. Generate Markdown equivalents for each route during the build.
3. Store generated Markdown under a dedicated folder such as `.agent-md` or `/markdown`.
4. In the Worker, detect Markdown requests and resolve the matching generated file.
5. Return Markdown with the correct headers:
   - `Content-Type: text/markdown; charset=utf-8`
   - `Vary: Accept`
   - `Content-Signal`
   - `X-Markdown-Tokens`
6. Preserve the HTML site for normal browser traffic.
7. Publish auth metadata so agent discovery works with the correct `agent_auth` structure.
8. Automate the build-and-deploy workflow through GitHub Actions.

## Why this is the correct implementation strategy

The goal is not to recreate the paid product literally. The goal is to match the same essential behavior pattern that the native Cloudflare feature provides:

- content negotiation
- output-format switching based on `Accept` headers
- cache safety via `Vary: Accept`
- efficient Markdown payloads for agents
- complete metadata for agent registration and discovery

That means the repository should favor build-time generation and correct HTTP behavior over heavier runtime conversion tricks.

## Step sequence

1. Overview and Worker strategy
2. Astro project integration
3. Blog route integration
4. TinaCMS page integration
5. Auth metadata and deployment automation
6. Final validation and hardening

Each file below is a stage in the same implementation, not a standalone tutorial.

## Implementation priority order

1. Worker-based content negotiation
2. Build-time Markdown generation for Astro pages and blog routes
3. TinaCMS page coverage
4. Auth metadata publication
5. CI/CD automation
6. Final validation, route checks, and hardening

## Critical project decisions

- Prefer generated Markdown artifacts over on-the-fly HTML stripping when possible.
- Keep the Worker as a routing and negotiation layer, not as a full HTML parser for every request.
- Avoid speculative or unstable features that do not improve reliability for this repo.
- Keep changes aligned with the actual current project structure, especially the nested blog routes and static output build.
- Treat security and bot filtering as optional hardening, not as the core parity layer.

## Final success condition

The final result is considered successful only when:

- browser requests still get HTML
- agent requests with `Accept: text/markdown` get Markdown
- `Vary: Accept` is present
- required metadata is served from the correct public URLs
- the project builds cleanly and deploys without route regressions
