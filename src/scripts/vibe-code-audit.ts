// src/scripts/vibe-code-audit.ts
// Client for the Vibe Code Audit. Sends the URL and Turnstile token to
// /api/vibe-audit, renders the result with textContent only (scan data is
// never inserted as HTML), and builds the copy-ready fix prompts locally.

import {
  allIssuesPrompt,
  issuePrompt,
  type AuditResult,
  type Finding,
} from "../lib/vibe-audit/checks";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

const form = document.querySelector<HTMLFormElement>("#audit-form");
const results = document.querySelector<HTMLElement>("#audit-results");
const dialog = document.querySelector<HTMLDialogElement>(
  "[data-improve-dialog]",
);

const CIRCUMFERENCE = 2 * Math.PI * 52;
const SEVERITY_LABEL: Record<Finding["severity"], string> = {
  critical: "Critical",
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setOut(name: string, value: string) {
  document
    .querySelectorAll<HTMLElement>(`[data-out="${name}"]`)
    .forEach((n) => {
      n.textContent = value;
    });
}

async function copyText(text: string, button: HTMLButtonElement) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select the text and copy it";
  }
  window.setTimeout(() => {
    button.textContent = original;
  }, 2200);
}

function hostLabel(url: string): string {
  try {
    const u = new URL(url);
    return u.host + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
}

function renderCategories(result: AuditResult) {
  const list = document.querySelector<HTMLUListElement>("[data-categories]");
  if (!list) return;
  list.replaceChildren(
    ...result.categories.map((c) => {
      const li = el("li", "vibe-category");
      const head = el("div", "vibe-category-head");
      head.append(
        el("h4", undefined, c.label),
        el("span", "vibe-category-score", `${c.score}`),
      );
      const bar = el("div", "vibe-bar");
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", `${c.label}: ${c.score} out of 100`);
      const fill = el("span", "vibe-bar-fill");
      fill.style.width = `${c.score}%`;
      bar.append(fill);
      li.append(
        head,
        el("p", "vibe-category-desc", c.description),
        bar,
        el(
          "p",
          "vibe-category-meta",
          `${c.passed} of ${c.total} checks passed`,
        ),
      );
      return li;
    }),
  );
}

function renderIssues(result: AuditResult, failed: Finding[]) {
  const wrap = document.querySelector<HTMLElement>("[data-issues]");
  if (!wrap) return;
  wrap.replaceChildren();
  if (!failed.length) {
    wrap.append(
      el("p", "vibe-all-clear", "No issues found. Every check passed."),
    );
    return;
  }
  const order = result.categories.map((c) => c.id);
  for (const catId of order) {
    const items = failed.filter((f) => f.category === catId);
    if (!items.length) continue;
    const cat = result.categories.find((c) => c.id === catId);
    const section = el("section", "vibe-issue-group");
    const header = el("div", "vibe-issue-group-head");
    header.append(
      el("h3", undefined, cat?.label ?? catId),
      el(
        "span",
        "vibe-issue-group-count",
        `${cat?.passed ?? 0}/${cat?.total ?? 0}`,
      ),
    );
    const list = el("ul", "disclosure-list");
    list.setAttribute("role", "list");
    items.forEach((f, index) => {
      const li = el("li");
      const details = el("details", "disclosure vibe-issue");
      details.setAttribute("name", `vibe-${catId}`);
      if (index === 0) details.open = true;
      const summary = el("summary", "disclosure-summary");
      const title = el("span", "disclosure-title", f.title);
      summary.append(
        title,
        el(
          "span",
          `vibe-severity vibe-severity-${f.severity}`,
          SEVERITY_LABEL[f.severity],
        ),
      );
      const body = el("div", "disclosure-body vibe-issue-body");
      const dl = el("dl");
      for (const [term, value] of [
        ["Goal", f.goal],
        ["Issue", f.issue],
        ["How to fix it", f.fix],
      ] as const) {
        dl.append(
          el("dt", undefined, term),
          el("dd", term === "Issue" ? "vibe-issue-text" : undefined, value),
        );
      }
      body.append(dl);
      if (f.docs.length) {
        const docs = el("p", "vibe-docs");
        docs.append(el("span", "vibe-docs-label", "Resources: "));
        f.docs.forEach((d, i) => {
          const a = el("a", undefined, d.label);
          a.href = d.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          docs.append(a);
          if (i < f.docs.length - 1) docs.append(document.createTextNode(", "));
        });
        body.append(docs);
      }
      const copy = el(
        "button",
        "button button-secondary vibe-copy",
        "Copy prompt",
      );
      copy.type = "button";
      copy.addEventListener("click", () =>
        copyText(issuePrompt(f, result.url), copy),
      );
      body.append(copy);
      details.append(summary, body);
      li.append(details);
      list.append(li);
    });
    section.append(header, list);
    wrap.append(section);
  }
}

function render(result: AuditResult) {
  const failed = result.findings.filter((f) => !f.passed);
  const passed = result.findings.filter((f) => f.passed);

  setOut("score", String(result.score));
  setOut("url", hostLabel(result.url));
  setOut("rating", result.rating);
  setOut("likelihood", result.likelihood);
  setOut("likelihood-reason", result.likelihoodReason);
  setOut("issue-count", String(failed.length));
  setOut("dialog-count", String(failed.length));
  setOut("passed-count", String(passed.length));

  const scoreBox = document.querySelector<HTMLElement>(".vibe-score");
  scoreBox?.setAttribute("data-rating", result.rating.toLowerCase());
  scoreBox?.setAttribute(
    "aria-label",
    `Score ${result.score} out of 100, ${result.rating}`,
  );
  const ring = document.querySelector<SVGCircleElement>("[data-score-ring]");
  if (ring) {
    ring.style.strokeDasharray = `${CIRCUMFERENCE}`;
    ring.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - result.score / 100)}`;
  }

  const improve = document.querySelector<HTMLButtonElement>("[data-improve]");
  if (improve) improve.hidden = failed.length === 0;
  const allPrompt = document.querySelector<HTMLElement>("[data-all-prompt]");
  if (allPrompt) allPrompt.textContent = allIssuesPrompt(result);

  renderCategories(result);
  renderIssues(result, failed);

  const passedList = document.querySelector<HTMLUListElement>("[data-passed]");
  passedList?.replaceChildren(
    ...passed.map((f) => el("li", undefined, f.title)),
  );
  const limits = document.querySelector<HTMLUListElement>("[data-limits]");
  limits?.replaceChildren(
    ...result.notChecked.map((t) => el("li", undefined, t)),
  );

  if (results) {
    results.hidden = false;
    document.querySelector<HTMLElement>("#results-title")?.focus();
  }
}

function showError(message: string) {
  const box = document.querySelector<HTMLElement>("#audit-error");
  if (!box) return;
  box.textContent = message;
  box.hidden = !message;
}

if (form) {
  const button = form.querySelector<HTMLButtonElement>("[data-scan-button]");
  const status = form.querySelector<HTMLElement>("[data-scan-status]");
  const input = form.querySelector<HTMLInputElement>("#audit-url");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    const url = input?.value.trim() ?? "";
    if (!url) {
      showError("Enter a website address to scan.");
      input?.focus();
      return;
    }
    const token = (
      form.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')
        ?.value ?? ""
    ).trim();
    if (!token) {
      showError(
        "The security check is still loading. Wait a moment, then scan again.",
      );
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Scanning…";
    }
    if (status)
      status.textContent =
        "Scanning the site. This usually takes a few seconds.";

    try {
      const response = await fetch("/api/vibe-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ url, token }),
      });
      const data = (await response.json().catch(() => null)) as
        (AuditResult & { error?: string }) | null;
      if (!response.ok || !data || data.error) {
        showError(data?.error ?? "The scan didn’t finish. Please try again.");
      } else {
        render(data);
      }
    } catch {
      showError(
        "The scanner couldn’t be reached. Check your connection and try again.",
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Scan";
      }
      if (status) status.textContent = "";
      // Each Turnstile token works once.
      window.turnstile?.reset();
    }
  });

  document.querySelector("[data-rescan]")?.addEventListener("click", () => {
    if (results) results.hidden = true;
    if (input) {
      input.value = "";
      input.focus();
    }
    form.scrollIntoView({ block: "start" });
  });
}

const improveButton =
  document.querySelector<HTMLButtonElement>("[data-improve]");
improveButton?.addEventListener("click", () => dialog?.showModal());
document
  .querySelector("[data-close-dialog]")
  ?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
const copyAll = document.querySelector<HTMLButtonElement>("[data-copy-all]");
copyAll?.addEventListener("click", () => {
  const text =
    document.querySelector<HTMLElement>("[data-all-prompt]")?.textContent ?? "";
  if (text) copyText(text, copyAll);
});
