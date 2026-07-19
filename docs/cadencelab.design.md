---
name: Cadence Lab Design System
version: 0.1.0
status: review-draft
updated: 2026-07-19
scope: cadencelab.co marketing, insights, and engagement-intake experiences
authority:
  - existing Cadence Lab brand tokens and type roles
  - validated UX and accessibility requirements
  - selected patterns from the reference systems listed below
references:
  primary:
    - Dropbox
    - Gamma
    - Apple
    - Nordstrom
  task_specific:
    - Progressive
    - Airbnb
    - "Lowe's"
---

# Cadence Lab Design System

## Status and purpose

This document is the proposed source of truth for Cadence Lab's visual and interaction system. It defines what future pages and components should become; it does not claim that the current site already conforms.

The system should make Cadence Lab feel like a rigorous operating partner for complex customer-experience, CRM, workflow, and responsible-AI work. It should be clinical without being sterile, editorial without being ornamental, and distinctive without relying on novelty.

This review draft does not authorize changes to production pages, components, content models, or CSS. Implementation should begin only after this specification is approved and should occur in small, independently validated stages.

## Source hierarchy

Cadence Lab's own identity is authoritative. Reference sites provide patterns, not a replacement brand.

1. **Cadence Lab** supplies the fonts, colors, voice, offer strategy, content, and accessibility obligations.
2. **Dropbox** supplies the strongest overall visual chassis: clear section bands, disciplined calls to action, generous composition, and credible evidence presentation.
3. **Gamma** supplies modular presentation for diagnostic offers and an appropriate sense of AI-era momentum.
4. **Apple** supplies hierarchy, pacing, responsive simplification, and interaction restraint.
5. **Nordstrom** supplies editorial restraint for insights, case studies, and research-led storytelling.
6. **Progressive** supplies conversion architecture for the fit check and other inquiry flows.
7. **Airbnb** supplies mobile ergonomics, reassurance, and form clarity.
8. **Lowe's** supplies information architecture patterns only when the resource library becomes complex enough to require deeper taxonomy.

### Borrow and avoid

| Reference | Borrow | Avoid |
| --- | --- | --- |
| Dropbox | Section rhythm, strong CTA zones, evidence bands, practical warmth | Copying its palette, illustration language, or playful brand personality |
| Gamma | Modular offer grid, concise benefit framing, purposeful energy | Pastel overload, oversized type, excessive rounding, trend-led effects |
| Apple | Deliberate hierarchy, progressive disclosure, responsive focus | Product-theater minimalism that removes necessary operational context |
| Nordstrom | Editorial pacing, image restraint, quiet typography | Retail merchandising conventions and fashion-led art direction |
| Progressive | Clear step sequence, expectation setting, completion support | Insurance visual language, promotional urgency, dense quoting patterns |
| Airbnb | Touch ergonomics, form reassurance, mobile clarity | Marketplace cards, pill-heavy controls, consumer softness |
| Lowe's | Scalable navigation and taxonomy | Retail density, utility-blueprint aesthetics, large catalog behavior before needed |

Do not average the references into a generic design. Choose one best pattern for each user need, then render it through Cadence Lab's tokens and voice.

### Baymard benchmark lens

Baymard's research is used here as behavioral evidence, not as a direction to make Cadence Lab resemble an ecommerce site. Translate the relevant benchmark qualities into Cadence's context:

- product finding becomes rapid identification of the right diagnostic offer;
- product comparison becomes clear differentiation among engagements;
- checkout completion becomes fit-check or inquiry completion;
- account reassurance becomes clarity about process, privacy, timing, and next steps;
- catalog navigation becomes findable services, insights, and evidence;
- cross-device shopping continuity becomes an equally coherent mobile and desktop decision path.

Do not import merchandising density, promotional urgency, cart patterns, or retail visual conventions unless they solve a demonstrated Cadence user need.

## Experience principles

### 1. Diagnose before explaining the methodology

