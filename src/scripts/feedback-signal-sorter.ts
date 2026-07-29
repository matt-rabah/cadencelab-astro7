type Direction = "Positive" | "Negative" | "Mixed" | "Unclear";

type ThemeDefinition = {
  name: string;
  description: string;
  keywords: string[];
};

type ThemeResult = ThemeDefinition & {
  comments: string[];
  direction: Direction;
};

type TermResult = {
  term: string;
  count: number;
};

type FeedbackSummary = {
  name: string;
  comments: string[];
  threshold: number;
  themes: ThemeResult[];
  recurringThemes: ThemeResult[];
  otherComments: string[];
  repeatedTerms: TermResult[];
  questions: string[];
};

export {};

const themes: ThemeDefinition[] = [
  {
    name: "Access and effort",
    description:
      "Finding, starting, or completing the experience requires more or less effort than expected.",
    keywords: [
      "access",
      "difficult",
      "easy",
      "effort",
      "find",
      "hard",
      "login",
      "navigate",
      "simple",
      "signin",
      "steps",
    ],
  },
  {
    name: "Reliability and performance",
    description:
      "Speed, availability, errors, or dependable operation shape the experience.",
    keywords: [
      "broken",
      "bug",
      "crash",
      "error",
      "fast",
      "freeze",
      "reliable",
      "slow",
      "speed",
      "unavailable",
      "works",
      "working",
    ],
  },
  {
    name: "Communication and clarity",
    description:
      "Instructions, status, expectations, or explanations are helping or creating uncertainty.",
    keywords: [
      "clear",
      "communication",
      "confusing",
      "explain",
      "instructions",
      "message",
      "status",
      "unclear",
      "understand",
      "update",
    ],
  },
  {
    name: "Support and recovery",
    description:
      "Help, response, escalation, or resolution affects what happens after a problem.",
    keywords: [
      "agent",
      "escalation",
      "fixed",
      "help",
      "representative",
      "resolve",
      "resolved",
      "response",
      "service",
      "support",
    ],
  },
  {
    name: "Product and service fit",
    description:
      "Features, options, usefulness, or missing capabilities affect whether the offer fits the need.",
    keywords: [
      "feature",
      "missing",
      "need",
      "option",
      "product",
      "service",
      "useful",
      "useless",
    ],
  },
  {
    name: "Billing and value",
    description:
      "Price, charges, refunds, or perceived value shape the customer response.",
    keywords: [
      "billing",
      "charge",
      "cost",
      "expensive",
      "fee",
      "price",
      "refund",
      "value",
    ],
  },
  {
    name: "Trust and privacy",
    description:
      "Confidence, security, privacy, or data handling affects willingness to continue.",
    keywords: [
      "confidence",
      "data",
      "privacy",
      "safe",
      "secure",
      "security",
      "trust",
    ],
  },
];

const positiveTerms = new Set([
  "clear",
  "easy",
  "excellent",
  "fast",
  "fixed",
  "good",
  "great",
  "helpful",
  "love",
  "reliable",
  "resolved",
  "simple",
  "useful",
  "works",
]);

const negativeTerms = new Set([
  "bad",
  "broken",
  "confusing",
  "crash",
  "difficult",
  "error",
  "expensive",
  "frustrating",
  "hard",
  "hate",
  "missing",
  "slow",
  "unclear",
  "unhelpful",
  "unreliable",
  "useless",
]);

const stopWords = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "been",
  "before",
  "but",
  "can",
  "could",
  "did",
  "does",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "into",
  "its",
  "just",
  "like",
  "more",
  "most",
  "not",
  "our",
  "out",
  "really",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "they",
  "this",
  "too",
  "very",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "with",
  "would",
  "you",
  "your",
]);

const form = document.querySelector<HTMLFormElement>("#feedback-form");
const commentsInput =
  document.querySelector<HTMLTextAreaElement>("#feedback-comments");
const results = document.querySelector<HTMLElement>("#feedback-results");
const resultsTitle = document.querySelector<HTMLElement>("#results-title");
const status = document.querySelector<HTMLElement>("#feedback-status");
const recurringContainer =
  document.querySelector<HTMLElement>("#recurring-themes");
