type Step = {
  name: string;
  actor: string;
  owner: string;
  system: string;
  input: string;
  output: string;
  uncertainty: string;
};

type MapResult = {
  journeyName: string;
  journeyOutcome: string;
  steps: Step[];
  risks: string[];
  rules: string[];
  questions: string[];
};

export {};

const form = document.querySelector<HTMLFormElement>("#handoff-form");
const stepList = document.querySelector<HTMLOListElement>("#journey-steps");
const template = document.querySelector<HTMLTemplateElement>(
  "#journey-step-template",
);
const addButton = document.querySelector<HTMLButtonElement>("#add-step");
const builderStatus = document.querySelector<HTMLElement>("#builder-status");
const results = document.querySelector<HTMLElement>("#handoff-results");
const resultTitle = document.querySelector<HTMLElement>("#results-title");
const mapStatus = document.querySelector<HTMLElement>("#map-status");
const tableBody =
  document.querySelector<HTMLTableSectionElement>("#map-table-body");
const copyButton = document.querySelector<HTMLButtonElement>("#copy-map");
const downloadButton =
  document.querySelector<HTMLButtonElement>("#download-map");
const printButton = document.querySelector<HTMLButtonElement>("#print-map");
const resetButton = document.querySelector<HTMLButtonElement>("#start-over");

let currentMap: MapResult | null = null;

const getText = (selector: string) =>
  document
    .querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)
    ?.value.trim() ?? "";

const announce = (message: string) => {
  if (!builderStatus) return;
  builderStatus.textContent = "";
  window.setTimeout(() => {
    builderStatus.textContent = message;
  }, 50);
};

const setOutput = (name: string, value: string) => {
  document
    .querySelectorAll<HTMLElement>(`[data-output="${name}"]`)
    .forEach((element) => {
      element.textContent = value;
    });
};

const setList = (name: string, items: string[]) => {
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

const stepElements = () =>
  Array.from(stepList?.querySelectorAll<HTMLElement>("[data-step]") ?? []);

const fieldName = (position: number, field: string) =>
  `step-${position}-${field}`;

const updateStepAttributes = () => {
  const steps = stepElements();

  steps.forEach((step, index) => {
    const position = index + 1;
    const legend = step.querySelector<HTMLElement>("[data-step-legend]");
    const positionLabel = step.querySelector<HTMLElement>(".step-position");
    const actionGroup = step.querySelector<HTMLElement>(".step-actions");
    const upButton = step.querySelector<HTMLButtonElement>('[data-move="up"]');
    const downButton =
      step.querySelector<HTMLButtonElement>('[data-move="down"]');
    const removeButton = step.querySelector<HTMLButtonElement>("[data-remove]");

    if (legend) legend.textContent = `Step ${position}`;
    if (positionLabel) positionLabel.textContent = `Journey step ${position}`;
    if (actionGroup) {
      actionGroup.setAttribute(
        "aria-label",
        `Reorder or remove step ${position}`,
      );
    }

    if (upButton) {
      upButton.disabled = index === 0;
      upButton.setAttribute("aria-label", `Move step ${position} up`);
    }
    if (downButton) {
      downButton.disabled = index === steps.length - 1;
      downButton.setAttribute("aria-label", `Move step ${position} down`);
    }
    if (removeButton) {
      removeButton.disabled = steps.length <= 2;
      removeButton.setAttribute("aria-label", `Remove step ${position}`);
    }

    step
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-field]")
      .forEach((control) => {
        const field = control.dataset.field;
        if (!field || field === "uncertainty") return;

        const id = fieldName(position, field);
        const label = step.querySelector<HTMLLabelElement>(
          `[data-field-label="${field}"]`,
        );
        const hint = step.querySelector<HTMLElement>(
          `[data-field-hint="${field}"]`,
        );

        control.id = id;
        control.name = id;
        if (label) label.htmlFor = id;
        if (hint) {
          hint.id = `${id}-hint`;
          control.setAttribute("aria-describedby", hint.id);
        } else {
          control.removeAttribute("aria-describedby");
        }
      });

    step
      .querySelectorAll<HTMLInputElement>('input[type="radio"]')
      .forEach((radio) => {
        radio.name = fieldName(position, "uncertainty");
      });
  });
};

const addStep = () => {
  if (!stepList || !template) return;

  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const newStep = fragment.querySelector<HTMLElement>("[data-step]");
  if (!newStep) return;

  stepList.append(newStep);
  updateStepAttributes();
  const position = stepElements().length;
  newStep.querySelector<HTMLInputElement>('[data-field="name"]')?.focus();
  announce(`Step ${position} added.`);
};

