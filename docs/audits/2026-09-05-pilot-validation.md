# Experience Foundations pilot validation

September 5, 2026. Branch: `feature/experience-foundations-pilot`. Validation recorded before commit and push, which the user subsequently authorized. No production publication or merge is included.

Preview: http://127.0.0.1:4321/product/experience-foundations/

## Finished change

- Pilot route copy reduced from approximately 1,427 to 841 words in rendered main markup (all optional content included; scripts/tags removed), about 41% shorter.
- Four original deliverables retained and moved ahead of process/supporting detail.
- Three problem examples, three numbered steps, three optional evidence tabs, two native disclosures, visible fit/exclusions and next step.
- Fewer card borders and shorter section spacing only in the opt-in presentation. Accurate related-link labels.
- Existing Astro tab behavior reused; optional underline styling added. No additional tabs package, React island, font, dependency or global navigation change.
- Source changes: `src/pages/product/experience-foundations/index.astro`, `src/components/StructuredCapabilityPage.astro`, `src/components/TabbedPanels.astro`. Audit files are under `docs/audits/`.

## Checks performed

| Check | Result |
| --- | --- |
| `npm run build` | Passed, 43 pages, expected `/blog/2026/06/adoption-fatigue/` route and sitemap generated. |
| `npm run astro -- check` | Passed: 98 files, 0 errors, 0 warnings, 1 existing inline-script hint in `src/layouts/Layout.astro`. |
| `npx tsc --noEmit` | Passed, exit 0. |
| `git diff --check` | Passed. Final status contains only the three intended source files and audit documents. |
| Untouched main comparison | Built a temporary archive of the verified main commit. All 41 other directory pages have identical main markup after stripping scripts/styles, Astro scope hashes, insignificant intertag whitespace and the new default tab-variant attribute. No other page content or section order changed. |
| Desktop browser | Inspected hero, evidence tabs and numbered process at 1280px. No horizontal page overflow. |
| Mobile browser | Inspected hero, deliverables, tabs and fit at 390px, supporting disclosures at 320px. Page width matches viewport at both widths. Tab and section navigation scroll within their own rows. |
| Keyboard | ArrowRight selects Team workflows; End selects Systems and results; Home returns to Customer needs. Enter opens the research disclosure. Selected state verified in the DOM. |
| Direct tab URL | `#foundations-evidence-3` selects Systems and results. |
| HTML/fallback | Four outputs present; section links resolve; no duplicate main IDs. All three evidence panels exist without hidden attributes in raw HTML, preserving the existing no-script content fallback. This is source/output verification, not a disabled-JavaScript browser session. |
| Browser console | No error entries observed on the local pilot during inspection. |
| Change hygiene | No nested project, dependency changes, legal changes, token output, or tracked environment file. Build-generated Tina lock churn removed after comparison; no pre-existing user changes were present. |

## Resolved setup failures and limits

The isolated worktree initially lacked dependencies and its ignored environment file. Installation and initial builds encountered sandbox network/local-port restrictions. Dependencies were installed from the lockfile and the saved project's ignored `.env` was copied locally without displaying its contents. Final build ran successfully with local port access. An introduced section-navigation literal type error was fixed, then both type checks passed.

The browser inspection used the locally active dark theme and one desktop browser, not a full browser/screen-reader matrix. Native no-script content was inspected in generated HTML. No form submissions, deployment, Lighthouse run or live Semrush recrawl was performed. Production robots and sitemap responses could not be inspected through the available live tools; their source defects and remaining uncertainty are documented in the audit.

Review this pilot before applying its presentation to other routes. Separate follow-ups: stale static sitemap, privacy/analytics inconsistency, www host policy and email-protection crawl behavior.
