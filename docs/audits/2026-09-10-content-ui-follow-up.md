# Cadence Lab content and UI audit — follow-up

Reviewed September 10, 2026. This pass extends the September 5 audit with current live checks and concrete editorial decisions. The document began as an audit; completed implementation and validation are recorded below.

## Baseline and coverage

- Refreshed `origin/main`: `cd6399add43d6943ab427705d943f20cb217db4f`. The Experience Foundations pilot was merged in #137; #138 subsequently changed dependencies. Current main's application source matches the completed pilot branch; only the package lock differs.
- New audit branch: `feature/content-audit-follow-up`, based on current main. Clean working tree before this document.
- Live browser: home, About, Services, all four Product pages, and search. Desktop 1280 × 720; Services and Product structure at 390 × 844. Source inspection additionally covered contact, Fit Check, service-detail deliverables, shared navigation, footer, FAQ, platform logos, and search indexing.
- Existing audit covers solution directories and specialist pages. Those are carried forward as recommendations, not represented as new full visual inspections. No fresh Semrush crawl, analytics analysis, form submission, performance benchmark or full accessibility audit was performed.
- Initial account usage: 16% consumed in the five-hour window and 3% weekly. Checks are account-wide, not this task's token count. One focused pass, no subagents, and no repeated builds for documentation-only work.

## What to fix first

| Priority | Finding and evidence | Recommended change |
| --- | --- | --- |
| High | **About contains visible production placeholders.** The founder section shows “Future portrait,” photography directions, and “Portrait crop · 4:5.” Confirmed in the live browser and `src/pages/about/index.astro:170`. `aria-hidden` does not hide it visually. | Remove the placeholder figure from the public layout until a real supplied photo is ready. Keep Matt's name and factual bio. No invented portrait or credentials needed. |
| High | **Search promises more than it finds.** The header says “Search insights and resources”; `src/lib/search.ts` builds entries only from published blog posts. Live `/search/?q=handoff` settled to zero results despite the existing Handoff Mapper tool. | Narrow the label to “Search insights” immediately, or deliberately include resource entries. Prefer the label correction as the smallest accurate fix; improve coverage separately. Do not recommend unrelated keywords as a workaround for missing indexed content. |
| High | **Offer names change during the buying path.** Home uses Diagnostic Brief, Lifecycle Risk, CRM Workflows and Service Readiness; Services uses the full four offer names. Confirmed live and in `Stats.astro`. | Use each full offer name consistently, paired with one plain problem sentence. Visitors should recognize the same service after clicking. |
| High | **Services repeats its selection task.** The four diagnostic tabs and “Find your match” present the same choices. At 390px the tab strip extends from x=25 to x=951: only the first label is fully visible initially. The page itself does not overflow. | Replace the two selectors with one visible comparison: four stacked rows on mobile, each showing problem, service and deliverable. Put optional scope detail in disclosures. Keep essential choices outside tabs. |
| Medium | **Three Product pages bury deliverables.** Digital, Location and AI each put signals, framework, process, evidence and failures ahead of outputs. Each renders 6 signals, 6 framework panels, 5 steps, 6 evidence cards, 6 failure cards, 4 outputs and 3 related paths. | Reuse the pilot's ordering, but edit each page individually. Keep the concrete opening example and all four actual outputs. Combine repeated failures with problem examples; reduce process detail; reserve tabs for optional categories. |
| Medium | **Navigation requires understanding the business's taxonomy.** Services / Product / Solutions sound overlapping. About and Free resources each open a menu with one destination. | Make About and Free tools direct links. Use “Services” for the four diagnostics; relabel Product as “Experience design” with explanatory menu copy. Keep solution directories available under “Find your starting point.” Preserve paths. |
| Medium | **The About page spends more space on method than the person.** First-person founder summary repeats the third-person official bio; point of view, working standards and system view revisit ownership, evidence and outcomes. | Lead with who Matt is and that clients work directly with him. Keep one bio, a short working approach, and fit. Move a separate press bio out of the main reading path if genuinely needed. Preserve the stated experience duration pending factual review. |
| Medium | **Contact adds another routing step.** Its three primary CTAs go to Fit Check; two others go to Services. The source has no direct email link within main content. | Keep Fit Check for project inquiries. Add an obvious general-question email using the existing published address, and reduce repeated context/fit sections. Retain the contact route. |
| Medium | **The intake assumes CRM is relevant to everyone.** Fit Check requires a CRM assessment but has no explicit “We don't use a CRM” choice. This matters because Digital and Location serve broader situations. | Review adding a non-CRM option. This affects submitted values/processing and requires a deliberate implementation check; don't silently change the form schema during copy cleanup. Rename “Your operating environment” to “How your team works.” |
| Medium | **The homepage explains process twice.** Hero's Diagnose/Rebuild/Prepare panel overlaps the later four-step process. The first-screen explanation uses several specialist terms together. | Remove the hero process panel and keep one brief method section below service selection. Use observable customer/team problems in the opening paragraph. |
| Low | **Footer gives specialist terminology disproportionate prominence.** Eleven workflow/solution/AI links overshadow basic orientation; labels include Variance tracing and PII scrubbing nodes. | Lead footer with Services, Experience design, About, Free tools and Contact; retain legal links. Reach specialist material through relevant service pages. Do not delete routes. |
| Low / uncertain | **Platform logos may be mistaken for customer proof.** The label says systems/platforms, not clients; the About bio supports some platform experience, but this audit does not establish partnerships or client relationships. | Keep the category clearly labeled. Never relabel the strip “Trusted by.” Move it below useful service information; only add experience claims supported by the user's facts. |