const moveStep = (step: HTMLElement, direction: "up" | "down") => {
  if (!stepList) return;
  const sibling =
    direction === "up" ? step.previousElementSibling : step.nextElementSibling;
  if (!sibling) return;

  if (direction === "up") {
    stepList.insertBefore(step, sibling);
  } else {
    stepList.insertBefore(sibling, step);
  }

  updateStepAttributes();
  const position = stepElements().indexOf(step) + 1;
  step.querySelector<HTMLButtonElement>(`[data-move="${direction}"]`)?.focus();
  announce(`Step moved to position ${position}.`);
};

const removeStep = (step: HTMLElement) => {
  const steps = stepElements();
  if (steps.length <= 2) {
    announce("A journey map needs at least two steps.");
    return;
  }

  const oldPosition = steps.indexOf(step);
  const nextFocus = (
    step.nextElementSibling ?? step.previousElementSibling
  )?.querySelector<HTMLInputElement>('[data-field="name"]');
  step.remove();
  updateStepAttributes();
  nextFocus?.focus();
  announce(`Step ${oldPosition + 1} removed.`);
};

const readSteps = (): Step[] =>
  stepElements().map((step) => {
    const value = (field: string) =>
      step
        .querySelector<HTMLInputElement | HTMLTextAreaElement>(
          `[data-field="${field}"]`,
        )
        ?.value.trim() ?? "";

    return {
      name: value("name"),
      actor: value("actor"),
      owner: value("owner"),
      system: value("system"),
      input: value("input"),
      output: value("output"),
      uncertainty:
        step.querySelector<HTMLInputElement>('input[type="radio"]:checked')
          ?.value ?? "",
    };
  });

const buildMap = (): MapResult => {
  const journeyName = getText("#journey-name");
  const journeyOutcome = getText("#journey-outcome");
  const steps = readSteps();
  const risks: string[] = [];
  const rules: string[] = [];
  const questions: string[] = [];

  steps.forEach((step, index) => {
    const position = index + 1;

    if (!step.owner) {
      risks.push(
        `Step ${position}, “${step.name},” has an actor but no accountable owner.`,
      );
      questions.push(
        `Who owns the result of step ${position} and has authority to correct it?`,
      );
    }

    if (!step.system) {
      questions.push(
        `Which channel or system carries step ${position}, and where is its record kept?`,
      );
    }

    if (!step.input) {
      risks.push(
        `Step ${position} does not name the evidence or information needed to begin.`,
      );
    }

    if (!step.output && index < steps.length - 1) {
      risks.push(
        `Step ${position} does not define a usable output for the next step.`,
      );
    }

    if (step.uncertainty === "yes") {
      risks.push(
        `The customer is expected to wait or lack clarity during step ${position}.`,
      );
      questions.push(
        `What confirmation, timeline, status, or recovery path would reduce uncertainty at step ${position}?`,
      );
    } else if (step.uncertainty === "unsure") {
      questions.push(
        `Ask customers or frontline staff whether people wait or lose clarity at step ${position}.`,
      );
    }
  });

  for (let index = 0; index < steps.length - 1; index += 1) {
    const current = steps[index];
    const next = steps[index + 1];
    const boundary = `${index + 1} → ${index + 2}`;
    const ownerChanges =
      (current.owner || current.actor).toLocaleLowerCase() !==
      (next.owner || next.actor).toLocaleLowerCase();
    const systemChanges =
      current.system &&
      next.system &&
      current.system.toLocaleLowerCase() !== next.system.toLocaleLowerCase();

    if ((!current.output || !next.input) && (ownerChanges || systemChanges)) {
      risks.push(
        `Handoff ${boundary} changes ${ownerChanges ? "responsibility" : "system"} without a complete output-to-input contract.`,
      );
    }

    const transferContext = [
      ownerChanges ? "responsibility changes" : "responsibility continues",
      systemChanges ? "the system changes" : "the system may continue",
    ].join(" and ");

    rules.push(
      `Handoff ${boundary}: confirm that ${current.actor} provides “${current.output || "a defined completion record"}” and that ${next.actor} accepts it as “${next.input || "a defined starting input"}”; name the escalation path when the evidence is missing because ${transferContext}.`,
    );
  }

  const normalizedNames = steps.map((step) =>
    step.name.toLocaleLowerCase().replace(/\s+/g, " ").trim(),
  );
  const duplicates = normalizedNames.filter(
    (name, index) => normalizedNames.indexOf(name) !== index,
  );
  [...new Set(duplicates)].forEach((name) => {
    const positions = normalizedNames
      .map((candidate, index) => (candidate === name ? index + 1 : 0))
      .filter(Boolean);
    risks.push(
      `Steps ${positions.join(" and ")} describe the same action. Confirm whether the work is repeated, rechecked, or mislabeled.`,
    );
  });

  if (questions.length === 0) {
    questions.push(
      "Which customer evidence confirms that this sequence, ownership, and definition of success match the real journey?",
      "What happens when a step is late, incomplete, disputed, or unavailable?",
    );
  }

  return {
    journeyName,
    journeyOutcome,
    steps,
    risks,
    rules,
    questions: [...new Set(questions)],
  };
};

