# auth.md

> Cadence Lab is a public informational site. No authentication is required
> to access any content.

This file provides access guidance for automated tools and lists
machine-readable discovery resources.

## Agent audience

AI agents, LLM-based crawlers, and automated tools that discover and interact
with web services.

## Authentication policy

All public Cadence Lab pages and machine-readable manifests are readable
without credentials, tokens, or OAuth registration. No protected API
endpoints are exposed on this domain.

## Available machine-readable resources

| Resource        | URL                                                                                               | Format                   |
| --------------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| LLMs.txt        | [/llms.txt](https://cadencelab.co/llms.txt)                                                       | text/plain               |
| API Catalog     | [/.well-known/api-catalog](https://cadencelab.co/.well-known/api-catalog)                         | application/linkset+json |
| A2A Agent Card  | [/.well-known/agent-card.json](https://cadencelab.co/.well-known/agent-card.json)                 | application/json         |
| MCP Server Card | [/.well-known/mcp/server-card.json](https://cadencelab.co/.well-known/mcp/server-card.json)       | application/json         |
| Agent Skills    | [/.well-known/agent-skills/index.json](https://cadencelab.co/.well-known/agent-skills/index.json) | application/json         |
| Sitemap         | [/sitemap.xml](https://cadencelab.co/sitemap.xml)                                                 | application/xml          |
| robots.txt      | [/robots.txt](https://cadencelab.co/robots.txt)                                                   | text/plain               |

## Contact

To discuss future integrations, visit
[cadencelab.co/contact/](https://cadencelab.co/contact/).
