# Cadence Lab — Design System

> **Status:** Adopted. Section 0.1 records the implemented v2 decisions, which override any historical value below. **Scope:** Cadence Lab (`cadencelab.co`) marketing website, service and solution pages, FitCheck™, insights, resources, and future diagnostic tools. **Version:** 2.0 · 2026-11-11.
>
> **Use:** Place this file at the project root as `DESIGN.md`. It is a design brief and design-contract for human designers and AI coding agents, **not** a request to replace the site's existing branding, colors, content, routes, or components wholesale.

## 0. Non-negotiable instructions for implementers

**Primary directive:** Make Cadence Lab recognizable as a founder-led customer-experience systems and AI workflow practice, **not** a SaaS product, generic agency, enterprise platform, publication, or AI startup.

**Priority order if instructions conflict:**

1. Current approved Cadence Lab identity assets, existing production tokens, and explicitly approved brand decisions.
2. Accessibility, semantic behavior, security, performance, and usable mobile layouts.
3. This document's Cadence-specific visual and content rules.
4. Relevant established components and existing implementation conventions.
5. External references (Notion, IBM Carbon, The Information, Linear, etc.) as *principles*, never source code, brand assets, visual clones, or alternative color schemes.

**Preserve, do not replace:**

- Existing Cadence Lab logo/wordmark, asset geometry, dot/period, colors and font files.
- **Graphik** as the brand, heading, interface, and body typeface (v2: Graphik only; Tiempos is out of scope for now).
- Current approved light and dark theme choices and the user-selectable theme behavior; improve separation and contrast without introducing a rebrand.
- Existing content model, service names, truthful claims, citations, FitCheck™ identity, and site routes.
- Existing framework and architecture (Astro where currently used). Do not add React, shadcn/ui, heavy animation libraries, or design-system dependencies merely because a reference site uses them.

**Brand marker conflict resolution:** Recent design direction refers to a **yellow dot**, while an older Cadence Lab stylesheet and logo references used **blue**. **Do not guess a yellow hex value, recolor the existing SVG, or silently pick one.** Use the currently approved, checked-in logo/dot asset as the source of truth. Expose `--cl-brand-marker` only if the implementation needs a CSS-controlled marker; it must match the actual approved asset. The dot is an identity element, *not* a universal CTA color or substitute for status labels.

**Hard exclusions:** No purple/lavender palettes; no imported brand colors; no generic three-up SaaS feature grids across every section; no decorative gradients, glassmorphism, glowing orbs, fake terminals, floating dashboards, pointless 3D illustrations, cartoon mascots, or AI-generated corporate handshakes. No indiscriminate rounded pills; no fake evidence, metrics, quotes, testimonials, client relationships, or case studies. Never sacrifice contrast or comprehension for aesthetic minimalism.

## 0.1 Implemented decisions (v2)

These are the values in `src/styles/global.css`. Where a historical value later in this file differs, this section wins.

**Palette: neutral paper and graphite.** True neutral grays, with no warm (brown) or cool (navy) tint, replace pure white and pure black. A warm palette was tried and rejected as brownish. One principle is kept from the Mailchimp study (a softened near-black instead of black; white paper on a slightly tinted page), but none of its values, yellow, fonts or shapes.

| Role | Light | Dark |
|---|---|---|
| Level 0 · page (`--color-surface`) | `#FAFAFA` off-white | `#212121`, lifted so the header and footer frame it |
| Level 1 · inset, bands (`--color-surface-subtle`) | `#F0F0F0` | `#2A2A2A` |
| Stronger separation (`--color-surface-muted`) | `#E6E6E6` | `#333333` |
| Level 2 · paper, panels, forms (`--color-surface-pure`) | `#FFFFFF` | `#333333` |
| Header and footer anchor (`--color-surface-anchor`) | `#1F1F1F` graphite | `#0E0E0E` |
| Text (`--color-text`) | `#1F1F1F` | `#F2F2F2` |
| Muted text | `#555555` | `#BBBBBB` |
| Rules | `#DEDEDE` / strong `#B5B5B5` | `#3D3D3D` / strong `#545454` |
| Action blue: links, focus, FitCheck™ CTA | `#2A53DB` | `#9FB3FF` |
| Logo dot (marker only) | `#FFCE31` | `#FFCE31` |

Every text pair passes WCAG AA on every surface it sits on in both themes; the site-wide contrast scan reports 0 failures.

**Resolved conflicts from section 0:**