Lead with the problem a buyer recognizes and the diagnostic engagement that creates a useful next step. The operating model supports the offer; it does not replace it.

### 2. Make complexity legible

Use hierarchy, sequencing, and plain language to reveal relationships among customer friction, ownership, data, workflow, adoption, and outcomes. Do not simulate sophistication with density.

### 3. Evidence earns attention

Prefer concrete operating signals, outcomes, decision criteria, and useful examples over decorative claims. Evidence sections should feel structurally distinct, not louder.

### 4. Restraint signals confidence

Use a limited palette, nearly square corners, hairline borders, and little or no shadow. Avoid decorative gradients, glass effects, floating cards, and gratuitous animation.

### 5. Every path has a clear next step

Navigation, content pages, diagnostic offers, and inquiry flows should each make the next useful action obvious without repeating primary buttons throughout the viewport.

### 6. Accessibility is part of the visual system

Semantic structure, keyboard operation, visible focus, readable measure, sufficient contrast, touch size, and reduced-motion behavior are design requirements.

## Brand foundation

### Positioning

Cadence Lab designs practical operating systems for customer experience, CRM workflows, and responsible AI adoption. The work connects strategy to ownership, data, frontline behavior, and measurable outcomes.

### Offer architecture

Use diagnostic offers as primary entry points:

- CX Systems Diagnostic
- Lifecycle Risk Review
- CRM Workflow Audit
- AI Service Readiness Review

Each offer should answer, in order:

1. What costly or consequential problem does it expose?
2. Who should recognize themselves in the situation?
3. What does Cadence Lab examine?
4. What concrete output or decision does the buyer receive?
5. What is the appropriate next step?

The operating model appears after the offers to demonstrate how Cadence Lab works across diagnosis, workflow design, adoption, governance, and measurement.

### Voice

The voice is direct, candid, specific, and operationally literate.

Use:

- concrete nouns and active verbs;
- recognizable organizational constraints;
- precise consequences and decisions;
- short labels and informative headings;
- honest disqualification when the engagement is not a fit.

Avoid:

- generic transformation language;
- unexplained AI terminology;
- claims such as "revolutionary," "seamless," or "best-in-class";
- capability inventories presented without buyer context;
- artificial urgency or inflated certainty.

## Color system

These values preserve the current validated Cadence Lab palette.

| Role | Token | Value | Primary use |
| --- | --- | --- | --- |
| Ink | `--color-ink` | `#000504` | Primary text, inverse surfaces |
| Light | `--color-light` | `#fcfeff` | Main canvas, inverse text |
| Cobalt | `--color-blue` | `#1823c9` | Links, focus, selected states, primary accent |
| Green | `--color-green` | `#4fd34a` | Sparse positive signal and proof accent |
| Muted text | `--color-text-muted` | `#6c6f6f` | Supporting copy and metadata |
| Pure surface | `--color-surface-pure` | `#ffffff` | Cards and form fields when separation is needed |
| Subtle surface | `--color-surface-subtle` | `#f4f7f8` | Section alternation |
| Muted surface | `--color-surface-muted` | `#eaf0f2` | Secondary emphasis and grouped content |
| Border | `--color-border` | `#d8e0df` | Hairlines and default field borders |
| Strong border | `--color-border-strong` | `#aab5b2` | Emphasized boundaries and controls |
| Error | `--color-error` | `#b42318` | Errors only |
| Success | `--color-success` | `#16794a` | Confirmed success messages |
| Warning | `--color-warning` | `#9a6700` | Warnings requiring attention |

### Color rules

- Default to light or pure-white surfaces with ink text.
- Use ink inverse bands to create evidence, case-study, or concluding emphasis.
- Use cobalt for interaction and selective editorial emphasis, not as a large default background.
- Reserve bright green for small positive signals; never use it as routine decoration.
- Never communicate status by color alone. Pair it with text, an icon, or both.
- Validate every text/background combination against WCAG contrast requirements.
- Do not introduce secondary brand colors until a real content or interaction need survives review.

