// src/lib/tool-helpers.ts
// Shared DOM, form, clipboard, and download primitives for browser-based
// Cadence Lab diagnostic tools.

export const readValue = (data: FormData, name: string): string =>
  String(data.get(name) ?? "").trim();

export const setOutput = (name: string, value: string): void => {
  document
    .querySelectorAll<HTMLElement>(`[data-output="${name}"]`)
    .forEach((element) => {
      element.textContent = value;
    });
};

export const renderList = (
  element: HTMLElement | null,
  items: string[],
): void => {
  if (!element) return;
  element.replaceChildren(
    ...items.map((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      return listItem;
    }),
  );
};

export const setList = (name: string, items: string[]): void => {
  const list = document.querySelector<HTMLElement>(
    `[data-output-list="${name}"]`,
  );
  renderList(list, items);
};

export const slugifyFilename = (value: string, fallback: string): string =>
  value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || fallback;

export const downloadTextFile = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
