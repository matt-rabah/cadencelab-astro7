# auth.md

> Cadence Lab is a public informational site. No authentication is required
> to access any content.

This file provides access guidance for automated tools. It is not an
authorization endpoint, token endpoint, registration endpoint, or JWKS
endpoint.

## Agent audience

AI agents, LLM-based crawlers, and automated tools that discover and interact
with web services.

## Agent registration

**No registration is required.**

Cadence Lab does not currently operate protected APIs. All site content,
including pages, blog posts, diagnostic service descriptions, and
machine-readable resources, is publicly accessible without authentication,
API keys, or registration.

For agents that support the Auth.md protocol, Cadence Lab publishes discovery
metadata at:

- OAuth Protected Resource Metadata:
  [/.well-known/oauth-protected-resource](https://cadencelab.co/.well-known/oauth-protected-resource)
- OAuth Authorization Server Metadata:
  [/.well-known/oauth-authorization-server](https://cadencelab.co/.well-known/oauth-authorization-server)

The `agent_auth` block describes anonymous access with no credential. The
`register_uri` points back to these instructions because there is no account
creation or registration request to submit.

## Supported method

- Identity type: `anonymous`
- Credential type: `none`
- Supported scopes: none
- Registration request: none
- Claim flow: not applicable
- Revocation flow: not applicable

Do not send credentials or attempt a registration `POST`. Retrieve public
resources directly with `GET` requests.

## Available machine-readable resources

| Resource | URL | Format |
|----------|-----|--------|
| LLMs.txt | [/llms.txt](https://cadencelab.co/llms.txt) | text/plain |
| API Catalog | [/.well-known/api-catalog](https://cadencelab.co/.well-known/api-catalog) | application/linkset+json |
| A2A Agent Card | [/.well-known/agent-card.json](https://cadencelab.co/.well-known/agent-card.json) | application/json |
| MCP Server Card | [/.well-known/mcp/server-card.json](https://cadencelab.co/.well-known/mcp/server-card.json) | application/json |
| Agent Skills | [/.well-known/agent-skills/index.json](https://cadencelab.co/.well-known/agent-skills/index.json) | application/json |
| Sitemap | [/sitemap-index.xml](https://cadencelab.co/sitemap-index.xml) | application/xml |
| robots.txt | [/robots.txt](https://cadencelab.co/robots.txt) | text/plain |

## Contact

To discuss future integrations, visit
[cadencelab.co/contact/](https://cadencelab.co/contact/).
