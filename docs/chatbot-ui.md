# Chatbot Interface (`chatbot-ui/`)

The only graphical piece of Persona: a static, dependency-free, build-free web app that talks to n8n exclusively through the three chatbot-facing webhooks (chat, profile, unsubscribe). No framework, no bundler, no `npm install` — just native ES modules the browser runs directly.

## Running it

Native ES modules (`import`/`export`) are blocked by browsers when loaded from a `file://` URL, so the folder must be served over HTTP:

```bash
cd chatbot-ui
python3 -m http.server 8080
# or: npx serve .
```

Then open **http://localhost:8080**. The `n8n:` field at the top of the chat lets you point the interface at any n8n instance (default `http://localhost:5678`) without editing code.

## Why this structure

The app is organized in layers, each with exactly one reason to change:

```
chatbot-ui/
├── index.html            Markup only — no inline <style> or <script>
├── package.json          { "type": "module" }, so Node/tools treat js/ as ESM
├── css/
│   ├── tokens.css         Design tokens: the only file with raw color/spacing values
│   ├── base.css           Reset + page-level background
│   ├── sidebar.css        Everything under #sidebar
│   └── chat.css           Everything under #chat
└── js/
    ├── config.js           Constants: endpoints, default URL, keyword lists, regexes
    ├── api/
    │   └── personaApi.js   Facade over fetch — the only file that knows about HTTP
    ├── state/
    │   └── sessionStore.js Observable session state (current user, session id)
    ├── views/
    │   ├── chatView.js      Renders chat messages + the header "logged in" badge
    │   ├── profileView.js   Renders the sidebar: login form, profile card, tags
    │   └── statusView.js    Renders the online/offline indicator
    ├── controllers/
    │   └── chatController.js  Wires DOM events to api + state + views
    └── main.js              Composition root: the only file that calls document.getElementById
```

If you need to change *what a button looks like*, you're in `css/`. If you need to change *what happens when it's clicked*, you're in `chatController.js`. If you need to change *what the sidebar displays*, you're in `profileView.js`. Nothing else should need to change.

## Design patterns in play

| Pattern | Where | Why |
|---|---|---|
| **Facade** | `api/personaApi.js` | Callers ask for `sendChatMessage(...)` / `fetchProfileByCredentials(...)` / `unsubscribe(...)`. They never see `fetch`, headers, JSON encoding, or endpoint paths — swapping the transport later touches one file. |
| **Observer** | `state/sessionStore.js` | `SessionStore.onUsernameChange(listener)` lets views react to a login/logout without the controller having to remember to call every view by hand. |
| **Composition root** | `main.js` | All `document.getElementById` calls live here. Every other module receives DOM elements as parameters — they never query the document themselves, which makes them usable in isolation (and testable without a real page). |
| **Design tokens** | `css/tokens.css` | Every color, radius, and transition duration is a CSS custom property. The four other stylesheets never hardcode a hex value for anything reusable — change the palette once, it propagates everywhere. |

## Data flow for a chat message

1. User types and hits Enter / clicks send → `chatController.sendChatMessage()`
2. Controller calls `PersonaApi.sendChatMessage(baseUrl, { chatInput, sessionId })`
3. Response text is scanned for a `SESSION_USER:username` token (`detectSession`) — if found, the controller updates `SessionStore` and triggers a background profile fetch
4. `chatView.addMessage("bot", reply)` renders the reply
5. If the reply contains an update-related keyword (`config.PROFILE_UPDATE_KEYWORDS`), the sidebar silently refreshes after 600ms

## Extending it

- **New API call**: add a method to `PersonaApi` in `personaApi.js`; add its path to `ENDPOINTS` in `config.js`.
- **New piece of session state**: extend `state` in `sessionStore.js` and expose a getter — keep mutations behind a named method (`setX`), never a raw setter, so `notify()` always fires.
- **New UI section**: add a `views/xyzView.js` with an `initXyzView(elements)` function following the existing views, wire it from `main.js`.
- **New color or spacing value**: add it to `css/tokens.css` first; only fall back to a literal value in a component stylesheet if it is genuinely a one-off (e.g. a decorative gradient stop used nowhere else).