1. **Marker:** the checked-in wordmark's yellow dot is the source of truth. No blue marker.
2. **Action color:** a single blue (`#2A53DB`), darker than the historical `#3565FF` so small links pass 4.5:1 on tinted surfaces. Indigo `#4F46E5` is retired.
3. **Type:** Graphik only, for every role. Tiempos is out of scope for now.
4. **Header:** shares the footer's dark anchor in both themes (Matt's call), so the page is framed top and bottom by the same graphite. Menus and the mobile drawer use dark tokens.

**Surfaces:** sections marked `[data-band]` render as level 1 with normal text in both themes, separated from the page by tone and a rule, never as black blocks. The header and footer are the two deliberate inverse surfaces, always the same color.

**Geometry:** `--radius-sm`/`--radius-md` 4px, `--radius-lg` 8px. No pills. Static content has no shadow; overlays keep `--shadow-overlay`.

**Labels:** sentence case, muted, no forced uppercase or tracking. Uppercase is reserved for the short Friction Trace annotations (Observation, Decision, Owner, Measure).

**Signature:** the home method section is a numbered Friction Trace; the diagnostics index is rule-separated editorial rows; evidence stats are open columns on a 2px rule.

---

## 1. Brand intent and visual atmosphere

### What Cadence Lab is

A specialist, founder-led practice diagnosing and improving the systems behind customer experience: cross-team handoffs, lifecycle risks, CRM workflows, operational accountability, digital journeys, and responsible AI adoption.

The home page expresses its position directly:

- **Point of view:** “CX without the BS.”
- **Promise:** “Fix the systems behind customer friction.”
- **Method:** Find what is happening → agree on the change → fix the work → track the result.
- **Entry point:** FitCheck™ helps identify the smallest useful next step before a buyer funds a larger solution.

### Visual thesis

**An editorial field guide to complex operations.** Clean enough to read like a carefully edited report, structured enough to explain a real system, and distinctive enough to be recognized without a logo.

- **Precise, not clinical.** A strong grid and consistent semantics; enough warmth to feel human.
- **Editorial, not literary.** Clear headlines, composed paragraphs, asymmetric emphasis, restrained rules. Avoid magazine cosplay.
- **Technical, not developer-branded.** Diagrams show dependencies and handoffs, never fake code or terminal outputs.
- **Confident, not grandiose.** Specific problems, named decisions, real owners, honest scope.
- **Quietly individual, not trendy.** Use Cadence's typography, marker, diagram grammar, and writing voice as signature elements.

### Reference synthesis — principles only

| Source | Borrow | Reject |
|---|---|---|
| **Notion** | Calm editorial space, thoughtful content hierarchy, border-first components | Purple palette, workspace/product mockups, Notion font, pastel-card overload |
| **IBM Carbon** | Repeatable grid, accessibility rigor, states, information hierarchy, disciplined component logic | IBM blue/branding, strict institutional rigidity, Carbon-specific React package |
| **The Information** | Strong editorial rules, typographic roles, visual economy, unapologetic information hierarchy | Magenta, newspaper density, multi-font imitation, paywall marketing patterns |
| **Linear** | Precise micro-interactions, quiet confidence, restrained surfaces, control of density | Dark-app aesthetic, indigo accent, project-management UI metaphors |
| **Basecamp** | Direct, plainspoken, human explanations | Nostalgic cream-and-green styling, playful task-app interface |

**Cohesion rule:** These references provide different *jobs*, not five simultaneous themes. Every Cadence page uses **one common token system, one typographic system, one component grammar, and one diagram grammar**.

---

## 2. Color system and light/dark modes

### Principle: preserve Cadence's colors; improve semantic use

The following legacy values were present in a **July 2026 Cadence Lab `global.css`**. Treat them as a **verified historical baseline**, not an instruction to overwrite current production values. **Before modifying CSS, inspect the current repo and its actual tokens.** If approved values differ, preserve them and adapt only semantic aliases, accessibility variants, and surface relationships.

| Historical token | Reference value | Intended role |
|---|---|---|
| `--color-ink` | `#010302` | Near-black anchor |
| `--color-light` | `#FCFEFF` | Ice-white anchor |
| `--color-blue` | `#3565FF` | Existing brand/interactive blue |
| `--color-green` | `#4FD34A` | Existing positive/signal green |
| `--color-surface` | `#FCFEFF` | Light reading canvas |
| `--color-surface-pure` | `#FFFFFF` | Distinct raised or paper surface |
| `--color-surface-subtle` | `#F4F7F8` | Quiet section contrast |
| `--color-surface-muted` | `#EAF0F2` | Stronger neutral separation |
| `--color-text-muted` | `#515B59` | Secondary body copy |
| `--color-text-subtle` | `#707A77` | Tertiary metadata; **not** automatically safe for small text |
| `--color-border` | `#D8E0DF` | Structural rule |
| `--color-border-strong` | `#AAB5B2` | Emphasized separation |
| `--color-error` | `#B42318` | Error text/icon |
| `--color-success` | `#16794A` | Success text/icon |

