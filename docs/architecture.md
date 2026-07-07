# Persona System Architecture

## Overview

Persona relies entirely on **n8n** as the orchestration engine. There is no separate application backend: all business logic lives in n8n workflows. The only user interface is `chatbot-ui/`, a static ES-module web app that communicates with n8n through HTTP webhooks.

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
└───────────────────────────┬─────────────────────────────────┘
                            │ Served locally, opened in the browser
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       chatbot-ui/                            │
│  ┌──────────────┐    ┌───────────────────────────────────┐  │
│  │   Sidebar    │    │          Chat area                │  │
│  │  (profile)   │    │   (messages, input, history)      │  │
│  └──────┬───────┘    └────────────────┬──────────────────┘  │
└─────────┼─────────────────────────────┼────────────────────┘
          │ POST /webhook/persona-profile│ POST /webhook/persona-chatbot.../chat
          │ POST /webhook/persona-unsub  │
          ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                          n8n                                │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │  Workflow 09 │    │       Workflow 03                 │  │
│  │   Profile    │    │       Main Chatbot               │  │
│  └──────┬───────┘    │  ┌──────────────────────────┐    │  │
│         │            │  │       AI Agent           │    │  │
│  ┌──────┴───────┐    │  │  (OpenAI GPT + memory)   │    │  │
│  │  Workflow 10 │    │  └────────────┬─────────────┘    │  │
│  │  Unsubscribe │    │               │ Tools             │  │
│  └──────────────┘    │    ┌──────────┼──────────┐        │  │
│                      │    ▼          ▼          ▼        │  │
│                      │  WF 01     WF 02      WF 04       │  │
│                      │ Register  Login       Update      │  │
│                      │                    (+ WF 08 Del)  │  │
│                      └──────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Workflow 07 — Scheduler (hourly cron)       │ │
│  │   Reads Google Sheets → filters by time → calls WF06   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────┐    ┌───────────────────────────────────┐  │
│  │  Workflow 05 │    │       Workflow 06                 │  │
│  │    News      │◄───│       Newsletter                  │  │
│  │  (RSS → data)│    │  (AI filtering + summaries + Gmail)│  │
│  └──────────────┘    └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                        │
          ▼                        ▼
