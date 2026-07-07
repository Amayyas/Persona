# Getting Started

## Prerequisites

- Docker (recommended) **or** Node.js 18+
- A Google account (for Google Sheets and Gmail)
- An OpenAI API key
- A modern web browser

---

## 1. Install and Start n8n

### Option A — Docker (recommended)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

To persist data across restarts:

```bash
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Option B — global npm

```bash
npm install -g n8n
n8n start
```

n8n will be available at **http://localhost:5678**.

---

## 2. Import the workflows

1. Open **http://localhost:5678** in a browser
2. Create an account (first use) or sign in
3. In the menu, go to **Workflows**
4. Click **Add workflow** > **Import from file**
5. Repeat the operation for each of the 10 `.json` files in the `workflows/` folder, in numbered order:

| Order | File |
|---|---|
| 1 | `01_Persona - Register User.json` |
| 2 | `02_Persona - Login User.json` |
| 3 | `03_Persona - Main Chatbot.json` |
| 4 | `04_Persona - Update User.json` |
| 5 | `05_Persona - News.json` |
| 6 | `06_Persona - Newsletter.json` |
| 7 | `07_Persona - Scheduler.json` |
| 8 | `08_Persona - Delete User.json` |
| 9 | `09_Persona - Profile.json` |
| 10 | `10_Persona - Unsubscribe.json` |

---

## 3. Configure the credentials

Before activating the workflows, you need to set up the credentials in n8n.

### OpenAI

1. Go to **Settings** > **Credentials** > **Add credential**
2. Choose **OpenAI**
3. Enter the API key (available on platform.openai.com)

### Google Sheets

1. Go to **Settings** > **Credentials** > **Add credential**
2. Choose **Google Sheets OAuth2**
3. Follow the OAuth flow (Google sign-in + access authorization)
4. Create a Google Sheet with a sheet named `users` containing the following columns (in this order):
   `id | username | password_hash | email | interests | schedule | active | created_at`
5. In each imported workflow, open the Google Sheets nodes and replace the `YOUR_GOOGLE_SHEET_ID` placeholder (in the **Document** field) with your own spreadsheet's ID

### Gmail

1. Go to **Settings** > **Credentials** > **Add credential**
2. Choose **Gmail OAuth2**
3. Follow the OAuth flow with the Gmail account that will send the newsletters

### Link the credentials to the workflows

In each workflow, click the nodes that use these services (marked with a yellow warning icon) and select the corresponding credential created above.

---

## 4. Configure the Google Sheet

The Google Sheets spreadsheet serves as the user database. It must contain a sheet named `users` (or you can adapt the nodes) with these exact columns:

| id | username | password_hash | email | interests | schedule | active | created_at |
|---|---|---|---|---|---|---|---|
| `<uuid>` | alice | `<sha256 hash>` | alice@mail.com | tech,sport | 08:00 | TRUE | 2026-01-01T00:00:00.000Z |

- **interests**: comma-separated values
- **schedule**: `HH:MM` format (for example `08:00`, `18:30`)
- **active**: `TRUE` or `FALSE` (set to `FALSE` when unsubscribing)

---

## 5. Activate the workflows

For each imported workflow:
1. Open the workflow
2. Click the **Active** button (toggle in the top-right corner)

The `03_Persona - Main Chatbot` workflow must be active for the chatbot to respond.

The `07_Persona - Scheduler` workflow must be active for newsletters to be sent automatically.

---

## 6. Launch the interface

`chatbot-ui/` is built from native ES modules (`import`/`export`), so it must be served over HTTP — browsers refuse to load modules from a `file://` URL. Serve the folder with any static server, for example:

```bash
cd chatbot-ui && python3 -m http.server 8080
```

Then open **http://localhost:8080** in a browser.

n8n's URL is configured in the bar at the bottom of the header (default: `http://localhost:5678`). Change it if n8n is running on another port or another machine.

---

## Essential Commands

### Docker

```bash
# Start n8n
docker start n8n

# Stop n8n
docker stop n8n

# View logs
docker logs -f n8n

# Restart
docker restart n8n
```

### npm

```bash
# Start n8n
n8n start

# Start with detailed logs
N8N_LOG_LEVEL=debug n8n start
```

### Check that n8n is online

```bash
curl http://localhost:5678/healthz
```

---

## Webhook Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/webhook/persona-chatbot-webhook-001/chat` | POST | Chatbot entry point |
| `/webhook/persona-profile` | POST | Retrieve the user profile |
| `/webhook/persona-unsubscribe` | POST | GDPR unsubscribe |

All endpoints expect JSON (`Content-Type: application/json`).