### Semantic tokens

Maintain *raw brand tokens* separately from *semantic roles*. Do not color components with arbitrary raw values. Suggested alias vocabulary:

```css
/* Names/relationships to implement or map onto the existing theme.
   The production repo remains authoritative for raw brand values. */
:root {
  --cl-page: var(--color-surface);
  --cl-paper: var(--color-surface-pure);
  --cl-subtle: var(--color-surface-subtle);
  --cl-muted-surface: var(--color-surface-muted);
  --cl-ink: var(--color-text);
  --cl-copy-muted: var(--color-text-muted);
  --cl-rule: var(--color-border);
  --cl-rule-strong: var(--color-border-strong);
  --cl-action: var(--color-accent);
  --cl-focus: var(--color-focus);
  --cl-positive: var(--color-success);
  --cl-negative: var(--color-error);
  /* --cl-brand-marker: value verified from approved logo asset, not guessed */
}
```

### Surface hierarchy

Use a deliberate **three-level surface language** in each theme:

| Surface | Light scheme | Dark scheme | Use |
|---|---|---|---|
| Level 0 / page | ice-white | deepest near-black | Main scroll canvas |
| Level 1 / inset | subtle neutral, visibly distinct | charcoal one step above page | Method, evidence, sidebars |
| Level 2 / panel | paper white or selected stronger neutral | charcoal one step above inset | FitCheck forms, interactive overlays, evidence panels |

**Do not solve hierarchy only with shadows.** Separate neighboring surfaces with tone, a structural 1px rule, white space, and typographic roles. In dark mode, adjacent levels must be distinguishable on real displays; never use black-on-black sections with invisible borders.

### Dark mode requirements

- Keep the dark page rooted in Cadence's established near-black (`#000504` or `#010302` if those remain current), with approved off-white reading text (historically `#F6F8FF` / `#FCFEFF`).
- Proposed **neutral-only** structural ramps, *subject to existing-token reconciliation*: dark page `#000504`, inset `#111717`, panel `#1B2323`, stronger rules `#394443`, muted copy `#B4C0BC`. These are **candidate functional neutrals**, not new brand colors; do not apply blindly over an existing approved ramp.
- Brand blue `#3565FF` is not sufficiently legible for small body links on the deepest dark surface; use a tested lighter *functional tint* (for example `#9FB3FF`) or the current approved accessible dark-link token. Do not call that tint a new brand color.
- Signal green `#4FD34A` can work as an icon/signal on dark but cannot serve as small text on the ice-white page. Status must also include a textual name or shape.
- Never create a separate purple/blue-gradient visual identity for dark mode.
- Use `color-scheme` to style native controls and keep forms, focus, selection, illustrations, and logos compatible with both modes.

### Contrast and status rules

- Target **WCAG 2.2 AA**: normal text **≥ 4.5:1**; large text **≥ 3:1**; meaningful non-text controls/graphics **≥ 3:1** where applicable.
- Test **each foreground against the actual local surface**, not only the page background. For example, historical `#3565FF` on `#FCFEFF` is about **4.66:1** but on `#F4F7F8` about **4.38:1**; choose a compliant semantic link variant on tinted surfaces.
- A 1px rule can be intentionally low contrast if decorative; boundaries needed to understand controls must meet the relevant non-text requirement.
- Error/success/warning must use text + icon/label, never hue alone. Do not invent a new full-page warning palette.
- Brand marker/dot is not an accessible indicator on its own.

---

## 3. Typography and editorial hierarchy

### Type roles

| Role | Font | Behavior |
|---|---|---|
| Logo | Existing approved SVG / Graphik Semibold geometry | **Never retype the brand mark** or alter dot kerning/spacing |
| Display / H1–H4 | **Graphik** | Precise, direct, readable; use actual installed weights |
| Body, navigation, cards, CTA, forms | **Graphik** | Default across site; consistent weights and optical spacing |
| Long-form insights / article prose | **Tiempos Text** | Selectively for extended reading; never for forms or navigation |
| Rare editorial pull quote | **Tiempos Headline** if installed and context warrants | One exception, not a second full heading system |
| Numeric / systems labels | Graphik with tabular figures; system mono if truly needed | Avoid fake-terminal visuals and arbitrary mono labels |

**Do not** introduce Inter, Geist, IBM Plex, Notion Sans, Suisse, another imported headline font, or additional family without an explicit identity decision. Never ship font files in public downloads outside properly licensed website assets.

### Type scale (responsive, aspirational ranges)

