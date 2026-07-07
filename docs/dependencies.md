# Dependencies and Prerequisites

## Required Software

### n8n

| Item | Value |
|---|---|
| Minimum version | 1.0.0 |
| Recommended version | Latest stable |
| Official website | https://n8n.io |
| Documentation | https://docs.n8n.io |

**Installation:**

```bash
# Via Docker (recommended)
docker pull n8nio/n8n

# Via npm
npm install -g n8n
```

### Docker *(if using the Docker option)*

| Item | Value |
|---|---|
| Minimum version | 20.x |
| Official website | https://www.docker.com |

### Node.js *(if using the npm option)*

| Item | Value |
|---|---|
| Minimum version | 18.x LTS |
| Recommended version | 20.x LTS |
| Official website | https://nodejs.org |

### Web Browser

Any modern browser supporting the `fetch` API and native ES modules (Chrome, Firefox, Edge, Safari).
`chatbot-ui/` must be served over HTTP (e.g. `python3 -m http.server`) — browsers block ES module imports from a `file://` URL.

---

## Required External Services

### OpenAI

- Account on [platform.openai.com](https://platform.openai.com)
- API key (format `sk-...`)
- Model used: `gpt-4o-mini` or any model compatible with OpenAI Chat Completions
- Usage: AI article filtering, summary generation, chatbot agent

> The AI model is not an evaluation criterion. A lower-cost model is perfectly fine.

### Google Sheets

- Google account
- OAuth2 credential authorized for the Google Sheets API
- A spreadsheet created and shared with the service or OAuth account

Required OAuth scope:
- `https://www.googleapis.com/auth/spreadsheets`

### Gmail

- Google account (can be the same one used for Google Sheets)
- Gmail OAuth2 credential authorized to send emails

Required OAuth scope:
- `https://www.googleapis.com/auth/gmail.send`

---

## n8n Nodes Used

### Native Nodes (included in n8n)

| Node | Workflow(s) | Usage |
|---|---|---|
| `Chat Trigger` | 03 | Chatbot entry point |
| `AI Agent` | 03 | Main AI orchestrator |
| `Window Buffer Memory` | 03 | Conversational session memory |
| `OpenAI Chat Model` | 03, 06 | Language model |
| `LLM Chain` | 06 | Article filtering and summarization |
| `Execute Workflow Trigger` | 01, 02, 04, 05, 08 | Trigger callable from another workflow |
| `Execute Workflow` | 06, 07 | Call a sub-workflow |
| `Tool Workflow` | 03 | AI tool pointing to a sub-workflow |
| `Schedule Trigger` | 07 | Cron trigger |
| `Webhook` | 09, 10 | HTTP endpoints |
| `Respond to Webhook` | 09, 10 | HTTP response |
| `Google Sheets` | 01, 02, 04, 07, 08, 09, 10 | User database |
| `Gmail` | 06 | Newsletter sending |
| `RSS Feed Read` | 05 | Read RSS feeds |
| `Merge` | 05 | Merge multiple feeds |
| `Code` | Several | Custom JavaScript logic |
| `If` | 01, 04, 08 | Conditional branching |
| `Set` | 01, 04, 08 | Define output values |

### Community Nodes

No community nodes are required. All used nodes are official nodes included in n8n.

---

## Optional n8n Environment Variables

These variables can be set to customize n8n behavior:

```bash
# Listening port (default: 5678)
N8N_PORT=5678

# Public URL (if exposed behind a reverse proxy)
N8N_HOST=localhost
WEBHOOK_URL=http://localhost:5678

# Log level
N8N_LOG_LEVEL=info   # debug | info | warn | error

# Timezone (important for the scheduler)
GENERIC_TIMEZONE=Europe/Paris
```

For Docker:

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE=Europe/Paris \
  -e N8N_LOG_LEVEL=info \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

---

## Accounts to Create

| Service | Free? | Notes |
|---|---|---|
| Self-hosted n8n | Yes | Free locally |
| OpenAI | Paid (credits) | Students: free credits may be available |
| Google (Sheets + Gmail) | Yes | A single Google account is enough |