## Layout measurements: use as context, not a target

Live main-content heights at 390px, default tab selections, observed during this pass:

| Page | Approximate main height | Substantive body sections before outputs |
| --- | ---: | ---: |
| Digital Experiences | 12,468px | 5 |
| CX on Location | 12,511px | 5 |
| AI Experience | 12,686px | 5 |
| Experience Foundations pilot | 6,730px | 1 |

These are browser snapshots, not stable performance metrics or conversion evidence. Hidden tab panels are counted in the content inventory but do not all contribute to visible height. No page-wide horizontal overflow was observed in those four mobile samples. The problem is repeated reading and late buying information, not simply a long page. Preserve useful white space; reduce redundant sections before shrinking type or padding.

## Proposed copy and page structure

These are ready-to-use editorial drafts grounded in existing services, with no new prices, credentials, results or guarantees.

### Homepage opening

**Heading:** Fix the problems that keep customers coming back for help.

**Body:** Customers repeat themselves. Onboarding stalls. Teams work around tools they don't trust. Cadence Lab helps you find what's causing the problem and decide what to fix first—with clear owners and a practical plan.

**Primary action:** Start a fit check

**Secondary action:** Compare services

**Small supporting line:** You'll work directly with Matt Rabah, from the first diagnosis through recommendations and measurement planning.

Keep the existing heading as an alternative if preferred; the opening paragraph and duplicated process panel are the more consequential changes. AI remains an explicit service choice below the opening, rather than another unexplained term in the same sentence.

### One service chooser, consistent everywhere

| Service | Recognizable problem | What you'll receive — short version |
| --- | --- | --- |
| CX Systems Diagnostic | Customers get passed between teams, and no one can see where the problem starts. | A map of the breakdowns, clear ownership, and what to fix first. |
| Lifecycle Risk Review | Onboarding stalls or customers disengage before your team knows to act. | Useful warning signs, who should respond, and an improvement plan. |
| CRM Workflow Audit | Your team records work in the CRM but relies on spreadsheets and messages to get it done. | Workflow and data findings, a prioritized cleanup plan, and requirements for a better workflow. |
| AI Service Readiness Review | You have an AI idea but aren't sure the workflow, information, or human support is ready. | A readiness decision, where people stay involved, and the changes needed before implementation. |

The diagnostic identifies and recommends; it does not automatically deliver every downstream implementation. Replace the homepage promise to “eliminate” workarounds with accurate diagnosis/recommendation wording. Keep published timing attached to its specific offer rather than extending it to every service.

### Service vs experience-design distinction

**Diagnostics:** Find the cause and decide what to fix first.

**Experience design:** Turn that direction into clearer customer journeys, service rules, workflows, and requirements for delivery.

Menu explanation: “Build on a clear understanding of the problem. Explore work across digital services, physical locations, AI, and the shared foundations behind them.”

This describes the existing scope without suggesting these are boxed software products or making a diagnostic a mandatory prerequisite for every engagement.

### About opening

**Heading:** Work directly with the person doing the work.

**Body:** I'm Matt Rabah, founder of Cadence Lab. I help organizations understand why customer problems keep coming back and improve the work behind them. Cadence Lab is a solo practice, so you'll work with me from diagnosis through recommendations, workflow design, and measurement planning.

Keep the existing factual background below this. Remove the portrait placeholder and the repeated bio paragraph. No need to add generic values or more process cards.

### Plain-language replacements

| Current term | Prefer in general buyer copy |
| --- | --- |
| Onboarding drift | Onboarding stalls or takes longer than expected |
| Quiet accounts | Customers stop engaging |
| Cross-functional misalignment | Teams disagree about what to do or who owns it |
| Decision rights | Who can make the decision |
| Sequenced remediation plan | What to fix first, and who will do it |
| Human-in-the-loop oversight | Where people review, approve, or take over |
| Review cadence | When the team reviews progress |
| Touchpoints | The steps where customers interact with you |

Keep technical terms where they distinguish scope or help a specialist make a decision. Do not mechanically replace every instance.

## Next implementation batches

