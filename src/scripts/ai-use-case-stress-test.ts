type Brief = {
  name: string;
  people: string;
  task: string;
  outcome: string;
  decision: string;
  verdict: string;
  verdictDetail: string;
  gaps: string[];
  ownership: string[];
  failures: string[];
  test: string;
  stops: string[];
};

export {};

const form = document.querySelector<HTMLFormElement>("#stress-test-form");
const results = document.querySelector<HTMLElement>("#decision-brief");
const status = document.querySelector<HTMLElement>("#brief-status");
const copyButton = document.querySelector<HTMLButtonElement>("#copy-brief");
const downloadButton =
  document.querySelector<HTMLButtonElement>("#download-brief");
const printButton = document.querySelector<HTMLButtonElement>("#print-brief");
const resetButton = document.querySelector<HTMLButtonElement>("#start-over");

let currentBrief: Brief | null = null;

const readValue = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();

const addList = (name: string, items: string[]) => {
  const list = document.querySelector<HTMLElement>(
    `[data-output-list="${name}"]`,
  );
  if (!list) return;

  list.replaceChildren(
    ...items.map((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      return listItem;
    }),
  );
};

const setOutput = (name: string, value: string) => {
  document
    .querySelectorAll<HTMLElement>(`[data-output="${name}"]`)
    .forEach((element) => {
      element.textContent = value;
    });
};

const buildBrief = (data: FormData): Brief => {
  const name = readValue(data, "use-case-name");
  const people = readValue(data, "people");
  const task = readValue(data, "task");
  const outcome = readValue(data, "outcome");
  const information = readValue(data, "data");
  const sensitivity = readValue(data, "sensitivity");
  const decision = readValue(data, "decision");
  const consequence = readValue(data, "consequence");
  const reversibility = readValue(data, "reversibility");
  const owner = readValue(data, "owner");
  const review = readValue(data, "review");
  const success = readValue(data, "success");
  const proposedTest = readValue(data, "smallest-test");

  const gaps: string[] = [];
  const ownership: string[] = [];
  const failures: string[] = [];
  const stops: string[] = [];

  if (!information) {
    gaps.push(
      "Identify the information the workflow needs, where it comes from, who can use it, and how its quality will be checked.",
    );
  }

  if (sensitivity === "unsure") {
    gaps.push(
      "Classify the information and downstream use before selecting a model, vendor, or integration.",
    );
  } else if (sensitivity === "yes") {
    gaps.push(
      "Define privacy, security, retention, access, and domain-review requirements before real information enters the test.",
    );
  }

  if (!decision) {
    gaps.push(
      "Name the decision or action the output can influence, including indirect workflow effects.",
    );
  }

  if (!success) {
    gaps.push(
      "Define evidence for usefulness, quality, error patterns, human effort, and the effect on people.",
    );
  }

  if (!owner) {
    ownership.push(
      "Which named role owns the outcome and has authority to pause or change the system?",
    );
  } else {
    ownership.push(
      `${owner} is the proposed accountable owner. Confirm that this role has authority, capacity, and access to the evidence needed to intervene.`,
    );
  }

  if (!review) {
    ownership.push(
      "Where will a person review the output, what evidence will they see, and when can they override or stop the workflow?",
    );
  } else {
    ownership.push(
      `Test whether this review is practical under real workload: ${review}`,
    );
  }

  if (consequence === "high") {
    failures.push(
      "A wrong result could materially affect a person, commitment, right, or business outcome. Do not begin with autonomous action.",
    );
  } else if (consequence === "moderate") {
    failures.push(
      "A wrong result could create rework, delay, confusion, or a poor experience. Measure recovery effort as well as output quality.",
    );
  } else {
    failures.push(
      "Errors appear easy to notice and correct, but the test should verify that assumption with real workflow examples.",
    );
  }

  if (reversibility === "difficult") {
    failures.push(
      "The influenced action is difficult to reverse. Keep the first test offline or advisory and require explicit human approval.",
    );
  } else if (reversibility === "partial") {
    failures.push(
      "Correction leaves some cost or effect. Define who detects errors, how quickly correction happens, and who communicates it.",
    );
  } else {
    failures.push(
      "The action is expected to be reversible. Verify correction time, downstream propagation, and whether people can contest the result.",
    );
  }

  if (sensitivity !== "no") {
    failures.push(
      "Sensitive or unclassified information may be exposed, retained, inferred, or reused beyond the intended task.",
    );
  }

  failures.push(
    "A plausible-looking output may be accepted without enough evidence because it is faster or easier than checking.",
  );

  stops.push(
    "A result could affect a person or customer before the accountable owner reviews it.",
  );
  stops.push(
    "The team cannot trace an output to its source information, instructions, and review decision.",
  );

  if (sensitivity !== "no") {
    stops.push(
      "Real sensitive information is required before access, retention, and approved-use rules are defined.",
    );
  }

  if (success) {
    stops.push(
      `The test misses the agreed evidence or reveals an unacceptable error pattern: ${success}`,
    );
  } else {
    stops.push(
      "The team cannot agree on evidence that would justify continuing, changing, or ending the test.",
    );
  }

  const majorControlGap =
    (consequence === "high" || reversibility === "difficult") &&
    (!owner || !review);
  const unresolvedCount =
    [information, decision, owner, review, success].filter((value) => !value)
      .length + (sensitivity === "unsure" ? 1 : 0);

  let verdict = "Candidate for a controlled pilot";
  let verdictDetail =
    "The core decision conditions are described. Confirm the assumptions, controls, and evidence with the people who own and experience the workflow.";

  if (majorControlGap) {
    verdict = "Resolve control gaps before testing";
    verdictDetail =
      "The use case combines meaningful consequence or limited reversibility with unclear accountability or human review. Define those controls before exposing real people or decisions.";
  } else if (unresolvedCount >= 4) {
    verdict = "Clarify the use case before testing";
    verdictDetail =
      "Several operating dependencies are still unresolved. A short discovery exercise will create more value than choosing a model, vendor, or platform now.";
  } else if (unresolvedCount > 0 || sensitivity !== "no") {
    verdict = "Ready for a bounded discovery test";
    verdictDetail =
      "The idea is specific enough to examine, but unresolved dependencies should keep the first test narrow, reversible, and separated from live decisions.";
  }

  const generatedTest =
    consequence === "high" || reversibility === "difficult"
      ? `Use historical or synthetic examples of “${task}.” Keep every output offline and advisory. Have the accountable owner compare it with the current process, record errors and disagreements, and prevent any result from reaching a person or live decision.`
      : `Use a small, representative set of historical or synthetic examples of “${task}.” Keep the output advisory, have a named owner review every result, compare it with the current process, and record errors, recovery effort, and evidence tied to “${outcome}.”`;

  return {
    name,
    people,
    task,
    outcome,
    decision: decision || "Not yet defined",
    verdict,
    verdictDetail,
    gaps:
      gaps.length > 0
        ? gaps
        : [
            "No major dependency was left blank. Validate each answer with the people who own the data, workflow, controls, and affected experience.",
          ],
    ownership,
    failures,
    test: proposedTest || generatedTest,
    stops,
  };
};