## Typography

### Font roles

| Role | Family | Use |
| --- | --- | --- |
| Sans | Graphik | UI, navigation, marketing headings, body copy, buttons, forms |
| Editorial display | Tiempos Headline | Pull quotes, selective editorial accents, case-study moments |
| Editorial text | Tiempos Text | Long-form insight and article prose |
| Utility accent | Produkt | Eyebrows, labels, metadata, compact utility text |

Graphik remains the default outside deliberate editorial scopes. Tiempos is not a substitute for everyday marketing body copy.

Produkt is an intended role, not yet a registered font in the current project. A later implementation may enable it only after the licensed webfont assets and permitted formats are confirmed. Until then, labels remain Graphik; do not use a visually similar unlicensed substitute.

### Existing type scale

| Role | Token | Size |
| --- | --- | --- |
| Display | `--fs-display` | `clamp(2.5rem, 2.09rem + 1.77vw, 3.5rem)` |
| Section heading | `--fs-h2` | `clamp(1.75rem, 1.54rem + 0.88vw, 2.25rem)` |
| Card heading | `--fs-h3` | `clamp(1.3125rem, 1.24rem + 0.33vw, 1.5rem)` |
| Minor heading | `--fs-h4` | `clamp(1.0625rem, 1.04rem + 0.11vw, 1.125rem)` |
| UI body | `--fs-body-ui` | `clamp(1rem, 0.97rem + 0.11vw, 1.0625rem)` |
| Eyebrow | `--fs-eyebrow` | `0.8125rem` |
| Small | `--fs-small` | `0.875rem` |
| Article title | `--fs-post-title` | `clamp(2rem, 1.69rem + 1.33vw, 2.75rem)` |
| Article body | `--fs-post-body` | `clamp(1.125rem, 1.1rem + 0.11vw, 1.1875rem)` |

### Typography rules

- Use sentence case for headings, navigation, buttons, and labels.
- Keep primary marketing headings near `26ch` or less; do not force unnatural line breaks.
- Keep UI copy near `60ch` and editorial prose near `70ch`.
- Use balanced wrapping only on short headings and pretty wrapping as progressive enhancement for body copy.
- Use uppercase sparingly for eyebrows and compact metadata, with deliberate tracking.
- Use tabular numerals for statistics, steps, dates in aligned lists, and comparable metrics.
- Preserve browser zoom and user font-size preferences by using relative units.
- Do not add ultra-light UI text, condensed display text, or oversized type solely for visual drama.

## Layout and rhythm

### Containers

| Role | Token | Maximum |
| --- | --- | --- |
| Page | `--container-page` | `80rem` |
| Wide media/data | `--container-wide` | `90rem` |
| Focused header | `--container-header` | `56rem` |
| Copy | `--container-copy` | `66ch` |
| Narrow copy | `--container-copy-narrow` | `58ch` |

Use `--page-gutter: clamp(1.25rem, 4vw, 3rem)` for consistent page edges. Full-bleed surface bands may span the viewport, but their content remains container-aligned.

### Spacing

Use the existing spacing scale from `--space-1` (`0.25rem`) through `--space-24` (`6rem`). Prefer semantic rhythm over selecting a different arbitrary value for each component.

- Inline icon/text gaps: `--space-2` to `--space-3`.
- Control and compact card gaps: `--space-3` to `--space-5`.
- Content-group gaps: `--space-6` to `--space-10`.
- Section-internal spacing: `--space-10` to `--space-16`.
- Major section separation: `--space-16` to `--space-24`, fluid where useful.

### Grid behavior

- Build mobile-first, then add columns when content can remain readable without compression.
- Use two columns for a meaningful relationship, such as problem and evidence or heading and explanation.
- Use three or four columns only for genuinely parallel diagnostic offers, steps, or proof points.
- Allow cards to stack before their text measure or tap targets become compromised.
- Keep DOM order aligned with visual order at every breakpoint.
- Avoid masonry layouts for primary information.

