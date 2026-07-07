# Persona — Personalized AI News Aggregator

[![CI](https://github.com/Amayyas/Persona/actions/workflows/ci.yml/badge.svg)](https://github.com/Amayyas/Persona/actions/workflows/ci.yml)

Persona is an AI-powered personalized newsletter service. There is no dedicated graphical interface: the user interacts only through a chatbot to configure their profile, interests, and delivery schedule. The system then automatically sends a personalized newsletter at the chosen time.

## Overview

| Component | Technology |
|---|---|
| Workflow orchestration | [n8n](https://n8n.io) (self-hosted) |
| Chatbot interface | Static ES-module web app ([chatbot-ui/](chatbot-ui/)) |
| AI model | OpenAI (GPT) |
| User database | Google Sheets |
| Email delivery | Gmail |
| News sources | BBC News, Le Monde, Hacker News (RSS) |

## Features

- Sign-up, login, and account management through the chatbot
- Configuration of interests and newsletter delivery time
- Aggregation of articles from multiple RSS sources
- AI-based article relevance filtering
- Summary generation and HTML newsletter delivery by email
- Automatic scheduled delivery
- GDPR-compliant unsubscribe flow (via chatbot or interface)

## Project Structure

```
persona/
├── .github/
│   ├── workflows/ci.yml         CI: JSON validation, JS lint, secret scan
│   └── scripts/                 Helper scripts used by CI
├── chatbot-ui/                  Chatbot web interface (static ES-module app)
│   ├── index.html                Markup only
│   ├── package.json              Marks js/ as ES modules (no dependencies)
│   ├── css/
│   │   ├── tokens.css             Design tokens (colors, radii, motion)
│   │   ├── base.css               Reset + page background
│   │   ├── sidebar.css            Profile sidebar
│   │   └── chat.css               Chat header, messages, input
│   └── js/
│       ├── main.js                Composition root: wires views + controller
│       ├── config.js              Constants (endpoints, keywords, regexes)
│       ├── api/personaApi.js      Facade over fetch for the n8n webhooks
│       ├── state/sessionStore.js  Observable session state (Observer pattern)
│       ├── views/                 DOM rendering, one file per UI area
│       └── controllers/           Event wiring + orchestration
├── workflows/                  n8n workflows (to import)
│   ├── 01_Persona - Register User.json
│   ├── 02_Persona - Login User.json
│   ├── 03_Persona - Main Chatbot.json
│   ├── 04_Persona - Update User.json
│   ├── 05_Persona - News.json
│   ├── 06_Persona - Newsletter.json
│   ├── 07_Persona - Scheduler.json
│   ├── 08_Persona - Delete User.json
│   ├── 09_Persona - Profile.json
│   └── 10_Persona - Unsubscribe.json
└── docs/
    ├── getting-started.md      Project launch and essential commands
    ├── dependencies.md         Dependencies and prerequisites
    ├── chatbot-ui.md            Chatbot interface architecture and patterns
    ├── n8n-workflow-guide.md    Create and import an n8n workflow
    ├── architecture.md         Full system architecture
    └── modular-rss.md          Modular RSS architecture and adding sources
```

## Quick Start

1. Install and start n8n — see [docs/getting-started.md](docs/getting-started.md)
2. Import the 10 workflows from the `workflows/` folder
3. Configure the credentials (OpenAI, Google Sheets, Gmail)
4. Activate all workflows
5. Serve `chatbot-ui/` with any static file server and open it in a browser, e.g.:
   ```bash
   cd chatbot-ui && python3 -m http.server 8080
   # then open http://localhost:8080
   ```
   A real server (not `file://`) is required because the interface is built from native ES modules — browsers block `import`/`export` across the `file://` origin for security reasons.

## Chatbot Interface Architecture

`chatbot-ui/` is a dependency-free, build-free static app organized in layers, each with a single responsibility:

| Layer | Folder | Responsibility |
|---|---|---|
| Config | `js/config.js` | Constants: endpoint paths, default URL, keyword lists |
| API | `js/api/` | **Facade** over `fetch` — the rest of the app never touches HTTP details directly |
| State | `js/state/` | Tiny **Observer**-based store; views react to session changes instead of being told about them individually |
| Views | `js/views/` | Pure DOM rendering, one file per screen area (chat, profile, status) |
| Controller | `js/controllers/` | Wires DOM events to API calls, state updates, and view rendering |
| Composition root | `js/main.js` | The only file that queries the DOM by ID and wires every layer together |

CSS follows the same idea: `tokens.css` holds design tokens (colors, radii, motion) that every other stylesheet consumes, instead of hardcoded values scattered across files.

## Documentation

| Document | Contents |
|---|---|
| [Getting Started](docs/getting-started.md) | Installation, workflow import, essential commands |
| [Dependencies](docs/dependencies.md) | Software prerequisites and required credentials |
| [Chatbot Interface](docs/chatbot-ui.md) | Frontend architecture, design patterns, how to extend it |
| [n8n Guide](docs/n8n-workflow-guide.md) | Create, import, and configure n8n workflows |
| [Architecture](docs/architecture.md) | Full end-to-end system behavior |
| [Modular RSS Architecture](docs/modular-rss.md) | Add new news sources |

## CI/CD

Every push and pull request to `main` runs three checks (see [.github/workflows/ci.yml](.github/workflows/ci.yml)):

- **Validate n8n workflows**: all `workflows/*.json` files parse as valid JSON, no hardcoded Google Sheet ID has crept back in, and no node reference is dangling after a rename.
- **Lint chat interface**: every file under `chatbot-ui/js/` is checked for syntax errors.
- **Secret scan**: [gitleaks](https://github.com/gitleaks/gitleaks) scans the diff for leaked credentials.

## License

This project is licensed under the [MIT License](LICENSE).
