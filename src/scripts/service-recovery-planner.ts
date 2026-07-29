type Severity = "inconvenience" | "material" | "serious";

type RecoveryPlan = {
  name: string;
  failure: string;
  affected: string;
  severity: Severity;
  customerNeed: string;
  confirmed: string;
  unknowns: string;
  recoveryOwner: string;
  communicationOwner: string;
  responseTime: string;
  followUp: string;
  remedies: string[];
  constraints: string;
  closureEvidence: string;
  immediateResponse: string[];
  communicationPrompts: string[];
  checklist: string[];
  escalationTriggers: string[];
};

export {};

const form = document.querySelector<HTMLFormElement>("#recovery-form");
const results = document.querySelector<HTMLElement>("#recovery-results");
const resultsTitle = document.querySelector<HTMLElement>("#results-title");
const planStatus = document.querySelector<HTMLElement>("#plan-status");
const immediateResponse = document.querySelector<HTMLOListElement>(
  "#immediate-response",
);
const communicationPrompts = document.querySelector<HTMLUListElement>(
  "#communication-prompts",
);
const remedyList = document.querySelector<HTMLUListElement>("#remedy-list");
const recoveryChecklist = document.querySelector<HTMLOListElement>(
  "#recovery-checklist",
);
const escalationTriggers = document.querySelector<HTMLUListElement>(
  "#escalation-triggers",
);
const copyButton = document.querySelector<HTMLButtonElement>("#copy-plan");
const downloadButton =
  document.querySelector<HTMLButtonElement>("#download-plan");
const printButton = document.querySelector<HTMLButtonElement>("#print-plan");
const resetButton = document.querySelector<HTMLButtonElement>("#start-over");
const remedyNone = document.querySelector<HTMLInputElement>("#remedy-none");
const remedyInputs = Array.from(
  document.querySelectorAll<HTMLInputElement>('input[name="remedies"]'),
);

let currentPlan: RecoveryPlan | null = null;

const readValue = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();

const severityLabel: Record<Severity, string> = {
  inconvenience: "Inconvenience",
  material: "Material impact",
  serious: "Serious impact — prompt specialist review needed",
};

const setOutput = (name: string, value: string) => {
  document
    .querySelectorAll<HTMLElement>(`[data-output="${name}"]`)
    .forEach((element) => {
      element.textContent = value;
    });
};

const renderList = (
  element: HTMLOListElement | HTMLUListElement | null,
  items: string[],
) => {
  if (!element) return;
  element.replaceChildren(
    ...items.map((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      return listItem;
    }),
  );
};

const buildChecklist = (
  severity: Severity,
  remedies: string[],
  hasUnknowns: boolean,
) => {
  const items = [
    "Confirm the recovery owner accepts responsibility for coordinating the response.",
    "Acknowledge the customer impact without speculating, assigning blame, or overstating what is known.",
    "Share the confirmed facts, the current action, and the time of the next update.",
  ];

  if (hasUnknowns) {
    items.push(
      "Assign each open question to an investigator and record when the answer is needed.",
    );
  }

  if (remedies.some((item) => item.includes("Restored access"))) {
    items.push(
      "Verify that access or service works from the customer’s point of view before declaring recovery.",
    );
  }

  if (remedies.some((item) => item.includes("Correction"))) {
    items.push(
      "Complete the correction or rework and have someone other than the maker verify it.",
    );
  }

  if (
    remedies.some(
      (item) => item.includes("Refund") || item.includes("Replacement"),
    )
  ) {
    items.push(
      "Confirm the authorized approver, policy, amount or scope, and fulfillment timing before making an offer.",
    );
  }

  if (severity === "serious") {
    items.push(
      "Pause any unsafe or harmful activity and involve the appropriate safety, security, privacy, legal, regulatory, financial, or domain owner.",
    );
  }

  items.push(
    "Send the next update when promised, even if the investigation or recovery is not finished.",
    "Verify closure evidence, record what failed in the system, and assign the prevention follow-up.",
  );

  return items;
};