const renderTable = (steps: Step[]) => {
  if (!tableBody) return;

  tableBody.replaceChildren(
    ...steps.map((step, index) => {
      const row = document.createElement("tr");
      const values = [
        String(index + 1),
        step.name,
        `${step.actor} / ${step.owner || "Owner unresolved"}`,
        step.system || "Unresolved",
        step.input || "Unresolved",
        step.output ||
          (index === steps.length - 1 ? "Journey outcome" : "Unresolved"),
      ];

      values.forEach((value, cellIndex) => {
        const cell =
          cellIndex === 0
            ? document.createElement("th")
            : document.createElement("td");
        if (cellIndex === 0) cell.setAttribute("scope", "row");
        cell.textContent = value;
        row.append(cell);
      });

      return row;
    }),
  );
};

const renderMap = (map: MapResult) => {
  setOutput("journey-name", map.journeyName);
  setOutput("journey-outcome", map.journeyOutcome);
  setOutput("step-count", String(map.steps.length));
  setOutput("risk-count", String(map.risks.length));
  setOutput("question-count", String(map.questions.length));
  setList(
    "risks",
    map.risks.length
      ? map.risks
      : [
          "No structural gaps were detected from the fields provided. Validate the map with customer evidence and the people who perform each step.",
        ],
  );
  setList("rules", map.rules);
  setList("questions", map.questions);
  renderTable(map.steps);
};

const mapAsText = (map: MapResult) => {
  const lines = [
    `CX HANDOFF MAP: ${map.journeyName}`,
    "",
    "CUSTOMER OUTCOME",
    map.journeyOutcome,
    "",
    "JOURNEY SEQUENCE",
  ];

  map.steps.forEach((step, index) => {
    lines.push(
      "",
      `${index + 1}. ${step.name}`,
      `Actor: ${step.actor}`,
      `Owner: ${step.owner || "Unresolved"}`,
      `Channel or system: ${step.system || "Unresolved"}`,
      `Input or evidence: ${step.input || "Unresolved"}`,
      `Output or commitment: ${step.output || (index === map.steps.length - 1 ? "Journey outcome" : "Unresolved")}`,
      `Customer waiting or unsure: ${step.uncertainty === "yes" ? "Yes" : step.uncertainty === "unsure" ? "Not sure" : "No"}`,
    );
  });

  lines.push(
    "",
    "HANDOFF RISKS",
    ...(map.risks.length
      ? map.risks.map((risk) => `- ${risk}`)
      : [
          "- No structural gaps were detected from the fields provided. Validate the map with customer evidence and the people who perform each step.",
        ]),
    "",
    "BOUNDARY RULES",
    ...map.rules.map((rule, index) => `${index + 1}. ${rule}`),
    "",
    "QUESTIONS TO RESOLVE",
    ...map.questions.map((question) => `- ${question}`),
    "",
    "LIMITS",
    "This map reflects only the information entered. Validate it with customers, frontline teams, operational data, accessibility evidence, and system owners.",
  );

  return lines.join("\n");
};

addButton?.addEventListener("click", addStep);

stepList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const step = target.closest<HTMLElement>("[data-step]");
  if (!step) return;

  if (target.matches('[data-move="up"]')) moveStep(step, "up");
  if (target.matches('[data-move="down"]')) moveStep(step, "down");
  if (target.matches("[data-remove]")) removeStep(step);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  currentMap = buildMap();
  renderMap(currentMap);
  if (results) results.hidden = false;
  results?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => resultTitle?.focus(), 350);
});

copyButton?.addEventListener("click", async () => {
  if (!currentMap || !mapStatus) return;
  try {
    await navigator.clipboard.writeText(mapAsText(currentMap));
    mapStatus.textContent = "Handoff map copied.";
  } catch {
    mapStatus.textContent =
      "Copy was blocked by the browser. Use Download or Print instead.";
  }
});

downloadButton?.addEventListener("click", () => {
  if (!currentMap || !mapStatus) return;
  const blob = new Blob([mapAsText(currentMap)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename =
    currentMap.journeyName
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cx-handoff-map";
  link.href = url;
  link.download = `${filename}-handoff-map.txt`;
  link.click();
  URL.revokeObjectURL(url);
  mapStatus.textContent = "Handoff map downloaded.";
});

printButton?.addEventListener("click", () => window.print());

resetButton?.addEventListener("click", () => {
  form?.reset();
  const steps = stepElements();
  steps.slice(3).forEach((step) => step.remove());
  updateStepAttributes();
  if (results) results.hidden = true;
  if (mapStatus) mapStatus.textContent = "";
  currentMap = null;
  form?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(
    () => document.querySelector<HTMLInputElement>("#journey-name")?.focus(),
    350,
  );
});

updateStepAttributes();