┌──────────────────┐    ┌──────────────────────┐
│  Google Sheets   │    │        Gmail          │
│  (user database) │    │  (newsletter delivery)│
└──────────────────┘    └──────────────────────┘
```

---

## Full Flow: From First Interaction to Newsletter

### 1. The user opens the chatbot

The user opens `chatbot-ui/` (served locally, see [Getting Started](getting-started.md)) in their browser. `js/main.js` generates a random `sessionId` that identifies the conversation session.

### 2. The user sends a message

Each message is sent through an HTTP `POST` request to the n8n webhook:

```
POST http://localhost:5678/webhook/persona-chatbot-webhook-001/chat
{
  "chatInput": "I want to sign up",
  "sessionId": "session-abc123"
}
```

### 3. Workflow 03 — Main Chatbot receives the message

The `Chat Trigger` starts the workflow. The message is passed to the **AI Agent**, which has:

- **OpenAI GPT** as the language model (the agent's brain)
- **Window Buffer Memory** to remember previous session exchanges
- **4 tools** that are calls to other workflows:
  - `Call 'Register User'` → Workflow 01
  - `Call 'Login User'` → Workflow 02
  - `Call 'Update User'` → Workflow 04
  - `Call 'Delete User'` → Workflow 08

The agent decides by itself which tool to use based on the user's message. It can chain multiple calls, for example to check whether the user is logged in before updating their profile.

### 4. Registration — Workflow 01

If the agent calls `Register User`:

1. Reads all users from Google Sheets
2. Checks whether the username already exists
3. If available: creates a new row in Google Sheets
4. Returns `{success: true}` or `{success: false, message: "..."}`

### 5. Login — Workflow 02

If the agent calls `Login User`:

1. Reads all users from Google Sheets
2. Looks for the username/password combination
3. Returns the account data if found

When login succeeds, the agent includes the `SESSION_USER:username` token in its response. `chatController.js` detects this token, extracts the username, and automatically loads the profile in the sidebar.

### 6. Profile update — Workflow 04

If the agent calls `Update User` (email, interests, schedule):

1. Reads all users
2. Checks that the field being modified is allowed
3. Updates the corresponding cell in Google Sheets
4. Returns the result

After an update, the chatbot responds with keywords ("updated", "saved", etc.) that trigger an automatic refresh of the sidebar (see `PROFILE_UPDATE_KEYWORDS` in `chatbot-ui/js/config.js`).

### 7. Account deletion — Workflow 08

If the agent calls `Delete User`:

1. Reads all users
2. Finds the user's row
3. Deletes the row from Google Sheets

### 8. Automatic scheduler — Workflow 07

Workflow 07 runs **every hour** through a `Schedule Trigger` (cron).

At each run:
1. Reads all users from Google Sheets
2. Filters users whose schedule matches the current time **and** whose account is active (`active = TRUE`)
3. For each selected user, calls Workflow 06 (Newsletter) with the user's data

### 9. Newsletter generation — Workflow 06

Workflow 06 is the heart of the news system. For each user:

1. **Article retrieval**: calls Workflow 05 (News), which returns all aggregated articles
2. **AI filtering**: sends the articles and the user's interests to an LLM Chain (OpenAI) that selects the relevant articles
3. **AI summaries**: for each selected article, generates a short summary through a second LLM Chain
4. **HTML assembly**: builds an HTML email with the articles and their summaries
5. **Gmail delivery**: sends the email to the user's address

### 10. RSS aggregation — Workflow 05

Workflow 05 is a data library:

1. Reads the BBC News, Le Monde, and Hacker News RSS feeds simultaneously
2. Normalizes each source (same output format: title, link, date, source)
3. Merges the three feeds
4. Deduplicates the articles (same URL or same title)
5. Returns the consolidated list

### 11. Sidebar profile — Workflow 09

Triggered by the "Load my profile" button in `chatbot-ui/`:

```
POST /webhook/persona-profile
{"username": "alice", "password": "password"}
```

The workflow checks the credentials and returns the profile data (email, interests, schedule).

### 12. Unsubscribe — Workflow 10

Triggered by the "Unsubscribe" button in `chatbot-ui/`:

```
POST /webhook/persona-unsubscribe
{"username": "alice"}
```

The workflow sets the `active` field to `FALSE` in Google Sheets. The user will no longer receive newsletters (the Scheduler filters inactive accounts) without their data being deleted (minimum GDPR compliance).

---

## Database — Google Sheets

Google Sheets acts as the user database. Each row represents one user.

| Column | Type | Description |
|---|---|---|
| `id` | Text | Unique user ID (UUID) |
| `username` | Text | Unique login identifier |
| `password_hash` | Text | SHA-256 hash of the password (never stored in plain text) |
| `email` | Text | Email address for the newsletter |
| `interests` | Text | Comma-separated interests |
| `schedule` | Text | Desired time in `HH:MM` format |
| `active` | Boolean | `TRUE` = subscribed, `FALSE` = unsubscribed |
| `created_at` | Text | Account creation timestamp (ISO 8601) |

The sheet must be named `users`.

---

## Security and GDPR

### Authentication

The AI agent keeps the session context in memory. Before modifying data, it checks (through its prompt system) that the user is logged in. Passwords are checked during login via Workflow 02.

### GDPR

- **Right of access**: the profile can be viewed through the `chatbot-ui/` sidebar
- **Right to rectification**: the user can modify email, interests, and schedule via the chatbot
- **Right to erasure**: complete account deletion via the chatbot (Workflow 08)
- **Right to object**: unsubscribe without deleting the account via the button in the sidebar (Workflow 10)