const buildEscalationTriggers = (severity: Severity) => {
  const common = [
    "The affected scope grows, the facts materially change, or additional customers may be exposed.",
    "The team cannot meet the stated response or follow-up time.",
    "The requested remedy exceeds the current owner’s authority or conflicts with policy.",
  ];

  if (severity === "serious") {
    return [
      "Escalate now to the appropriate safety, security, privacy, legal, regulatory, financial, or domain owner. The selected impact may involve harm that this planner cannot assess.",
      "Stop or contain the affected activity when an authorized owner determines continued operation could increase harm.",
      ...common,
    ];
  }

  if (severity === "material") {
    return [
      "Escalate if access, money, a contractual commitment, essential work, or a deadline remains at risk.",
      ...common,
    ];
  }

  return [
    "Escalate if the issue repeats, reveals a broader pattern, or cannot be corrected within the stated time.",
    ...common,
  ];
};

const buildPlan = (data: FormData): RecoveryPlan => {
  const severity = readValue(data, "severity") as Severity;
  const remedies = data
    .getAll("remedies")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const recoveryOwner = readValue(data, "recovery-owner");
  const communicationOwner =
    readValue(data, "communication-owner") || recoveryOwner;
  const unknowns = readValue(data, "unknowns");
  const responseTime = readValue(data, "response-time");
  const followUp = readValue(data, "follow-up");
  const constraints = readValue(data, "constraints");
  const selectedRemedies =
    remedies.length > 0 ? remedies : ["No remedy is confirmed yet"];

  return {
    name: readValue(data, "plan-name"),
    failure: readValue(data, "failure"),
    affected: readValue(data, "affected"),
    severity,
    customerNeed: readValue(data, "customer-need"),
    confirmed: readValue(data, "confirmed"),
    unknowns:
      unknowns ||
      "No open questions were entered. Confirm this with the recovery owner.",
    recoveryOwner,
    communicationOwner,
    responseTime,
    followUp,
    remedies: selectedRemedies,
    constraints,
    closureEvidence:
      readValue(data, "closure-evidence") ||
      "Define observable evidence with the customer and recovery owner before closing the issue.",
    immediateResponse: [
      `Acknowledge the impact on ${readValue(data, "affected")} without speculating about cause or fault.`,
      "State only the confirmed facts and distinguish them from anything still under investigation.",
      `Name ${recoveryOwner} as the recovery owner and ${communicationOwner} as the communication owner.`,
      `Give the first response ${responseTime.toLocaleLowerCase()} and commit to the next update ${followUp}.`,
      "Discuss remedies only after the appropriate owner confirms approval, policy, scope, and timing.",
    ],
    communicationPrompts: [
      `Acknowledge: “We understand that ${readValue(data, "customer-need")} is the immediate need.”`,
      `Confirmed facts: “What we can confirm now is: ${readValue(data, "confirmed")}”`,
      unknowns
        ? `Open questions: “We are still confirming: ${unknowns}”`
        : "Open questions: State that the team will correct the record if new information changes the current understanding.",
      `Ownership: “The ${recoveryOwner} role owns the recovery. The ${communicationOwner} role owns updates.”`,
      `Next update: “We will provide the next update ${followUp}, even if the work is still underway.”`,
      `Boundary: “We will not promise the following without authorization: ${constraints}”`,
    ],
    checklist: buildChecklist(severity, selectedRemedies, Boolean(unknowns)),
    escalationTriggers: buildEscalationTriggers(severity),
  };
};

const renderPlan = (plan: RecoveryPlan) => {
  setOutput("plan-name", plan.name);
  setOutput("failure", plan.failure);
  setOutput("affected", plan.affected);
  setOutput("severity", severityLabel[plan.severity]);
  setOutput("customer-need", plan.customerNeed);
  setOutput("confirmed", plan.confirmed);
  setOutput("unknowns", plan.unknowns);
  setOutput("recovery-owner", plan.recoveryOwner);
  setOutput("communication-owner", plan.communicationOwner);
  setOutput("response-time", plan.responseTime);
  setOutput("follow-up", plan.followUp);
  setOutput("constraints", plan.constraints);
  setOutput("closure-evidence", plan.closureEvidence);

  renderList(immediateResponse, plan.immediateResponse);
  renderList(communicationPrompts, plan.communicationPrompts);
  renderList(
    remedyList,
    plan.remedies.map((item) => `${item} — subject to approval or policy.`),
  );
  renderList(recoveryChecklist, plan.checklist);
  renderList(escalationTriggers, plan.escalationTriggers);

  if (results) results.hidden = false;
  if (planStatus) {
    planStatus.textContent =
      "Recovery plan generated locally. Review every commitment before use.";
  }
  results?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => resultsTitle?.focus(), 450);
};

