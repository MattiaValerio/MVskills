# Optional Mobbin connection

Read when configuring or troubleshooting Mobbin, not for every feature. These
instructions apply to the agent's environment; installing this skill does not connect
an MCP server. Configure only when requested, preserving existing client settings.

## Shared prerequisites

Mobbin's official remote endpoint is `https://api.mobbin.com/mcp`, using Streamable
HTTP and OAuth. Its documentation currently requires Pro, Team or Enterprise; verify
current account eligibility if access fails. The client handles browser sign-in;
credentials and tokens stay in the host's credential storage, outside application
code, frontend env files and research notes.

## Claude Code

Mobbin recommends connecting its verified connector in Claude Desktop/Web first;
Claude Code can inherit that connector. Verify availability in the actual Code
session, including any connector restrictions in the installed version.

For a CLI-only connection, Mobbin documents:

```sh
claude mcp add mobbin --scope user --transport http https://api.mobbin.com/mcp
```

Start a new Claude Code session, open `/mcp`, select Mobbin and Authenticate.
The user completes OAuth in the browser. The command above uses user scope;
choose another scope only when requested. Check existing servers first to avoid
registering a duplicate under a different alias.

## Codex

Check existing servers with `codex mcp list`. For a requested new connection:

```sh
codex mcp add mobbin --url https://api.mobbin.com/mcp
codex mcp login mobbin
```

The user completes browser OAuth. Alternatively, merge this table into the chosen
Codex configuration, preserving unrelated settings and an existing equivalent entry:

```toml
[mcp_servers.mobbin]
url = "https://api.mobbin.com/mcp"
required = false
```

Use `codex mcp --help` for the installed CLI's supported options. Reopen/refresh the
session as needed and verify callable tools; a configuration entry alone is not proof
of successful authentication or tool access. Claude Code and Codex manage their
connections separately; do not copy OAuth tokens between them. Workers may expose a
different subset of tools even when the parent can use Mobbin.

## Capability and failure checks

Inspect live schemas for screen, flow and section search. Standard screen search is
the default; Deep Search consumes credits and is explicit-request only. Do not bake
credit prices or quotas into the workflow. Downloading or viewing a high-resolution
image is distinct from a search result preview. Mobbin currently documents a 30-day
expiry for returned image URLs; retain source identities and decisions as well.

On absent tools, denied access, network failure or irrelevant results, apply the
entrypoint's bounded fallback. On 429 respect Retry-After, without repeated polling.
If images cannot be viewed in the host, report that visual comparison is limited.
Successful searches do not imply automatic token extraction, UI generation or code
export. Verify such capabilities from the actual tools before using them.

## Official sources

Verified 2026-10-20; consult the current pages when configuring a client:

- [Mobbin transport, OAuth and plans](https://docs.mobbin.com/mcp/introduction)
- [Claude Code setup](https://docs.mobbin.com/mcp/clients/claude-code-cli)
- [Other MCP clients](https://docs.mobbin.com/mcp/clients/other)
- [Search tools and images](https://docs.mobbin.com/mcp/features)
- [AI credits](https://docs.mobbin.com/ai-credits)
- [Rate limits](https://docs.mobbin.com/rate-limits)
- [Codex MCP configuration and OAuth](https://developers.openai.com/codex/mcp)