The exact weight/size should be reconciled with current CSS; use these as starting *roles*, not a blanket regression of existing approved headings.

| Role | Desktop target | Mobile target | Line-height | Weight |
|---|---:|---:|---:|---:|
| Display / home hero | 64–76px | 40–48px | 0.98–1.08 | 600 |
| H1 on interior page | 52–64px | 36–44px | 1.03–1.12 | 600 |
| H2 / section thesis | 40–52px | 30–38px | 1.08–1.16 | 400–600 |
| H3 / problem heading | 26–32px | 23–28px | 1.15–1.25 | 500–600 |
| H4 / panel title | 19–23px | 18–21px | 1.25–1.35 | 500–600 |
| Lead paragraph | 19–22px | 17–19px | 1.45–1.6 | 400 |
| Standard body | 16–18px | 16px | 1.55–1.7 | 400 |
| Metadata / labels | 13–14px | 13–14px | 1.4–1.5 | 500 |
| Short technical annotation | 12–14px | 12–14px | ≥ 1.4 | 400–500 |

- Use fluid CSS (`clamp`) for display tiers; don't shrink an H1 to an unreadable fixed size or stretch it beyond the viewport.
- Line breaks are **content-aware**, not forced after every adjective. Aim 8–12 words for a prominent headline where natural; use no hard `<br>` layout hacks for mobile.
- Body copy width: target **60–70ch** for Graphik; editorial Tiempos reading column about **60–68ch**.
- Tight tracking only on large display text (roughly `-0.02em` to `-0.035em` where tested). Standard/body copy uses normal or minimally negative tracking.
- Use sentence case; no all-caps body copy. Small caps/uppercase only for brief functional labels if readability holds.
- Prefer `font-variant-numeric: tabular-nums` for metrics, tables and comparisons.
- Confirm all font weights and italics exist in the project. Do not synthesize unavailable faces or fake bold/italic when it changes texture.

### Editorial hierarchy

Every meaningful page follows a clear reading path:

1. **Problem or point of view** — one strong claim in Graphik.
2. **Why it matters** — brief grounded explanation.
3. **Evidence** — real observation, source, or clearly identified example.
4. **What changes** — decision, owner, workflow, or service outcome.
5. **Next action** — one relevant link or CTA.

No section should be composed solely of a large slogan and empty decorative space.

---

## 4. Layout, grid, spacing, geometry

### Layout grammar

- **Editorial spine:** Shared alignment of page heading, body lead, sectional rules, evidence labels, and actions; modules may intentionally extend across columns.
- **Controlled asymmetry:** A 7/5 or 8/4 content/diagram split where it helps explanation; don't randomize margins and offsets for visual novelty.
- **Visible structure:** Thin divider rules, numbered sections, annotation rails, and consistent rhythm. Prefer **open layouts** to a wall of cards.
- **One featured module per page:** A consequential diagram, evidence comparison, or decision panel, not three competing hero treatments.
- **Text-first responsive logic:** Mobile preserves the reading order; never depend on the visual position of a diagram to make the copy understandable.

### Grid and spacing

Preserve the site's historical layout values unless current code differs:

```css
--page-gutter: clamp(1.25rem, 4vw, 3rem);
--container-page: 80rem;
--container-wide: 90rem;
--container-header: 56rem;
--container-copy: 66ch;

/* 4px-root rhythm; optional jumps by use case */
--space-1: .25rem;  /* 4px */
--space-2: .5rem;   /* 8px */
--space-3: .75rem;  /* 12px */
--space-4: 1rem;    /* 16px */
--space-6: 1.5rem;  /* 24px */
--space-8: 2rem;    /* 32px */
--space-12: 3rem;   /* 48px */
--space-16: 4rem;   /* 64px */
--space-24: 6rem;   /* 96px */
```

- Desktop: up to 12 logical columns; content and page grids need not expose physical guides.
- Tablet: compose into 6–8 logical columns where possible; reduce decorative rails first.
- Mobile: single reading column; 16–24px side gutters; preserve visible list and table context.
- Main section separation: typically 64–112px desktop / 48–72px mobile; tighter for closely related material.
- Responsive images maintain intrinsic size; never crop off required content or logos.

### Shape and depth

- Small controls: around **4px** radius; panels around **4–8px**; substantial editorial diagrams may use square corners.
- Strong preference for **square and quietly rounded geometry**, not bubbles and giant pill cards.
- Border-first, 1px; occasional stronger 2px rule where it signals a major editorial change.
- Little or no elevation on static content; shadows only for truly layered interfaces (dialogs, menus, search overlay).
- Do not build every section as alternating tinted rectangles. Whitespace and rules should do most of the organizing.