### Section rhythm

A typical high-intent page should move through:

1. Context and promise
2. Diagnostic offers
3. Consequences or evidence
4. Operating model
5. Fit criteria or proof
6. Clear next step

Alternate surface tone only when it helps a user perceive a new job in the page. Do not stripe every section automatically.

## Shape, borders, and depth

- Default corners are square or nearly square: `2px` to `4px`.
- Use `8px` only where a larger interactive surface benefits from slight softening.
- Reserve pill geometry for compact status markers, not buttons, cards, inputs, or navigation containers.
- Use `1px` borders for structure.
- Prefer surface contrast and borders over shadows.
- If a shadow is necessary for a temporary overlay, use the lightest existing token that establishes stacking.
- Never use blurred colored shadows, decorative gradients, glassmorphism, or floating card stacks.

## Iconography and imagery

### Iconography

- Use simple line icons only when they improve recognition or clarify an action.
- Keep icon weight optically compatible with borders and type.
- Pair unfamiliar icons with visible text.
- Use decorative icons with `aria-hidden="true"`; give icon-only controls an accessible name.
- Do not use mixed icon families or illustrations as filler.

### Imagery

- Prefer evidence-bearing imagery: operating diagrams, annotated workflows, real working artifacts, restrained portraits, or purposeful editorial photography.
- Avoid generic AI imagery, glowing brains, robots, abstract neural networks, and staged corporate handshakes.
- Define intrinsic `width` and `height` to prevent layout shift.
- Provide useful alternative text for informative images and empty alt text for decorative images.
- Use responsive sources and modern formats where practical.
- Prioritize only the likely largest-contentful image; lazy-load offscreen images.

## Component specifications

### Navigation

- Keep the top-level information architecture concise: Services, Insights, About, and one engagement action.
- Use a visible wordmark/home link and a persistent but visually restrained primary action.
- Indicate the current page with more than color alone.
- Desktop menus open predictably by click and keyboard; mobile navigation uses a clear disclosure pattern.
- Search belongs in navigation only if the insight library is large enough to justify it.
- Avoid mega-menu complexity until the content taxonomy requires it.

### Buttons and links

Primary button:

- one per decision area;
- cobalt or ink with high-contrast text;
- compact radius, clear verb, no decorative icon required;
- minimum target size `44px`, preferably `48px` for primary mobile actions.

Secondary button:

- outlined or quiet surface treatment;
- equal target size but lower visual priority;
- never styled so similarly that hierarchy becomes ambiguous.

Text link:

- visibly identifiable without relying on color alone;
- underlined in prose;
- optional directional arrow for forward navigation, never as the only label.

Use specific labels such as "Start a fit check," "Review the diagnostic," or "Read the analysis." Avoid "Learn more" when a clearer destination exists.

### Hero

- Use one eyebrow, one direct heading, one concise explanation, and one primary next step.
- Keep the heading outcome-oriented and the body operationally specific.
- Use a second action only when it serves a distinct user intent.
- Do not place multiple decorative cards around the hero.
- If imagery is used, it must explain the work or establish credible context.

### Diagnostic offer grid

This is the central services pattern.

Each offer card includes:

1. Diagnostic name
2. Recognizable problem or trigger
3. What is examined
4. Concrete output or decision
5. Link to the full offer or fit check

Cards should share structure and comparable density. Differentiate them through content and restrained signal, not unrelated colors. On small screens, stack them in the most commercially useful order.

### Evidence band

- Use a light, muted, or ink surface to separate proof from promise.
- Show outcomes, observable signals, short case evidence, or a clear operating artifact.
- Label the scope and source of statistics.
- Avoid logo walls without context and testimonials that make broad, unverifiable claims.
- Use tabular numerals when metrics are compared.

### Operating model

