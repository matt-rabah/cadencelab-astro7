// Generates editor-specific MCP configs from the single source list in
// mcp_config.json (Windsurf / Antigravity format, which uses `serverUrl`).
//
//   node scripts/sync-mcp-config.mjs          write the generated files
//   node scripts/sync-mcp-config.mjs --check  exit 1 if any generated file is stale
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "mcp_config.json");
const checkOnly = process.argv.includes("--check");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const servers = Object.entries(source.mcpServers ?? {}).map(
  ([name, config]) => {
    const url = config?.serverUrl;
    if (typeof url !== "string" || url.length === 0) {
      throw new Error(`mcp_config.json: server "${name}" has no "serverUrl".`);
    }
    return [name, url];
  },
);

const targets = {
  // VS Code: https://code.visualstudio.com/docs/copilot/reference/mcp-configuration
  ".vscode/mcp.json": {
    servers: Object.fromEntries(
      servers.map(([name, url]) => [name, { type: "http", url }]),
    ),
  },
  // Cursor: https://docs.cursor.com/context/model-context-protocol
  ".cursor/mcp.json": {
    mcpServers: Object.fromEntries(
      servers.map(([name, url]) => [name, { url }]),
    ),
  },
};

let stale = false;
for (const [relative, config] of Object.entries(targets)) {
  const target = path.join(root, relative);
  const expected = `${JSON.stringify(config, null, 2)}\n`;
  const current = fs.existsSync(target)
    ? fs.readFileSync(target, "utf8")
    : null;
  if (current === expected) continue;

  if (checkOnly) {
    console.error(`${relative} is out of date. Run: npm run mcp:sync`);
    stale = true;
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, expected);
  console.log(`Wrote ${relative}`);
}

if (stale) process.exit(1);
