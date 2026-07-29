type Severity = "High" | "Review" | "Note";

type Finding = {
  severity: Severity;
  title: string;
  detail: string;
  evidence: string;
};

type ColumnProfile = {
  name: string;
  filled: number;
  missing: number;
  distinct: number;
  format: string;
  note: string;
};

type DuplicateGroup = {
  rows: number[];
  preview: string;
};

type DataHealthReport = {
  name: string;
  sourceName: string;
  rowCount: number;
  columnCount: number;
  findings: Finding[];
  profiles: ColumnProfile[];
  duplicates: DuplicateGroup[];
  questions: string[];
  truncatedRows: boolean;
  truncatedColumns: boolean;
};

type ParsedCsv = {
  rows: string[][];
  unclosedQuote: boolean;
};

export {};

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 500;
const MAX_COLUMNS = 75;

const form = document.querySelector<HTMLFormElement>("#data-health-form");
const fileInput = document.querySelector<HTMLInputElement>("#csv-file");
const textInput = document.querySelector<HTMLTextAreaElement>("#csv-text");
const fileStatus = document.querySelector<HTMLElement>("#file-status");
const results = document.querySelector<HTMLElement>("#data-health-results");
const resultsTitle = document.querySelector<HTMLElement>("#results-title");
const reportStatus = document.querySelector<HTMLElement>("#report-status");
const findingList = document.querySelector<HTMLElement>("#finding-list");
const profileBody = document.querySelector<HTMLTableSectionElement>(
  "#profile-table-body",
);
const duplicateList =
  document.querySelector<HTMLUListElement>("#duplicate-list");
const questionList =
  document.querySelector<HTMLUListElement>("#review-questions");
const copyButton = document.querySelector<HTMLButtonElement>("#copy-report");
const downloadButton =
  document.querySelector<HTMLButtonElement>("#download-report");
const printButton = document.querySelector<HTMLButtonElement>("#print-report");
const resetButton = document.querySelector<HTMLButtonElement>("#start-over");

let currentReport: DataHealthReport | null = null;

const readValue = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();

const parseCsv = (input: string): ParsedCsv => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);

  return { rows, unclosedQuote: quoted };
};

const uniqueHeaders = (source: string[], count: number) => {
  const used = new Map<string, number>();

  return Array.from({ length: count }, (_, index) => {
    const candidate = source[index]?.trim() || `Column ${index + 1}`;
    const seen = used.get(candidate) ?? 0;
    used.set(candidate, seen + 1);
    return seen === 0 ? candidate : `${candidate} (${seen + 1})`;
  });
};

const normalizedMissingValues = (value: string) =>
  new Set(
    value
      .split(",")
      .map((item) => item.trim().toLocaleLowerCase())
      .filter(Boolean),
  );

const isMissing = (value: string, missingValues: Set<string>) => {
  const normalized = value.trim().toLocaleLowerCase();
  return normalized === "" || missingValues.has(normalized);
};

const valueFormat = (value: string) => {
  const normalized = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return "Email";
  if (/^https?:\/\/\S+$/i.test(normalized)) return "URL";
  if (/^(true|false|yes|no|y|n)$/i.test(normalized)) return "Boolean";
  if (
    /^[$€£]?-?\d{1,3}(,\d{3})*(\.\d+)?%?$/.test(normalized) ||
    /^[$€£]?-?\d+(\.\d+)?%?$/.test(normalized)
  ) {
    return "Number";
  }
  if (
    /^\d{4}-\d{1,2}-\d{1,2}(?:[T\s].*)?$/.test(normalized) ||
    /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(normalized)
  ) {
    return "Date";
  }
  return "Text";
};

const dominantFormat = (values: string[]) => {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const format = valueFormat(value);
    counts.set(format, (counts.get(format) ?? 0) + 1);
  });
  const ordered = [...counts.entries()].sort(
    (left, right) => right[1] - left[1],
  );
  return {
    name: ordered[0]?.[0] ?? "Empty",
    count: ordered[0]?.[1] ?? 0,
    formats: ordered,
  };
};