- Present three to five sequential stages at most.
- Use an ordered list in markup.
- Name each stage with a verb and describe the decision or artifact it produces.
- Show that diagnosis precedes workflow change and that measurement continues after launch.
- Do not present the model before users understand the offer and its relevance.

### Case study

- Lead with the operating problem, not the client biography.
- Distinguish situation, constraints, intervention, evidence, and result.
- Use diagrams or artifacts when they make the system easier to understand.
- State limitations and the measurement period when relevant.
- End with the decision the example helps a prospective client make.

### Insights and editorial content

- Use Tiempos Text for long-form prose and Graphik for navigation, metadata, headings, and controls.
- Keep article pages quiet, readable, and largely single-column.
- Use a table of contents only when article length and heading structure warrant it.
- Make author, publish date, update date, and topic metadata easy to locate.
- Related content should be selective and topic-relevant, not an infinite feed.

### Fit check and inquiry flow

Use a single-column form and disclose why each category of information is needed.

- Use a semantic `<form>` with an appropriate `method` and `action`.
- Every control has a persistent visible label and stable `name`.
- Group related choices with `<fieldset>` and `<legend>`.
- Connect help and errors with `aria-describedby`.
- Use `autocomplete`, `inputmode`, and native input types where applicable.
- Keep form control text at least `16px` to prevent mobile zoom.
- Use native constraints as the first layer; server-side validation remains authoritative.
- Validate on blur and submit, then clear an error as the user corrects the field.
- Focus the error summary or first invalid field after an unsuccessful submission.
- Do not disable the submit button before validation. Disable it only after a valid submission is underway to prevent duplicates.
- Preserve entered values after a recoverable error.
- Confirm what happens next, the expected response window, and how information will be used.

### Footer

- Provide concise navigation, legal/privacy access, and a final low-pressure engagement route.
- The footer may use the inverse ink surface but should not become a second homepage.
- Keep contact and copyright information explicit.
- Do not repeat every page section or add a large newsletter module without a defined content program.

## Responsive behavior

Design for content needs rather than device labels. Use breakpoints where the layout stops being legible or operable.

- Start at a supported minimum viewport width of `20rem`.
- Collapse multi-column content before headings, forms, or tap targets become cramped.
- Keep at least the page gutter between content and viewport edges.
- Prefer `44px` minimum touch targets and `48px` for prominent actions.
- Keep related controls close enough to read as a group without making targets overlap.
- Do not hide substantive content on mobile merely to shorten the page.
- Avoid horizontal scrolling except for intentionally scrollable data tables with clear affordance.
- Test reflow at high browser zoom, not just named viewport presets.

## Accessibility and interaction

### Document structure

- Use one descriptive `h1` and a logical heading hierarchy.
- Use `header`, `nav`, `main`, `section`, `article`, `aside`, and `footer` according to meaning.
- Label repeated navigation regions.
- Provide a skip link that becomes visible on focus.
- Use lists for collections and ordered lists for sequences.
- Prefer native HTML behavior over custom ARIA widgets.

### Keyboard and focus

- Every interactive element must work with the keyboard.
- Use `:focus-visible` with the existing `2px` cobalt ring and `3px` offset.
- Never remove focus without an equally visible replacement.
- Do not use positive `tabindex` values.
- Do not create a visual order that conflicts with DOM/tab order.
- Return focus sensibly when a menu, dialog, or disclosure closes.

### Motion

- Motion communicates state or spatial relationship; it is not ambient decoration.
- Use existing `150ms` and `220ms` transitions for simple state changes.
- Avoid large parallax, scroll-jacking, looping effects, and entrance animation on essential content.
- Under `prefers-reduced-motion: reduce`, remove nonessential animation and smooth scrolling.
- No meaning or action may depend on motion alone.

### Overlays and disclosures

- Prefer native `<details>` for simple disclosure and `<dialog>` for modal interaction where appropriate.
- Dialogs need a visible title, an explicit close action, contained focus, Escape behavior, and focus restoration.
- Do not use a modal when an inline section or separate page would be clearer.

### Manual verification

