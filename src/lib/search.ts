import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export interface SearchEntry {
  title: string;
  description: string;
  category: string;
  detail?: string;
  href: string;
  searchText: string;
}

type SitePage = Omit<SearchEntry, "searchText"> & { keywords?: string };

const sitePages: SitePage[] = [
  {
    title: "Customer Experience Diagnostic Services",
    description:
      "Compare four diagnostics for customer experience systems, lifecycle risk, CRM workflows, and AI service readiness.",
    category: "Services",
    detail: "Compare diagnostics",
    href: "/services/",
    keywords: "assessment audit review find what to fix first",
  },
  {
    title: "CX Systems Diagnostic",
    description:
      "Find the source of customer friction across teams, systems, ownership, and handoffs.",
    category: "Diagnostic",
    href: "/services/cx-systems-diagnostic/",
    keywords: "customer experience service operations",
  },
  {
    title: "Lifecycle Risk Review",
    description:
      "Learn which customer signals matter, who should respond, and what to improve before renewal risk becomes urgent.",
    category: "Diagnostic",
    href: "/services/lifecycle-risk-review/",
    keywords: "retention churn adoption renewal customer success",
  },
  {
    title: "CRM Workflow Audit",
    description:
      "Find where CRM workflows, data, automation, and ownership get in the way of customer work.",
    category: "Diagnostic",
    href: "/services/crm-workflow-audit/",
    keywords: "salesforce pipeline dirty data handoff",
  },
  {
    title: "AI Service Readiness Review",
    description:
      "Review workflow, data, human oversight, governance, adoption, and measurement before you build.",
    category: "Diagnostic",
    href: "/services/ai-service-readiness-review/",
    keywords: "agent automation evaluation use case",
  },
  {
    title: "Free CX and AI Tools",
    description:
      "Use six free tools to evaluate AI use cases, map handoffs, sort feedback, review CRM data, and plan service recovery.",
    category: "Free tools",
    detail: "Browse all six",
    href: "/resources/ai-tools/",
    keywords: "resources no signup practical templates",
  },
  {
    title: "AI Use Case Stress Test",
    description:
      "Identify readiness gaps, ownership questions, failure points, and the smallest useful AI test.",
    category: "Free tool",
    href: "/resources/ai-tools/use-case-stress-test/",
    keywords: "pilot vendor platform readiness",
  },
  {
    title: "CX Handoff Mapper",
    description:
      "Map a customer journey across people, teams, and systems to find weak handoffs and missing owners.",
    category: "Free tool",
    href: "/resources/ai-tools/cx-handoff-mapper/",
    keywords: "journey duplicate work stuck cross functional",
  },
  {
    title: "AI Evaluation Builder",
    description:
      "Turn an AI task and its failure modes into a rubric, test cases, reviewer rules, and stop conditions.",
    category: "Free tool",
    href: "/resources/ai-tools/ai-evaluation-builder/",
    keywords: "quality testing governance hallucination",
  },
  {
    title: "Customer Feedback Signal Sorter",
    description:
      "Sort anonymized customer comments into recurring themes, mixed signals, and one-off observations.",
    category: "Free tool",
    href: "/resources/ai-tools/feedback-signal-sorter/",
    keywords: "voice of customer research themes comments",
  },
  {
    title: "CRM Data Health Sampler",
    description:
      "Review a CSV sample for missing values, duplicates, inconsistent formats, and fields that may not support the workflow.",
    category: "Free tool",
    href: "/resources/ai-tools/crm-data-health-sampler/",
    keywords: "dirty data csv salesforce pipeline quality",
  },
  {
    title: "Service Recovery Planner",
    description:
      "Turn a customer failure into a recovery plan with clear ownership, timing, communication, and follow-up.",
    category: "Free tool",
    href: "/resources/ai-tools/service-recovery-planner/",
    keywords: "escalation complaint response failure",
  },
  {
    title: "Customer Experience Foundations",
    description:
      "Help teams agree on what customers need, who owns each step, and what to fix first.",
    category: "Experience design",
    href: "/product/experience-foundations/",
    keywords: "strategy operating model governance alignment",
  },
  {
    title: "Digital Customer Experiences",
    description:
      "Design accessible websites, portals, apps, and digital services around real customer tasks.",
    category: "Experience design",
    href: "/product/digital-experiences/",
    keywords: "content forms interface service design website",
  },
  {
    title: "On-Site Customer Experience Design",
    description:
      "Connect arrival, physical space, frontline service, queues, accessibility, safety, and follow-up.",
    category: "Experience design",
    href: "/product/cx-on-location/",
    keywords: "location retail branch clinic venue physical",
  },
  {
    title: "AI Customer Experience Design",
    description:
      "Design AI experiences with clear roles, trustworthy context, human judgment, safe recovery, and measurable outcomes.",
    category: "Experience design",
    href: "/product/ai-experience/",
    keywords: "agent assistant chatbot automation handoff",
  },
  {
    title: "User Adoption Fatigue",
    description:
      "Find why people verify, correct, or bypass a workflow, then fix the work before asking for more adoption.",
    category: "Customer problem",
    href: "/solutions/adoption-fatigue/",
    keywords: "change resistance workaround tool overload",
  },
  {
    title: "Dirty CRM Data and Siloed Pipelines",
    description:
      "Find why CRM data, pipeline stages, integrations, and reports stay unreliable.",
    category: "Customer problem",
    href: "/solutions/dirty-data/",
    keywords: "salesforce duplicates fields reporting workflow",
  },
  {
    title: "Executive Misalignment",
    description:
      "Turn competing priorities into a clear decision, accountable ownership, and a practical operating sequence.",
    category: "Customer problem",
    href: "/solutions/misalignment/",
    keywords: "leadership strategy priorities decision rights",
  },
  {
    title: "Salesforce Tracing",
    description:
      "Follow customer work through Salesforce records, automation, ownership, handoffs, and outcomes.",
    category: "Workflow guide",
    href: "/workflows/salesforce/",
    keywords: "crm flow apex integration audit",
  },
  {
    title: "Cross-Functional Handoffs",
    description:
      "Find where customer context, ownership, or urgency gets lost between teams and systems.",
    category: "Workflow guide",
    href: "/workflows/cross-functional/",
    keywords: "handoff links departments silos collaboration",
  },
  {
    title: "Service Escalation Maps",
    description:
      "Map the conditions, ownership, authority, context, and response needed before a service issue becomes a failure.",
    category: "Workflow guide",
    href: "/workflows/escalation/",
    keywords: "sla recovery complaint support routing",
  },
  {
    title: "AI-to-Human Routing",
    description:
      "Design routing around clear boundaries, safe pauses, useful context, human authority, and accountable outcomes.",
    category: "Workflow guide",
    href: "/workflows/agent-routing/",
    keywords: "agent escalation handoff chatbot service automation",
  },
  {
    title: "AI Copilot Design",
    description:
      "Bring trusted context into real workflows, support better decisions, and keep people accountable for the outcome.",
    category: "AI tooling",
    href: "/ai-tooling/co-pilot/",
    keywords: "assistant agent context decision support",
  },
  {
    title: "PII Scrubbing for AI Workflows",
    description:
      "Reduce unnecessary personal data in AI workflows with clear boundaries, tested transformations, and accountable review.",
    category: "AI tooling",
    href: "/ai-tooling/compliance/",
    keywords: "privacy compliance masking redaction personal information",
  },
  {
    title: "AI Hallucination and Variance Testing",
    description:
      "Trace unreliable AI outputs across sources, retrieval, models, tools, and human review.",
    category: "AI tooling",
    href: "/ai-tooling/hallucination/",
    keywords: "evaluation reliability wrong answer quality testing",
  },
  {
    title: "Prompt Injection Controls",
    description:
      "Reduce prompt injection risk with clear trust boundaries, limited permissions, enforceable policy, and adversarial testing.",
    category: "AI tooling",
    href: "/ai-tooling/prompt-guard/",
    keywords: "security firewall guardrails approval permissions",
  },
  {
    title: "FitCheck™ Decision Brief",
    description:
      "Get a free, human-reviewed decision brief on the likely constraint behind your CX, CRM, workflow, or AI problem and what to do next.",
    category: "Start here",
    href: "/fit-check/",
    keywords: "fit check engagement assessment contact help project readiness",
  },
  {
    title: "About Matt Rabah and Cadence Lab",
    description:
      "Meet Cadence Lab founder Matt Rabah and learn how he approaches customer experience, CRM workflow, and AI problems.",
    category: "About",
    href: "/about/",
    keywords: "founder experience background company",
  },
  {
    title: "Contact Matt Rabah",
    description:
      "Share a customer experience, lifecycle risk, CRM workflow, or AI readiness problem and get a direct response.",
    category: "Contact",
    href: "/contact/",
    keywords: "email conversation get in touch hire",
  },
];

const getPostURL = (post: BlogPost): string => {
  const year = String(post.data.date.getUTCFullYear());
  const month = String(post.data.date.getUTCMonth() + 1).padStart(2, "0");
  const slug = post.id
    .replace(/\.(md|mdx)$/i, "")
    .split("/")
    .filter(Boolean)
    .at(-1);

  if (!slug) {
    throw new Error(`Unable to determine a slug for blog entry: ${post.id}`);
  }

  return `/blog/${year}/${month}/${slug}/`;
};

export const getSearchEntries = async (): Promise<SearchEntry[]> => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const insightEntries = posts
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((post) => {
      const description = post.data.description ?? post.data.subtitle;

      return {
        title: post.data.title,
        description,
        category: post.data.category,
        detail: post.data.readTime,
        href: getPostURL(post),
        searchText: [
          post.data.title,
          post.data.subtitle,
          description,
          post.data.category,
          post.data.author,
        ]
          .join(" ")
          .toLocaleLowerCase(),
      };
    });

  const pageEntries = sitePages.map(({ keywords, ...page }) => ({
    ...page,
    searchText: [page.title, page.description, page.category, keywords]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase(),
  }));

  return [...pageEntries, ...insightEntries];
};