1. **Accuracy and credibility:** remove the About placeholder, correct search scope wording, standardize offer names, and fix misleading related-link labels. Small, concrete changes with no business-fact invention.
2. **Buying path:** simplify header/footer navigation, merge the services choosers, remove the duplicated homepage process panel, and add a direct general-contact route. Validate desktop/mobile navigation and destination links together.
3. **Remaining capability pages:** adapt the pilot to Digital, Location and AI, preserving each page's specific examples, four deliverables, limitations and next steps. No requirement for page-by-page user review; use grouped validation and one concise change summary.
4. **Separate functional/accuracy work:** resource search indexing, non-CRM intake option, and the earlier privacy/analytics and sitemap findings. The latter remain source findings from the prior audit; deployment behavior was not rechecked in this content-focused pass.

No broad route removals or legal changes are part of these proposed editorial batches. Do not turn every paragraph into a card, every section into tabs, or every important detail into a disclosure. Buyer problems, deliverables, fit and the next step stay visible.

## Validation of this audit

Findings were cross-checked against the live browser and source on refreshed main. The pilot's revised heading is present live. The About placeholder was visibly confirmed; service label positions and page widths were measured; search was observed after client-side filtering settled. Local document links and final Git scope were checked. No application source was changed, so build/typecheck results from September 5 were not misrepresented as new runs.

Usage at completion: 43% remaining in the five-hour window and 91% remaining in the weekly window. These are account-wide snapshots, not a measurement of this task alone. No usage reset was redeemed.

## Implemented: remaining capability pages

Digital Experiences, CX on Location, and AI Experience now use the approved shorter presentation: three recognizable problems, four deliverables near the top, three working stages, three evidence groups, visible fit guidance, and destination-specific related links. Each page retains its concrete opening example, distinct outputs, evidence note, exclusions, and next step. Repeated six-part frameworks and failure catalogs are no longer rendered.

Validation: TypeScript passed; Astro check passed with the existing inline-script hint only; production build passed with 43 pages. Local browser checks at 1280px confirmed each page renders 3 problems, 4 outputs, 3 stages, and 3 evidence tabs without horizontal overflow. Their rendered heights fell from roughly 12,500px in the earlier audit to 5,424–5,605px at the current desktop viewport. The usage window reset during validation; the latest account-wide snapshot was 91% five-hour and 99% weekly remaining.

## Implemented: accuracy and credibility batch

Removed the unfinished About portrait and unused styles; corrected header and dialog search wording to Search insights; standardized homepage service names and clarified diagnostic outcomes; made default related links name their destination. Five source files changed.

Validation: TypeScript passed; Astro check passed (0 errors, 0 warnings, one existing inline-script hint); final production build passed (43 pages). Initial sandbox build could not open Tina port 4001; the permitted retry passed. Generated HTML checks passed for placeholder removal, service names, search wording and related-link correction. No new browser visual check was run. Changes are local and uncommitted. Latest usage snapshot: 28% five-hour and 88% weekly remaining, account-wide.

## Implemented: buying path batch

Services now presents one visible list of four diagnostics, with situations and outputs; detail routes retain the fuller scope. Removed the duplicate chooser and homepage hero process panel. About and Free resources are direct desktop/mobile navigation links; Product is labeled Experience design; desktop Fit Check action is consolidated. Contact keeps Fit Check and direct email, removing two repeated CTA sections. Footer labels use clearer language while retaining all destinations.

Validation: production build passed (43 pages), TypeScript passed, Astro check passed (0 errors, 0 warnings, one existing hint), generated-content checks and diff whitespace check passed. Desktop browser at 1280px confirmed four service choices, correct header containment, no horizontal overflow and working Experience design menu. Mobile visual validation remains incomplete: viewport API was unavailable in this browser session. The account-wide usage snapshot at this checkpoint was 7% five-hour and 85% weekly remaining.

## Implemented: About and intake cleanup

About now leads with the direct working relationship, uses one first-person background section, and removes the repeated premise card, third-person biography, and system-view explanation. The Fit Check asks about customer data more broadly and adds a validated “We do not use a CRM or central customer record” choice; submission validation and email summaries use the same wording.

Validation: TypeScript passed; Astro check passed with the existing inline-script hint only; production build passed with 43 pages. Local browser checks confirmed the About heading and shortened section set, six Fit Check customer-data choices including the non-CRM option, and no horizontal overflow at the 1280px validation viewport.

## Remaining separate decisions

- Reconcile the privacy statement with the analytics configuration. This requires a deliberate legal and tracking decision, so neither was changed during editorial cleanup.
- Verify deployed sitemap and host behavior before changing the static sitemap or redirect policy.
- Decide whether platform logos are useful context. They remain labeled as systems and platforms, with no unsupported client or partnership claim.
- Run a final mobile visual check before merge. Generated output and responsive source were verified, but the browser viewport control was unavailable for this implementation session.