---

## 5. Cadence's ownable visual language: the Friction Trace

**This is the differentiation mechanism.** The website should make *how Cadence thinks* visible. Reuse a proprietary **Friction Trace** grammar in diagnostic illustrations, service introductions, case studies, and explanatory visuals—not as decorative wallpaper.

### Diagram vocabulary

A Friction Trace depicts how one customer outcome travels through a sequence of people, systems, and decisions.

| Element | Form | Meaning |
|---|---|---|
| **Path** | Thin continuous rule | A customer's journey or operational workflow |
| **Node** | Compact outlined rectangle, number or small dot | A team, tool, touchpoint or decision |
| **Handoff** | Rule connecting nodes | Transfer of information or ownership |
| **Break** | Interrupted/dashed segment plus label | Observed friction, missing context, delayed decision |
| **Owner** | Short label attached to node or resolution | Person/team accountable for corrective action |
| **Measure** | Aligned numeric value or before/after qualifier | Observed result, baseline or target |
| **Marker** | Existing approved Cadence dot used sparingly | Point under attention; not an unlabeled status |
| **Annotation** | Small Graphik note in margin or rail | What the evidence means and what to do next |

### Example: a genuine CX diagnostic story

```text
Customer asks for help
       |
       v
Service team --- handoff missing account context --- Customer Success
                       ^
                 FRICTION: customer repeats information
                       |
             DECISION: define required CRM fields
             OWNER: CS Ops + Service lead
             MEASURE: repeated-contact rate
```

**Agent rule:** This is a *grammar*, not a pre-approved business claim. The above is illustrative. For published examples, label them as examples; for actual client cases, use approved evidence and explicitly state scope, data source, and owner.

### Visual treatment

- Use site neutrals for nodes and paths. Reserve existing brand accent/marker for **one** point of emphasis at a time.
- Use direct labels; color is not the only key. Connectors must remain understandable in grayscale, keyboard navigation, and reduced motion.
- Desktop may use the side of a content column; mobile turns the trace into a vertically ordered, text-equivalent step sequence.
- Do not animate every node. A subtle active-path reveal is allowed only if it adds understanding and has a static equivalent.
- No radial infographic decorations, floating abstract cube networks, fake AI neural webs, or overly intricate Sankey graphics for simple concepts.

### Additional graphic applications

- **Diagnostic card:** Problem → suspected constraint → evidence to inspect → decision needed.
- **Before/after:** Compare the same labeled stages before and after a real intervention; do not fabricate improvement numbers.
- **Decision brief:** Large thesis statement, supporting evidence, named constraint, responsible party, next useful action.
- **Reading annotation:** A short margin label such as `OBSERVATION`, `HANDOFF`, `OWNER`, `MEASURE`; use these as navigation cues rather than decorative badges everywhere.

---

## 6. Components and interaction patterns

### Global navigation

- Preserve current top-level IA: **Services**, **Solutions**, **Insights**, **About**, **Free resources**, **FitCheck™** and existing supporting links, subject to verified current routes.
- Header should feel like a practical document header, not a full application toolbar.
- One primary CTA in the header. Avoid multiple competing brightly styled actions.
- Menus have clear text labels, keyboard navigation, visible focus, Escape-to-close, close-on-outside where appropriate, and mobile touch targets.
- Search (`⌘K`/`Ctrl+K`) should be discoverable but never obstruct the reading experience; preserve existing search implementation where present.

### Hero

- Lead with a specific business reality and a compelling point of view, not abstract “transform the future” language.
- Home page anchor remains **“CX without the BS.”** and **“Fix the systems behind customer friction.”** until copy is explicitly approved for change.
- Compose the message as headline + short explanation + one primary action + optional secondary text action. Use a Friction Trace or evidence panel only when it reinforces the claim.
- Avoid illustrations merely to fill an empty column.

### Problem-to-diagnostic index

The four existing diagnostic pathways should be recognizable and comparable:

1. **CRM Workflow Audit** — connecting CX data to commercial decision-making.
2. **CX Systems Diagnostic** — identifying unresolved cross-functional breakdowns.
3. **Lifecycle Risk Review** — finding churn signals before cancellation.
4. **AI Service Readiness Review** — understanding workflow/human handoff readiness.

**Preferred presentation:** Four legible editorial rows or a rule-separated comparison layout. Each contains: customer-language problem, what is at risk, relevant diagnostic, concise explanation, and clear action. On small screens, stack each row; do not force a horizontally scrolling four-card wall unless a comparison interaction is genuinely essential and accessible.

### Method/process