const casingVariantCount = (values: string[]) => {
  const variants = new Map<string, Set<string>>();
  values.forEach((value) => {
    const trimmed = value.trim();
    const normalized = trimmed.toLocaleLowerCase();
    const set = variants.get(normalized) ?? new Set<string>();
    set.add(trimmed);
    variants.set(normalized, set);
  });
  return [...variants.values()].filter((set) => set.size > 1).length;
};

const duplicateGroups = (rows: string[][]): DuplicateGroup[] => {
  const groups = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const key = JSON.stringify(row.map((value) => value.trim()));
    const rowNumbers = groups.get(key) ?? [];
    rowNumbers.push(index + 2);
    groups.set(key, rowNumbers);
  });

  return [...groups.entries()]
    .filter(([, rowNumbers]) => rowNumbers.length > 1)
    .map(([key, rowNumbers]) => {
      const values = JSON.parse(key) as string[];
      const preview = values
        .slice(0, 4)
        .map((value) => value || "(blank)")
        .join(" | ");
      return { rows: rowNumbers, preview };
    })
    .slice(0, 10);
};

const findingRank: Record<Severity, number> = {
  High: 0,
  Review: 1,
  Note: 2,
};

const buildReport = (
  data: FormData,
  csvText: string,
  sourceName: string,
): DataHealthReport => {
  const parsed = parseCsv(csvText.replace(/^\uFEFF/, ""));
  if (parsed.unclosedQuote) {
    throw new Error(
      "The CSV contains an opening quote without a matching closing quote.",
    );
  }
  if (parsed.rows.length < 2) {
    throw new Error("Add a header row and at least one data row.");
  }

  const useHeader = readValue(data, "header-row") === "header";
  const sourceRows = parsed.rows;
  const widestRow = Math.max(...sourceRows.map((row) => row.length));
  const columnCount = Math.min(widestRow, MAX_COLUMNS);
  const rawHeaders = useHeader ? sourceRows[0] : [];
  const headers = uniqueHeaders(rawHeaders, columnCount);
  const dataRows = (useHeader ? sourceRows.slice(1) : sourceRows)
    .slice(0, MAX_ROWS)
    .map((row) =>
      Array.from({ length: columnCount }, (_, index) => row[index] ?? ""),
    );
  const originalDataRows = useHeader ? sourceRows.slice(1) : sourceRows;
  const missingValues = normalizedMissingValues(
    readValue(data, "missing-values"),
  );
  const findings: Finding[] = [];

  if (dataRows.length === 0) {
    throw new Error("The CSV does not contain any data rows.");
  }

  if (useHeader) {
    const blankHeaderCount = rawHeaders
      .slice(0, columnCount)
      .filter((header) => header.trim() === "").length;
    if (blankHeaderCount > 0) {
      findings.push({
        severity: "Review",
        title: "Unnamed columns",
        detail:
          "Unnamed fields make mapping, ownership, and error resolution harder.",
        evidence: `${blankHeaderCount} ${blankHeaderCount === 1 ? "column has" : "columns have"} no header.`,
      });
    }
  }

  const unevenRows = originalDataRows.filter(
    (row) => row.length !== widestRow,
  ).length;
  if (unevenRows > 0) {
    findings.push({
      severity: "High",
      title: "Uneven row structure",
      detail:
        "Some records contain a different number of cells and may shift values into the wrong fields.",
      evidence: `${unevenRows} of ${originalDataRows.length} data rows differ from the widest row.`,
    });
  }

  const duplicates = duplicateGroups(dataRows);
  const duplicateRowCount = duplicates.reduce(
    (total, group) => total + group.rows.length - 1,
    0,
  );
  if (duplicateRowCount > 0) {
    findings.push({
      severity: "High",
      title: "Exact repeated rows",
      detail:
        "Repeated rows can inflate counts, repeat outreach, or trigger the same workflow more than once.",
      evidence: `${duplicateRowCount} repeated ${duplicateRowCount === 1 ? "row appears" : "rows appear"} after trimming surrounding spaces.`,
    });
  }

  const profiles = headers.map((name, columnIndex): ColumnProfile => {
    const rawValues = dataRows.map((row) => row[columnIndex] ?? "");
    const filledValues = rawValues.filter(
      (value) => !isMissing(value, missingValues),
    );
    const missing = rawValues.length - filledValues.length;
    const normalizedValues = filledValues.map((value) =>
      value.trim().toLocaleLowerCase(),
    );
    const distinct = new Set(normalizedValues).size;
    const format = dominantFormat(filledValues);
    const whitespaceCount = filledValues.filter(
      (value) => value !== value.trim(),
    ).length;
    const casingVariants = casingVariantCount(filledValues);
    const formatShare =
      filledValues.length === 0 ? 1 : format.count / filledValues.length;
    const notes: string[] = [];

    if (missing > 0) {
      const share = missing / rawValues.length;
      notes.push(`${Math.round(share * 100)}% missing`);
      if (share >= 0.5) {
        findings.push({
          severity: "High",
          title: `${name} is mostly missing`,
          detail:
            "A field with limited coverage may not reliably support routing, reporting, or automation.",
          evidence: `${missing} of ${rawValues.length} rows are missing.`,
        });
      } else if (share >= 0.2) {
        findings.push({
          severity: "Review",
          title: `${name} has material gaps`,
          detail:
            "Confirm whether the field is optional, poorly captured, or missing for a meaningful segment.",
          evidence: `${missing} of ${rawValues.length} rows are missing.`,
        });
      }
    }

    if (
      format.formats.length > 1 &&
      formatShare < 0.8 &&
      filledValues.length >= 4
    ) {
      const breakdown = format.formats
        .map(([formatName, count]) => `${formatName}: ${count}`)
        .join(", ");
      notes.push("mixed formats");
      findings.push({
        severity: "Review",
        title: `${name} mixes formats`,
        detail:
          "Mixed formats can break validation, sorting, matching, integrations, and downstream calculations.",
        evidence: breakdown,
      });
    }

    if (whitespaceCount > 0) {
      notes.push(
        `${whitespaceCount} spacing ${whitespaceCount === 1 ? "issue" : "issues"}`,
      );
      findings.push({
        severity: "Review",
        title: `${name} contains surrounding spaces`,
        detail:
          "Invisible spacing can prevent exact matching and create duplicate-looking values.",
        evidence: `${whitespaceCount} filled ${whitespaceCount === 1 ? "value has" : "values have"} leading or trailing spaces.`,
      });
    }

    if (casingVariants > 0) {
      notes.push(
        `${casingVariants} casing ${casingVariants === 1 ? "variant" : "variants"}`,
      );
      findings.push({
        severity: "Review",
        title: `${name} has casing variants`,
        detail:
          "Values that differ only by capitalization may split filters, reports, and workflow branches.",
        evidence: `${casingVariants} normalized ${casingVariants === 1 ? "value appears" : "values appear"} with more than one capitalization.`,
      });
    }

    if (/(^|[\s_-])(id|key|email)([\s_-]|$)/i.test(name)) {
      const duplicateValues = filledValues.length - distinct;
      if (missing > 0 || duplicateValues > 0) {
        notes.push("identifier risk");
        findings.push({
          severity: "High",
          title: `${name} may not work as a reliable identifier`,
          detail:
            "Fields used for matching or record identity usually need explicit uniqueness and completeness rules.",
          evidence: `${missing} missing and ${duplicateValues} repeated filled ${duplicateValues === 1 ? "value" : "values"}.`,
        });
      }
    }

    return {
      name,
      filled: filledValues.length,
      missing,
      distinct,
      format: format.name,
      note: notes.length > 0 ? notes.join("; ") : "No sampled issue detected",
    };
  });

  const truncatedRows = originalDataRows.length > MAX_ROWS;
  const truncatedColumns = widestRow > MAX_COLUMNS;
  if (truncatedRows || truncatedColumns) {
    findings.push({
      severity: "Note",
      title: "Sample limit applied",
      detail:
        "The browser limit keeps the review responsive and reduces unnecessary exposure.",
      evidence: [
        truncatedRows
          ? `Only the first ${MAX_ROWS} data rows were reviewed.`
          : "",
        truncatedColumns
          ? `Only the first ${MAX_COLUMNS} columns were reviewed.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: "Note",
      title: "No sampled rule triggered",
      detail:
        "This means the sampler did not find the specific issues it checks. It does not establish that the data is accurate, current, authorized, or fit for use.",
      evidence: `${dataRows.length} rows and ${headers.length} columns were reviewed.`,
    });
  }

  findings.sort(
    (left, right) =>
      findingRank[left.severity] - findingRank[right.severity] ||
      left.title.localeCompare(right.title),
  );

  const questions = [
    "Which fields actually control routing, eligibility, reporting, customer communication, and automation?",
    "Who owns each critical field, and what happens when its value is missing, late, or disputed?",
    "Which apparent duplicates represent the same customer or organization rather than legitimately separate records?",
    "Do field definitions, consent, retention, and source lineage remain valid for the intended use?",
  ];

  return {
    name: readValue(data, "analysis-name"),
    sourceName,
    rowCount: dataRows.length,
    columnCount: headers.length,
    findings,
    profiles,
    duplicates,
    questions,
    truncatedRows,
    truncatedColumns,
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

const findingCard = (finding: Finding) => {
  const article = document.createElement("article");
  article.className = "theme-card finding-card";

  const heading = document.createElement("div");
  heading.className = "theme-card-heading finding-heading";
  const title = document.createElement("h4");
  title.textContent = finding.title;
  const severity = document.createElement("p");
  severity.className = `severity severity-${finding.severity.toLocaleLowerCase()}`;
  severity.textContent = finding.severity;
  heading.append(title, severity);

  const detail = document.createElement("p");
  detail.className = "theme-description";
  detail.textContent = finding.detail;
  const evidence = document.createElement("p");
  evidence.className = "theme-direction finding-evidence";
  const evidenceLabel = document.createElement("strong");
  evidenceLabel.textContent = "Evidence: ";
  evidence.append(evidenceLabel, finding.evidence);

  article.append(heading, detail, evidence);
  return article;
};

const renderReport = (report: DataHealthReport) => {
  setOutput("analysis-name", report.name);
  setOutput("row-count", String(report.rowCount));
  setOutput("column-count", String(report.columnCount));
  setOutput("finding-count", String(report.findings.length));
  setOutput(
    "duplicate-count",
    String(
      report.duplicates.reduce(
        (total, group) => total + group.rows.length - 1,
        0,
      ),
    ),
  );

  findingList?.replaceChildren(...report.findings.map(findingCard));

  profileBody?.replaceChildren(
    ...report.profiles.map((profile) => {
      const row = document.createElement("tr");
      [
        profile.name,
        String(profile.filled),
        String(profile.missing),
        String(profile.distinct),
        profile.format,
        profile.note,
      ].forEach((value, index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        cell.textContent = value;
        if (index === 0) cell.setAttribute("scope", "row");
        row.append(cell);
      });
      return row;
    }),
  );

  replaceList(
    duplicateList,
    report.duplicates.length > 0
      ? report.duplicates.map(
          (group) => `Rows ${group.rows.join(", ")} repeat: ${group.preview}`,
        )
      : [
          "No exact repeated rows were found after trimming surrounding spaces.",
        ],
  );
  replaceList(questionList, report.questions);
};

const reportAsText = (report: DataHealthReport) => {
  const lines = [
    report.name.toLocaleUpperCase(),
    "CRM DATA HEALTH SNAPSHOT",
    "",
    `Source: ${report.sourceName}`,
    `Rows reviewed: ${report.rowCount}`,
    `Columns reviewed: ${report.columnCount}`,
    `Findings: ${report.findings.length}`,
    `Duplicate rows: ${report.duplicates.reduce(
      (total, group) => total + group.rows.length - 1,
      0,
    )}`,
    "",
    "PRIORITY FINDINGS",
  ];

  report.findings.forEach((finding) => {
    lines.push(
      "",
      `[${finding.severity}] ${finding.title}`,
      finding.detail,
      `Evidence: ${finding.evidence}`,
    );
  });

  lines.push("", "COLUMN PROFILES");
  report.profiles.forEach((profile) => {
    lines.push(
      `- ${profile.name}: ${profile.filled} filled, ${profile.missing} missing, ${profile.distinct} distinct, ${profile.format}; ${profile.note}`,
    );
  });

  lines.push(
    "",
    "EXACT REPEATED ROWS",
    ...(report.duplicates.length > 0
      ? report.duplicates.map(
          (group) => `- Rows ${group.rows.join(", ")}: ${group.preview}`,
        )
      : ["- None found after trimming surrounding spaces."]),
    "",
    "WORKFLOW REVIEW QUESTIONS",
    ...report.questions.map((question) => `- ${question}`),
    "",
    "METHOD AND LIMITS",
    "This report profiles only the rows provided. Format detection is heuristic. Exact duplicates are not the same as duplicate customers, and different records may still describe the same person or organization. The sampler does not validate field definitions, consent, lineage, relationships, business rules, or fitness for migration, automation, reporting, or AI.",
  );

  return lines.join("\n");
};

const selectedCsv = async () => {
  const file = fileInput?.files?.[0];
  if (file) {
    if (file.size > MAX_FILE_BYTES) {
      throw new Error("Choose a CSV file smaller than 2 MB.");
    }
    if (!file.name.toLocaleLowerCase().endsWith(".csv")) {
      throw new Error("Choose a file with a .csv extension.");
    }
    return { text: await file.text(), sourceName: file.name };
  }

  const text = textInput?.value.trim() ?? "";
  if (!text) {
    throw new Error("Choose a CSV file or paste CSV data.");
  }
  return { text, sourceName: "Pasted CSV" };
};

fileInput?.addEventListener("change", () => {
  fileInput.setCustomValidity("");
  const file = fileInput.files?.[0];
  if (!file) {
    if (fileStatus) fileStatus.textContent = "No file selected.";
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    fileInput.setCustomValidity("Choose a CSV file smaller than 2 MB.");
    if (fileStatus) fileStatus.textContent = "File is larger than 2 MB.";
    return;
  }
  if (!file.name.toLocaleLowerCase().endsWith(".csv")) {
    fileInput.setCustomValidity("Choose a file with a .csv extension.");
    if (fileStatus)
      fileStatus.textContent = "File must use the .csv extension.";
    return;
  }
  if (fileStatus) {
    fileStatus.textContent = `${file.name} selected. It will be processed only in this browser.`;
  }
});

textInput?.addEventListener("input", () => {
  fileInput?.setCustomValidity("");
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  try {
    const source = await selectedCsv();
    currentReport = buildReport(
      new FormData(form),
      source.text,
      source.sourceName,
    );
    renderReport(currentReport);
    if (results) results.hidden = false;
    if (reportStatus) {
      reportStatus.textContent = `Reviewed ${currentReport.rowCount} rows and found ${currentReport.findings.length} signals to inspect.`;
    }
    results?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => resultsTitle?.focus(), 350);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The CSV could not be reviewed.";
    fileInput?.setCustomValidity(message);
    fileInput?.reportValidity();
    if (reportStatus) reportStatus.textContent = message;
  }
});

copyButton?.addEventListener("click", async () => {
  if (!currentReport || !reportStatus) return;
  try {
    await navigator.clipboard.writeText(reportAsText(currentReport));
    reportStatus.textContent = "Data-health report copied.";
  } catch {
    reportStatus.textContent =
      "Copy was blocked by the browser. Use Download or Print instead.";
  }
});

downloadButton?.addEventListener("click", () => {
  if (!currentReport || !reportStatus) return;
  const blob = new Blob([reportAsText(currentReport)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename =
    currentReport.name
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "crm-data-sample";
  link.href = url;
  link.download = `${filename}-health-report.txt`;
  link.click();
  URL.revokeObjectURL(url);
  reportStatus.textContent = "Data-health report downloaded.";
});

printButton?.addEventListener("click", () => window.print());

resetButton?.addEventListener("click", () => {
  form?.reset();
  fileInput?.setCustomValidity("");
  if (fileStatus) fileStatus.textContent = "No file selected.";
  if (results) results.hidden = true;
  if (reportStatus) reportStatus.textContent = "";
  currentReport = null;
  form?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(
    () => document.querySelector<HTMLInputElement>("#analysis-name")?.focus(),
    350,
  );
});
