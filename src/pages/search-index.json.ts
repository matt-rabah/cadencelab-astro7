import type { APIRoute } from "astro";
import { getSearchEntries } from "../lib/search";

// Entries for the ⌘K search dialog. The dialog fetches this file the first
// time it opens, so the entries are not rendered as hidden HTML on every page.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await getSearchEntries()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