- Existing method: **Find what's really happening → Agree on what has to change → Fix how the work gets done → Track what changes**.
- Show as a **numbered Friction Trace** or editorial vertical sequence; each step has one actionable sentence.
- Use real progress semantics only when an actual process state exists; decorative numbered steps should not impersonate an interactive wizard.

### Evidence and metrics

- **One insight per evidence module.** Large figure, concise interpretation, source citation, and clear relationship to the argument.
- External research statistics need visible source and date/context. Do not conflate external benchmark figures with Cadence Lab client outcomes.
- Avoid animated count-up statistics, stylized vanity metrics, or unsourced success claims.
- For comparisons, prefer tables or aligned bars with labeled axes and units. Provide text/table equivalents for visually encoded data.

### FitCheck™

- Treat FitCheck™ as a **decision-support intake**, not a lead-gen gimmick or AI quiz.
- Present: what users provide, estimated time if confirmed, privacy expectations, what they receive, and that a person reviews the result (consistent with actual operation).
- Label every field; convey required/optional clearly; show inline error states and recovery guidance.
- Multi-step progress must reflect real completed steps, preserve entered data, and support Back without loss.
- Keep form controls simple, high-contrast, and comfortably tappable; confirmation states must accurately describe what happened and what will happen next.

### Service detail page

Recommended sequence:

**Specific problem → why teams get stuck → diagnostic scope → evidence/deliverables → ownership and next steps → fit requirements → relevant CTA.**

Avoid giant, abstract “capabilities” grids; every section must help a prospective buyer make a decision.

### Insights and resources

- Long-form article body: Tiempos Text where it improves reading; headings, labels, tables and navigation remain Graphik.
- Simple readable column, visible date and attribution, real source links, optional anchored TOC for long pieces, honest related-reading suggestions.
- Research and opinion clearly differentiated; make diagrams and evidence reproducible where possible.

### Common controls

| Control | Requirement |
|---|---|
| Primary button | Solid, compact shape, clear verb, visible focus and hover; one per decision area |
| Secondary action | Text or outlined button; never visually compete with primary CTA |
| Links | Distinguishable beyond color when embedded in copy (underline or equivalent persistent affordance) |
| Cards | Reserve for genuinely bounded information or interaction; avoid card-ifying prose |
| Accordion | Semantic `<details>` or equivalent accessible control, stable focus, clear expanded state |
| Tables | Real `<table>` for tabular evidence; proper headers; responsive overflow that remains discoverable |
| Inputs | Persistent visible labels; errors associated with controls; autocomplete where appropriate |
| Dialog/search | Focus management, inert background, Escape behavior, return focus on close |
| Tooltips | Supplemental only; core information visible without hover |
| Icons | Consistent stroke and size; decorative icons hidden from assistive tech |
| Brand/platform logos | Accurate assets, accessible names, no implied customer endorsement |

---

## 7. Responsive behavior, accessibility, and motion

### Breakpoint intent

| Range | Typical layout behavior |
|---|---|
| **< 640px** | One editorial column, stacked trace nodes, simple navigation, no horizontal text overflow |
| **640–959px** | Flexible 2-column modules only when content fits; no tiny captions or cramped diagrams |
| **960–1279px** | Wider editorial layouts and selective split compositions |
| **≥ 1280px** | Full page grid with 1–2 purposeful side rails; text columns still capped |

Breakpoints are **content-driven**, not a prescription to add framework-specific classes everywhere. Respect browser text zoom to 200% and reflow at an effective 320 CSS px viewport without losing content or functionality (except legitimately two-dimensional data).

### Accessibility baseline

- WCAG **2.2 AA** as target; test manual keyboard use, screen reader labeling, focus visibility, zoom and both themes.
- Use semantic landmarks, one logical H1 per page, correct heading order, list/table markup, descriptive link names.
- Visible focus ring on every interactive element. Do not remove focus just to match the aesthetic.
- Minimum practical interactive target around **44×44 CSS px** when feasible, with sufficient spacing; WCAG 2.2's minimum 24px target criterion does not make tiny inputs desirable.
- Preserve contrast at all states, including placeholder text, disabled appearance, error messages and dark-mode focus.
- Do not use auto-playing carousels, unexpected scroll snapping, timed interactions, or parallax as the principal means of explanation.
- Respect `prefers-reduced-motion: reduce`; all content must exist without animation or JavaScript.
- Give SVG diagrams meaningful accessible summaries and nearby text describing every consequential step. Hide duplicated decorative paths.
- Announce async form errors/success where needed and return focus appropriately.

### Motion language