const formatBrief = (brief: Brief) =>
  [
    "AI USE CASE DECISION BRIEF",
    brief.name,
    "",
    "RECOMMENDED NEXT STEP",
    brief.verdict,
    brief.verdictDetail,
    "",
    "USE CASE",
    `People affected: ${brief.people}`,
    `Task: ${brief.task}`,
    `Intended outcome: ${brief.outcome}`,
    `Decision influenced: ${brief.decision}`,
    "",
    "READINESS GAPS",
    ...brief.gaps.map((item) => `- ${item}`),
    "",
    "HUMAN ACCOUNTABILITY",
    ...brief.ownership.map((item) => `- ${item}`),
    "",
    "FAILURE EXPOSURE",
    ...brief.failures.map((item) => `- ${item}`),
    "",
    "SMALLEST USEFUL TEST",
    brief.test,
    "",
    "STOP CONDITIONS",
    ...brief.stops.map((item) => `- ${item}`),
    "",
    "LIMITS",
    "This brief reflects only the answers provided. It is a planning aid, not an approval, compliance review, risk assessment, or guarantee that an AI system is appropriate.",
    "",
    "Generated locally with the free Cadence Lab AI Use Case Stress Test.",
    "https://cadencelab.co/resources/ai-tools/use-case-stress-test/",
  ].join("\n");

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const brief = buildBrief(new FormData(form));
  currentBrief = brief;

  setOutput("name", brief.name);
  setOutput("people", brief.people);
  setOutput("task", brief.task);
  setOutput("outcome", brief.outcome);
  setOutput("decision", brief.decision);
  setOutput("verdict", brief.verdict);
  setOutput("verdict-detail", brief.verdictDetail);
  setOutput("test", brief.test);
  addList("gaps", brief.gaps);
  addList("ownership", brief.ownership);
  addList("failures", brief.failures);
  addList("stops", brief.stops);

  if (results) results.hidden = false;
  if (status) status.textContent = "Decision brief generated.";

  const heading = document.querySelector<HTMLElement>("#brief-title");
  heading?.focus();
  heading?.scrollIntoView({ block: "start" });
});

copyButton?.addEventListener("click", async () => {
  if (!currentBrief || !status) return;

  try {
    await navigator.clipboard.writeText(formatBrief(currentBrief));
    status.textContent = "Decision brief copied.";
  } catch {
    status.textContent =
      "Copy was unavailable. Download or print the brief instead.";
  }
});

downloadButton?.addEventListener("click", () => {
  if (!currentBrief || !status) return;

  const safeName =
    currentBrief.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "ai-use-case";
  const file = new Blob([formatBrief(currentBrief)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeName}-decision-brief.txt`;
  link.click();
  URL.revokeObjectURL(url);
  status.textContent = "Decision brief downloaded.";
});

printButton?.addEventListener("click", () => {
  window.print();
});

resetButton?.addEventListener("click", () => {
  form?.reset();
  currentBrief = null;

  if (results) results.hidden = true;
  if (status) status.textContent = "";

  document.querySelector<HTMLElement>("#use-case-name")?.focus();
  form?.scrollIntoView({ block: "start" });
});
