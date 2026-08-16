# auth.md

> Cadence Lab is a public informational site. No authentication is required
> to access any content.

This file provides access guidance for automated tools and links to
machine-readable registration and OAuth endpoints.

## Agent audience

AI agents, LLM-based crawlers, and automated tools that discover and interact
with web services.

## Agent registration

Cadence Lab content pages remain publicly readable without authentication.
Agent registration endpoints are available for protocol-compliant discovery and
token exchange.

For agents that support the Auth.md protocol, Cadence Lab publishes discovery
metadata at:

- OAuth Protected Resource Metadata:
  [/.well-known/oauth-protected-resource](https://cadencelab.co/.well-known/oauth-protected-resource)
- OAuth Authorization Server Metadata:
  [/.well-known/oauth-authorization-server](https://cadencelab.co/.well-known/oauth-authorization-server)

The `agent_auth` block describes anonymous access with no long-lived
credential.

Registration and OAuth endpoints:

- Register identity: `POST https://cadencelab.co/agent/identity`
- Confirm claim: `POST https://cadencelab.co/agent/identity/claim`
- Exchange token: `POST https://cadencelab.co/oauth2/token`
- Revoke token: `POST https://cadencelab.co/oauth2/revoke`
- Protected example resource: `GET https://cadencelab.co/agent/protected-resource`

## Supported method

- Identity type: `anonymous`
- Credential type: `none` (for registration)
- Supported token scopes: `public`, `read`
- Registration request: `POST /agent/identity` with JSON body
  `{"identity_type":"anonymous"}`
- Claim flow: optional `POST /agent/identity/claim` with
  `identity_assertion`
- Revocation flow: `POST /oauth2/revoke`

Token exchange request examples:

- `grant_type=client_credentials`
- `grant_type=urn:workos:agent-auth:grant-type:claim` with an
  `identity_assertion` issued by `/agent/identity`

Unauthorized requests to protected resources return `401` with a
`WWW-Authenticate` header that points to
`/.well-known/oauth-protected-resource`.

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