- **Purpose:** signal a change of state, relationship, or hierarchy; never create spectacle.
- Default durations: **120–180ms** for control feedback, **180–260ms** for subtle panel/navigation transitions.
- Prefer opacity and transform for performance; never hide essential content behind a reveal animation.
- Brand-dot movement, if retained, must pause on focus/hover and honor reduced motion; do not make it a constant attention magnet.
- Use zero or near-zero motion on long-form reading pages.

### Performance and implementation

- Astro-first: semantic HTML and CSS for content; JavaScript only where a real interaction requires it.
- Reuse installed, properly licensed Graphik and Tiempos font subsets. Avoid loading all weights/styles up front. Set `font-display` appropriately and verify visual stability.
- Prefer inline SVG for small original diagrams; CSS for rules; native HTML for content.
- Responsive images with correct dimensions, `srcset`/`sizes` where applicable; reserve layout space.
- Avoid unnecessary third-party scripts, webfont CDNs, tracking pixels, large animation libraries and blocking overlays.
- Validate real Core Web Vitals in both mobile and desktop contexts rather than asserting performance from aesthetics alone.

---

## 8. Page composition examples (not templates to clone)

### Home page — recommended narrative rhythm

1. **Thesis:** “Fix the systems behind customer friction.” Short explanation and FitCheck™ action.
2. **Evidence:** a concise, sourced observation showing why the current way of working fails.
3. **Problem paths:** editorial comparison of the four diagnostic entry points.
4. **Method:** a signature Friction Trace with a numbered sequence of the actual approach.
5. **What the buyer receives:** evidence, decision, owner, sequenced next step; use an annotated decision brief mockup only if it accurately reflects a real deliverable.
6. **FitCheck™:** high-trust intake explanation and clear, direct action.
7. **Footer:** useful navigation, legal/privacy information, and concise point of view.

**Variation rule:** Don't render all seven sections as identical bands. Alternate between an open editorial statement, a structured comparison, one standout graphic, and a quiet conversion section. The difference should be in *composition*, not in introducing new colors or UI languages.

### Service page — business case format

Lead problem → consequences → observable signals → what the diagnostic examines → tangible outputs → likely team/owner involvement → scope limits and FAQ → action.

### Case study — evidence format

Context → observed customer friction → workflow/handoff map → root-cause hypothesis → action actually taken → accountable owner → measured outcome → limits of the evidence. No manufactured ROI or inflated claims.

### Article / insight — publication format

Title and thesis → useful executive summary → documented evidence → clear analysis → actionable implications → sources and further reading. Typography creates authority; diagrams clarify mechanics. Avoid news-site card clutter.

---

## 9. Content, voice, and trust

- Write as a knowledgeable practitioner speaking plainly to a buyer with a real constraint.
- Prefer **“I found three handoffs with no owner”** to **“unlock end-to-end transformational excellence.”**
- Use **customer**, **team**, **system**, **handoff**, **owner**, **risk**, **evidence**, **decision**, **measure** when these are accurate. Define specialized terminology on first use.
- Be explicit when something is a hypothesis rather than a proven cause.
- Keep headlines short and specific. Use clear verbs; no breathless superlatives or invented urgency.
- Describe what happens *after* the engagement as carefully as what happens at the beginning.
- Do not imply Cadence Lab operates or owns the platforms named in the enterprise logo strip, nor imply endorsement or formal partnership without evidence.
- Match claim to proof: dated external citation, approved client metrics, clearly labeled example, or identified judgment. Don't silently substitute one for another.
- Avoid “AI-powered” as decoration; explain the responsible handoff, governance boundary, human review, and practical business consequence.

---

## 10. Distinctiveness and QA gates

A section **fails** this design brief if it could be dropped unchanged into a generic agency or SaaS template.

### Required review before shipping a page

- [ ] **Logo-off test:** Remove the logo temporarily. Does the combination of Graphik composition, editorial rules, source labeling and Friction Trace vocabulary still feel recognizably Cadence?
- [ ] **Theme integrity:** Light and dark look deliberately related; all surfaces, text, rules, links, controls and marker assets are legible.
- [ ] **Brand protection:** No unapproved recoloring, new font family, dot color invention, purple tint, or imported visual brand.
- [ ] **Content-first:** Primary problem, value, action and deliverables are understandable without illustrations or animation.
- [ ] **Diagram integrity:** Every path/marker has a meaning; evidence is true or labeled illustrative; mobile has equivalent text.
- [ ] **Pattern discipline:** No repetitive equal-height SaaS-card wall; layout variation has an information-design reason.
- [ ] **Interaction QA:** Mouse, keyboard, touch, screen reader, zoom, reduced motion and form recovery work.
- [ ] **Contrast:** Verify local foreground/background pairs against WCAG AA in both themes and all states.
- [ ] **Performance:** Site does not load unnecessary JavaScript or unneeded font assets for a visual effect.
- [ ] **Commercial clarity:** Prospect can see which problem Cadence solves, what happens next, and who must be involved.