const repeatedTermsList =
  document.querySelector<HTMLUListElement>("#repeated-terms");
const otherSignalsList =
  document.querySelector<HTMLUListElement>("#other-signals");
const questionsList = document.querySelector<HTMLUListElement>(
  "#research-questions",
);
const copyButton = document.querySelector<HTMLButtonElement>("#copy-summary");
const downloadButton =
  document.querySelector<HTMLButtonElement>("#download-summary");
const printButton = document.querySelector<HTMLButtonElement>("#print-summary");
const resetButton = document.querySelector<HTMLButtonElement>("#start-over");

let currentSummary: FeedbackSummary | null = null;

const readValue = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();

const tokenize = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/sign[\s-]?in/g, "signin")
    .match(/[\p{L}\p{N}']+/gu)
    ?.map((term) => term.replace(/^'+|'+$/g, ""))
    .filter(Boolean) ?? [];

const readComments = (value: string) =>
  value
    .split(/\r?\n/)
    .map((comment) => comment.trim())
    .filter(Boolean)
    .slice(0, 100);

const directionForComments = (comments: string[]): Direction => {
  let hasPositive = false;
  let hasNegative = false;

  comments.forEach((comment) => {
    const terms = tokenize(comment);
    if (terms.some((term) => positiveTerms.has(term))) hasPositive = true;
    if (terms.some((term) => negativeTerms.has(term))) hasNegative = true;
  });

  if (hasPositive && hasNegative) return "Mixed";
  if (hasPositive) return "Positive";
  if (hasNegative) return "Negative";
  return "Unclear";
};

const analyzeTheme = (
  definition: ThemeDefinition,
  comments: string[],
  ignoredTerms: Set<string>,
): ThemeResult => {
  const keywords = definition.keywords.filter(
    (keyword) => !ignoredTerms.has(keyword),
  );
  const matchedComments = comments.filter((comment) => {
    const terms = new Set(tokenize(comment));
    return keywords.some((keyword) => terms.has(keyword));
  });

  return {
    ...definition,
    comments: matchedComments,
    direction: directionForComments(matchedComments),
  };
};

const findRepeatedTerms = (
  comments: string[],
  ignoredTerms: Set<string>,
): TermResult[] => {
  const counts = new Map<string, number>();

  comments.forEach((comment) => {
    const uniqueTerms = new Set(
      tokenize(comment).filter(
        (term) =>
          term.length > 2 &&
          !stopWords.has(term) &&
          !ignoredTerms.has(term) &&
          !/^\d+$/.test(term),
      ),
    );
    uniqueTerms.forEach((term) =>
      counts.set(term, (counts.get(term) ?? 0) + 1),
    );
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )
    .slice(0, 8)
    .map(([term, count]) => ({ term, count }));
};

const buildQuestions = (
  recurringThemes: ThemeResult[],
  otherComments: string[],
): string[] => {
  const questions = recurringThemes.slice(0, 4).map((theme) => {
    if (theme.direction === "Mixed") {
      return `What differs between customers reporting positive and negative experiences with ${theme.name.toLocaleLowerCase()}?`;
    }
    return `At which journey step does ${theme.name.toLocaleLowerCase()} become most important, and what evidence would explain why?`;
  });

  if (otherComments.length > 0) {
    questions.push(
      "Do the one-off or unmatched comments describe an emerging issue, a distinct customer segment, or language the sorting rules missed?",
    );
  }

  if (questions.length === 0) {
    questions.push(
      "Would a larger or more deliberately sampled set reveal a recurring pattern?",
      "Which words do customers use for this experience that the fixed theme list may not recognize?",
    );
  }

  return questions;
};

const buildSummary = (data: FormData): FeedbackSummary => {
  const name = readValue(data, "analysis-name");
  const comments = readComments(readValue(data, "feedback-comments"));
  const threshold = Number(readValue(data, "minimum-mentions")) || 2;
  const ignoredTerms = new Set(
    readValue(data, "ignored-terms")
      .split(",")
      .flatMap((term) => tokenize(term))
      .filter(Boolean),
  );
  const themeResults = themes.map((theme) =>
    analyzeTheme(theme, comments, ignoredTerms),
  );
  const recurringThemes = themeResults
    .filter((theme) => theme.comments.length >= threshold)
    .sort(
      (left, right) =>
        right.comments.length - left.comments.length ||
        left.name.localeCompare(right.name),
    );
  const recurringComments = new Set(
    recurringThemes.flatMap((theme) => theme.comments),
  );
  const otherComments = comments.filter(
    (comment) => !recurringComments.has(comment),
  );

  return {
    name,
    comments,
    threshold,
    themes: themeResults,
    recurringThemes,
    otherComments,
    repeatedTerms: findRepeatedTerms(comments, ignoredTerms),
    questions: buildQuestions(recurringThemes, otherComments),
  };
};

const setOutput = (name: string, value: string) => {
  document
    .querySelectorAll<HTMLElement>(`[data-output="${name}"]`)
    .forEach((element) => {
      element.textContent = value;
    });
};

const replaceList = (list: HTMLElement | null, items: string[]) => {
  if (!list) return;
  list.replaceChildren(
    ...items.map((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      return listItem;
    }),
  );
};

const themeCard = (theme: ThemeResult) => {
  const article = document.createElement("article");
  article.className = "theme-card";

  const heading = document.createElement("div");
  heading.className = "theme-card-heading";

  const title = document.createElement("h4");
  title.textContent = theme.name;

  const count = document.createElement("p");
  count.className = "theme-count";
  count.textContent = `${theme.comments.length} ${theme.comments.length === 1 ? "mention" : "mentions"}`;

  heading.append(title, count);

  const description = document.createElement("p");
  description.className = "theme-description";
  description.textContent = theme.description;

  const direction = document.createElement("p");
  direction.className = "theme-direction";
  const directionLabel = document.createElement("strong");
  directionLabel.textContent = "Signal direction: ";
  direction.append(directionLabel, theme.direction);

  const evidenceTitle = document.createElement("h5");
  evidenceTitle.textContent = "Supporting comments";

  const evidence = document.createElement("ul");
  theme.comments.slice(0, 4).forEach((comment) => {
    const item = document.createElement("li");
    item.textContent = `“${comment}”`;
    evidence.append(item);
  });

  article.append(heading, description, direction, evidenceTitle, evidence);
  return article;
};

const renderSummary = (summary: FeedbackSummary) => {
  setOutput("analysis-name", summary.name);
  setOutput("comment-count", String(summary.comments.length));
  setOutput("theme-count", String(summary.recurringThemes.length));
  setOutput(
    "mixed-count",
    String(
      summary.recurringThemes.filter((theme) => theme.direction === "Mixed")
        .length,
    ),
  );
  setOutput("unmatched-count", String(summary.otherComments.length));

  if (recurringContainer) {
    if (summary.recurringThemes.length > 0) {
      recurringContainer.replaceChildren(
        ...summary.recurringThemes.map(themeCard),
      );
    } else {
      const note = document.createElement("p");
      note.className = "empty-note";
      note.textContent = `No fixed theme reached ${summary.threshold} mentions. That does not mean the comments lack value; review the language and one-off signals below.`;
      recurringContainer.replaceChildren(note);
    }
  }

  if (repeatedTermsList) {
    if (summary.repeatedTerms.length > 0) {
      repeatedTermsList.replaceChildren(
        ...summary.repeatedTerms.map(({ term, count }) => {
          const item = document.createElement("li");
          const termText = document.createElement("span");
          termText.textContent = term;
          const countText = document.createElement("strong");
          countText.textContent = `${count} comments`;
          item.append(termText, countText);
          return item;
        }),
      );
    } else {
      replaceList(repeatedTermsList, [
        "No non-trivial term appeared in more than one comment.",
      ]);
    }
  }

  replaceList(
    otherSignalsList,
    summary.otherComments.length > 0
      ? summary.otherComments.map((comment) => `“${comment}”`)
      : ["Every comment contributed to at least one recurring theme."],
  );
  replaceList(questionsList, summary.questions);
};

const summaryAsText = (summary: FeedbackSummary) => {
  const lines = [
    summary.name.toLocaleUpperCase(),
    "FEEDBACK SIGNAL SUMMARY",
    "",
    `Comments reviewed: ${summary.comments.length}`,
    `Recurring themes: ${summary.recurringThemes.length}`,
    `Mixed themes: ${
      summary.recurringThemes.filter((theme) => theme.direction === "Mixed")
        .length
    }`,
    `Comments outside recurring themes: ${summary.otherComments.length}`,
    `Recurring threshold: ${summary.threshold} mentions`,
    "",
    "RECURRING THEMES",
  ];

  if (summary.recurringThemes.length === 0) {
    lines.push("No fixed theme reached the selected threshold.");
  } else {
    summary.recurringThemes.forEach((theme) => {
      lines.push(
        "",
        `${theme.name} — ${theme.comments.length} mentions — ${theme.direction}`,
        theme.description,
        ...theme.comments.slice(0, 4).map((comment) => `- “${comment}”`),
      );
    });
  }

  lines.push(
    "",
    "REPEATED TERMS",
    ...(summary.repeatedTerms.length
      ? summary.repeatedTerms.map(
          ({ term, count }) => `- ${term}: ${count} comments`,
        )
      : ["- No non-trivial term appeared in more than one comment."]),
    "",
    "ONE-OFF AND UNMATCHED COMMENTS",
    ...(summary.otherComments.length
      ? summary.otherComments.map((comment) => `- “${comment}”`)
      : ["- Every comment contributed to a recurring theme."]),
    "",
    "NEXT RESEARCH QUESTIONS",
    ...summary.questions.map((question) => `- ${question}`),
    "",
    "METHOD AND LIMITS",
    "This sorter uses fixed keyword groups and simple positive and negative cues. A comment may appear in more than one theme. Unmatched does not mean unimportant. Results do not establish prevalence, causation, statistical significance, or customer priority, and the method may miss context, irony, and domain language.",
  );

  return lines.join("\n");
};

commentsInput?.addEventListener("input", () => {
  commentsInput.setCustomValidity("");
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const comments = readComments(commentsInput?.value ?? "");
  if (comments.length < 4) {
    commentsInput?.setCustomValidity(
      "Enter at least four customer comments, one per line.",
    );
    commentsInput?.reportValidity();
    return;
  }

  currentSummary = buildSummary(new FormData(form));
  renderSummary(currentSummary);
  if (results) results.hidden = false;
  if (status) {
    status.textContent = `Sorted ${currentSummary.comments.length} comments into ${currentSummary.recurringThemes.length} recurring themes.`;
  }
  results?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => resultsTitle?.focus(), 350);
});

copyButton?.addEventListener("click", async () => {
  if (!currentSummary || !status) return;
  try {
    await navigator.clipboard.writeText(summaryAsText(currentSummary));
    status.textContent = "Feedback summary copied.";
  } catch {
    status.textContent =
      "Copy was blocked by the browser. Use Download or Print instead.";
  }
});

downloadButton?.addEventListener("click", () => {
  if (!currentSummary || !status) return;
  const blob = new Blob([summaryAsText(currentSummary)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename =
    currentSummary.name
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "feedback-sample";
  link.href = url;
  link.download = `${filename}-signal-summary.txt`;
  link.click();
  URL.revokeObjectURL(url);
  status.textContent = "Feedback summary downloaded.";
});

printButton?.addEventListener("click", () => window.print());

resetButton?.addEventListener("click", () => {
  form?.reset();
  commentsInput?.setCustomValidity("");
  if (results) results.hidden = true;
  if (status) status.textContent = "";
  currentSummary = null;
  form?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(
    () => document.querySelector<HTMLInputElement>("#analysis-name")?.focus(),
    350,
  );
});