Automated checks are necessary but insufficient. Every implemented pattern should be reviewed with keyboard-only navigation, browser zoom/reflow, reduced motion, and at least one screen-reader pass for critical paths.

## Performance requirements

- Default to Astro-rendered HTML and CSS; add client-side JavaScript only for a defined interaction.
- Keep static content usable when client-side scripts fail.
- Prevent layout shift with intrinsic media dimensions and stable component geometry.
- Load only the font weights and styles actually used.
- Prefer CSS for visual state and layout; avoid JavaScript-driven styling.
- Do not add a component library for patterns already supported by semantic HTML and local CSS.
- Treat third-party scripts as budgeted dependencies with a documented user or business purpose.

## Page-level patterns

### Homepage

1. Direct operating promise
2. Diagnostic offer entry points
3. Consequences or evidence
4. Supporting operating model
5. Fit criteria
6. Fit-check call to action

Primary visual reference: Dropbox. Offer module reference: Gamma. Responsive discipline: Apple.

### Services overview

1. Buyer problem and stakes
2. Four diagnostic offers
3. Comparison or selection guidance
4. Operating model
5. Evidence or case example
6. Fit check

Do not lead with a broad capabilities inventory.

### Diagnostic detail

1. Recognizable trigger
2. Questions the diagnostic answers
3. Scope and evidence examined
4. Deliverables and decisions
5. Who it is and is not for
6. Next step

### Insight article

1. Article metadata and clear title
2. Concise premise
3. Readable editorial body
4. Useful diagrams, examples, or evidence
5. Author/source context
6. One relevant continuation path

Primary visual references: Nordstrom and Apple.

### Fit check

1. Purpose and expected outcome
2. Privacy and time expectation
3. Single-column grouped form
4. Review/submit state
5. Confirmation and response expectation

Primary interaction references: Progressive and Airbnb.

## Content and interface checklist

Before approving a page design, confirm:

- The buyer can identify the page's purpose from the heading and lead.
- The primary action describes its destination or outcome.
- Claims are supported by evidence or framed with appropriate limits.
- Offer content precedes methodology where purchase intent is high.
- Headings are informative when read out of context.
- Cards represent parallel items rather than unrelated content forced into a grid.
- Mobile order matches importance.
- Forms explain why sensitive or effortful information is requested.
- Empty, loading, success, and error states are defined where applicable.
- The experience remains understandable without animation or decorative imagery.

## Implementation sequence after approval

This sequence is deliberately outside the scope of this documentation branch.

1. Reconcile approved specification with existing global tokens.
2. Register Produkt only if licensed assets are confirmed; otherwise retain Graphik labels.
3. Build and validate foundational primitives: containers, section rhythm, buttons, links, fields, cards.
4. Implement navigation and footer patterns.
5. Implement diagnostic offer and evidence modules.
6. Refactor the homepage and services flow.
7. Refine fit-check interaction and validation states.
8. Apply the editorial pattern to insights and case studies.
9. Perform accessibility, responsive, performance, and browser validation.

Each stage should be a focused branch or commit with a visible before/after review. Do not combine the entire redesign with content-model or dependency work.

## Review decisions required

Before implementation begins, approve or revise:

1. The four diagnostic offers and their order.
2. Dropbox as the primary homepage/services visual reference.
3. The restrained use of cobalt and green.
4. The font roles, including whether licensed Produkt webfont assets are available.
5. The default square-to-`4px` corner policy.
6. The proposed homepage and services page sequences.
7. The evidence types Cadence Lab can substantiate at launch.
8. Whether the current content library justifies persistent search or complex resource navigation.

## Non-goals

This system does not attempt to:

- recreate any reference website;
- make Cadence Lab resemble an ecommerce marketplace;
- add animation, illustrations, or UI complexity for novelty;
- replace the current brand palette or primary font roles;
- introduce a generalized component library before actual page needs are known;
- claim outcomes that Cadence Lab cannot substantiate.