### Reject these implementation shortcuts

- Copying any external `DESIGN.md` wholesale into the project.
- Replacing the existing color tokens with Notion purple, IBM blue or The Information magenta.
- Making every panel a 24px-radius soft card with drop shadows.
- Rendering all the services as a generic “feature cards + logos + testimonials + final gradient CTA” funnel.
- Using undifferentiated hero stock photography or unsourced dashboard mockups as proof.
- Applying the yellow/approved brand dot to every icon, bullet, error, CTA, and status.
- Changing the current IA, legal copy, pricing, claim wording or theme behavior under the guise of a design refresh.

---

## 11. AI coding agent instructions

**When asked to implement a page or component in this design system:**

1. Inspect existing repo routes, typography declarations, brand assets, CSS tokens, theme implementation, and related components **before editing**. Report any unresolved palette/marker conflict; never invent a replacement color.
2. Keep existing Astro implementation conventions and accessibility behavior. Add the smallest coherent set of reusable tokens or primitives required; avoid new frontend packages unless genuinely necessary and explicitly justified.
3. Write a short design intent for the page: the user's question, editorial reading order, required evidence, one distinctive Friction Trace or structural treatment, and CTA destination.
4. Reuse the Cadence tokens and role-based typography from this document. Do not copy another company's component HTML or visual design literally.
5. Prefer original, content-specific composition over standardized SaaS blocks. A component must clarify a relationship, support a decision, or enable an interaction.
6. Implement both theme variants, narrow/mobile layout, semantic HTML, keyboard interaction, reduced-motion path, and accessible labels at the same time as the visual work.
7. Check all claims, figures, testimonials, platform associations and diagrams against actual approved content. Use clearly labeled examples for conceptual diagrams.
8. Run the available build, lint, accessibility and visual checks; document what was tested and what remains unverified. Don't claim success from a screenshot alone.
9. Provide a concise change summary: files touched, design rationale, functional/accessibility checks, and any deliberate exceptions to this document.

### Copy-ready agent prompt

```text
Read DESIGN.md and the existing Cadence Lab site/repository before editing.
Build a distinctive, editorial, systems-oriented experience for a founder-led
customer experience and AI workflow consultancy. Keep approved Cadence Lab
colors, wordmark/dot geometry, Graphik, selective Tiempos editorial text,
existing routes/content, and current functionality. Use precise grids,
restrained rules, purposeful asymmetric composition, semantic light/dark
surfaces, and original Friction Trace diagrams that expose handoffs, evidence,
decisions, owners, and measures. Prefer information over decoration.

Do not reproduce Notion, IBM, Linear or The Information branding. Do not build
generic SaaS feature cards, gradient heroes, purple/lavender surfaces, dark
fake dashboards, or invented testimonials/results. Respect WCAG 2.2 AA,
mobile-first reading order, reduced motion, and Astro-first performance.
Before writing code, identify current brand tokens and the authoritative dot
asset; if legacy blue vs. current yellow marker references conflict, preserve
the checked-in approved asset rather than inventing a hex. After changes,
validate both themes, mobile, keyboard interactions, contrast, and build.
```

---

## 12. Sources and provenance

**Cadence-specific sources:**

- Current public website and existing content architecture: https://cadencelab.co/ (reviewed 2026-11-11).
- Prior Cadence Lab `global.css` (July 2026): historical token, font, spacing, and radii reference. **Not a verified live build stylesheet**.
- Prior “Cadence Lab Typography” brief: enterprise credibility, dark/light readability, distinctiveness, Graphik/Tiempos direction.
- User's current instructions: preserve colors, Graphik, brand dot, and avoid generic design and purple/lavender; develop one cohesive site.

**Principle references, not official Cadence dependencies:**

- IBM's first-party Carbon Design System: https://carbondesignsystem.com/
- Third-party Notion reconstruction: https://www.shadcn.io/design/notion
- Third-party IBM reconstruction: https://www.shadcn.io/design/ibm
- Third-party The Information reconstruction: https://www.shadcn.io/design/the-information
- Third-party Linear reconstruction: https://github.com/Khalidabdi1/design-ai/blob/main/design-md/linear/DESIGN.md

**Governance note:** An outside `DESIGN.md` built from a brand's public website does not establish brand authorization, ownership of design assets, or licensing permission. Use principles and implement Cadence's original design.

---

**One-line standard:** *A calm, rigorous website that makes customer friction visible, its cause understandable, and the next accountable action obvious.*
