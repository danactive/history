# History

History is a local-first photo and video gallery for turning filesystem media into browsable
albums, maps, and stories. Album metadata is kept in XML, while the original media remains under
the owner's control instead of being uploaded to a hosted media library.

## Project status

| Service | Status |
| --- | --- |
| Deployed | [TEST](https://history.domaindesign.ca/) |

## What it provides

- Gallery and album views for local photos and videos.
- Map-based browsing using the location stored with each photo.
- Storytelling tools built on the same album metadata.
- A dark administration workflow for generating XML, editing descriptions, preparing resized
  media, and composing thumbnail crops.
- Optional offline photo analysis for aesthetic insights, organism identification, and
  architectural-style suggestions. Suggestions are always reviewed before they affect metadata.
- Model Context Protocol (MCP) access to the storytelling and media tools.

## Development

The repository expects Node.js from `.nvmrc` and the npm version declared in `package.json`.

```sh
nvm use
npm ci
npm run dev
```

Open [http://localhost:3030](http://localhost:3030). `npm run dev` starts the Next.js application
only; the Python photo-analysis service is optional and has its own lifecycle.

Common checks are available through `npm run lint:ci`, `npm run test:ci`, `npm run typecheck`, and
`npm run build`. The production server is built with `npm run build` and started with `npm start`.

For a fresh classifier setup—including exact model assets, downloads, Docker startup, health
checks, regression fixtures, and recovery—use the
[photo-classifier agent skill](.agents/skills/photo-classifier/SKILL.md). It is the canonical
runbook rather than duplicating fragile model instructions across README files.

## MCP access

The running Next.js application exposes streaming HTTP MCP at `http://localhost:3030/mcp`. Local
clients can instead start the stdio transport with `npm run mcp`; `mcp.json` intentionally uses
stdio so a client does not connect to two local servers with drifting toolsets.

For a deployed instance, set `HISTORY_APP_ORIGIN` to its public origin so generated media links and
the interactive viewer's content-security policy use the correct host. Clients that require HTTPS
must use a deployed HTTPS `/mcp` endpoint.

## Configuration and documentation

Media sizes, supported formats, gallery defaults, and service ports live in `config.json`. The
current thumbnail target is 185 × 45 pixels; generated derivatives should follow this shared
configuration rather than introducing component-specific dimensions.

See the [changelog](CHANGELOG.md), [MIT license](LICENSE), and
[codebase diagram](diagram.svg).