const planAsText = (plan: RecoveryPlan) => {
  const numbered = (items: string[]) =>
    items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const bullets = (items: string[]) =>
    items.map((item) => `- ${item}`).join("\n");

  return `${plan.name}
SERVICE RECOVERY PLAN

SITUATION
Failure: ${plan.failure}
Affected group: ${plan.affected}
Impact: ${severityLabel[plan.severity]}
Immediate customer need: ${plan.customerNeed}

IMMEDIATE RESPONSE
${numbered(plan.immediateResponse)}

OWNERSHIP AND TIMING
Recovery owner: ${plan.recoveryOwner}
Communication owner: ${plan.communicationOwner}
First response: ${plan.responseTime}
Next update: ${plan.followUp}

EVIDENCE BOUNDARY
Confirmed: ${plan.confirmed}
Still unknown: ${plan.unknowns}

COMMUNICATION PROMPTS
${bullets(plan.communicationPrompts)}

POSSIBLE REMEDIES — SUBJECT TO APPROVAL OR POLICY
${bullets(plan.remedies)}

DO NOT PROMISE
${plan.constraints}

RECOVERY CHECKLIST
${numbered(plan.checklist)}

ESCALATION TRIGGERS
${bullets(plan.escalationTriggers)}

FOLLOW-UP EVIDENCE
${plan.closureEvidence}

METHOD AND LIMITS
This plan uses only the information entered. It does not verify facts, assess law or policy, authorize compensation, determine fault, contact a customer, or replace safety, security, privacy, legal, regulatory, financial, or domain review. An authorized owner must approve commitments and customer-facing language.`;
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  if (data.getAll("remedies").length === 0) {
    const firstRemedy = remedyInputs[0];
    firstRemedy?.setCustomValidity(
      "Choose at least one possible remedy, including “None confirmed yet.”",
    );
    firstRemedy?.reportValidity();
    return;
  }

  currentPlan = buildPlan(data);
  renderPlan(currentPlan);
});

remedyInputs.forEach((input) => {
  input.addEventListener("change", () => {
    remedyInputs[0]?.setCustomValidity("");

    if (input === remedyNone && input.checked) {
      remedyInputs.forEach((other) => {
        if (other !== remedyNone) other.checked = false;
      });
      return;
    }

    if (input.checked && remedyNone) remedyNone.checked = false;
  });
});

copyButton?.addEventListener("click", async () => {
  if (!currentPlan) return;
  try {
    await navigator.clipboard.writeText(planAsText(currentPlan));
    if (planStatus) planStatus.textContent = "Recovery plan copied.";
  } catch {
    if (planStatus) {
      planStatus.textContent =
        "Copy was blocked by the browser. Select and copy the plan manually.";
    }
  }
});

downloadButton?.addEventListener("click", () => {
  if (!currentPlan) return;
  const blob = new Blob([planAsText(currentPlan)], {
    type: "text/plain;charset=utf-8",
  });
  const link = document.createElement("a");
  const fileName =
    currentPlan.name
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "service-recovery-plan";
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  if (planStatus) planStatus.textContent = "Recovery plan downloaded.";
});

printButton?.addEventListener("click", () => window.print());

resetButton?.addEventListener("click", () => {
  form?.reset();
  currentPlan = null;
  if (results) results.hidden = true;
  if (planStatus) planStatus.textContent = "";
  remedyInputs.forEach((input) => {
    input.checked = false;
  });
  form?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(
    () => document.querySelector<HTMLInputElement>("#plan-name")?.focus(),
    450,
  );
});
