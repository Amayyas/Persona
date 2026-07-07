# Modular Architecture — RSS Sources

## Principle

Workflow 05 (`Persona - News`) is designed to be easily extensible. Adding a new news source requires only **3 additional nodes** and no changes to the other workflows.

## Current Architecture

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  RSS - BBC News  │   │  RSS - Le Monde  │   │ RSS - Hacker News│
│  (rssFeedRead)   │   │  (rssFeedRead)   │   │  (rssFeedRead)   │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                       │
         ▼                      ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Normalize BBC   │   │ Normalize Le Monde│  │ Normalize Hacker │
│   (Code node)    │   │   (Code node)    │   │   (Code node)    │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                │
                                ▼
                   ┌────────────────────────┐
                   │   Merge the sources    │
                   │     (Merge node)       │
                   └────────────┬───────────┘
                                │
                                ▼
                   ┌────────────────────────┐
                   │      Deduplicate       │
                   │     (Code node)        │
                   └────────────┬───────────┘
                                │
                                ▼
                   ┌────────────────────────┐
                   │   Callable Trigger     │
                   │ (Execute Workflow Tri.)│
                   └────────────────────────┘
```

## Normalized Format

Each source is normalized into a common object before merging. This unified format allows the rest of the system (AI filtering, newsletter generation) to treat all sources the same way:

```json
{
  "title": "Article title",
  "link": "https://...",
  "pubDate": "2024-01-01T12:00:00Z",
  "source": "BBC News"
}
```

The **Normalize** node for each source is responsible for mapping that source's RSS-specific fields to this common format.

## Add a New RSS Source

### Step 1 — Add the RSS node

1. Open the `05_Persona - News` workflow in n8n
2. Double-click the canvas to add a node
3. Search for **RSS Feed Read** and add it
4. Name the node `RSS - [Source name]` (for example: `RSS - The Guardian`)
5. Enter the RSS feed URL in the **Feed URL** parameter

Common RSS URL examples:
| Source | RSS URL |
|---|---|
| The Guardian | `https://www.theguardian.com/world/rss` |
| Reuters | `https://feeds.reuters.com/reuters/topNews` |
| TechCrunch | `https://techcrunch.com/feed/` |
| Numerama | `https://www.numerama.com/feed/` |
| Les Echos | `https://www.lesechos.fr/rss/rss_une.xml` |

### Step 2 — Add the normalization node

1. Add a **Code** node after the RSS node
2. Name it `Normalize [Source name]`
3. Paste the following normalization code into it (adjust field names if needed):

```javascript
return $input.all().map(item => ({
  json: {
    title:   item.json.title   || "",
    link:    item.json.link    || item.json.guid || "",
    pubDate: item.json.isoDate || item.json.pubDate || "",
    source:  "The Guardian"    // ← change this name
  }
}));
```

To identify the fields available in the RSS, inspect the raw output of the RSS node in test mode (click the node after execution).

### Step 3 — Connect to Merge

1. Connect the output of the **Normalize [Name]** node to the **Merge the sources** node
2. The Merge node accepts N inputs — just connect an additional input

### Step 4 — Test

1. Click **Test workflow** (button at the bottom of the editor)
2. Trigger the `Manual Trigger`
3. Check that articles from the new source appear in the output of the **Deduplicate** node
4. Verify that the output format matches the expected normalized format

---

## Modular Architecture of Workflow 06 — Newsletter

The Newsletter workflow is also decoupled from the sources thanks to its call to Workflow 05. It does not know where the articles come from — it receives them already normalized and merged. Adding a source in Workflow 05 is enough: **Workflow 06 benefits automatically**.

```
Workflow 07 (Scheduler)
        │
        ▼
Workflow 06 (Newsletter)
        │
        ├── Calls Workflow 05 (News) ◄── all RSS sources
        │
        ├── AI filter (relevance for the user)
        │
        ├── AI summaries
        │
        └── Gmail delivery
```

---

## Best Practices for Adding Sources

### Naming

Follow the convention `RSS - [Official source name]` and `Normalize [Official name]`. This keeps the workflow readable and consistent.

### RSS Feed Validation

Before adding a source, check that its RSS feed is valid and accessible:

```bash
curl -s "https://example.com/rss" | head -50
```

### Handling Unavailable Feeds

If an RSS feed is temporarily unavailable, the RSS Feed Read node will return an error that can block execution. To make the workflow more robust, wrap the RSS node in a try/catch pattern using the node's **Continue On Fail** option (in the node's advanced settings).

### Deduplication

The **Deduplicate** node removes duplicates based on the URL (`link`). If two sources publish the same article (syndication), it will only be included once. This behavior is automatic and requires no changes when adding a source.

---

## Other Workflows with a Modular Architecture

### Workflow 03 — Main Chatbot (AI tools)

The chatbot also follows a modular architecture through its **tools**. Each feature (register, login, update, delete) is an independent workflow exposed as a tool to the AI Agent.

**To add a new chatbot feature** (for example: share a public profile):
1. Create a new workflow with an `Execute Workflow Trigger`
2. Implement the logic in that new workflow
3. In Workflow 03, add a **Tool Workflow** node pointing to the new workflow
4. The AI agent will automatically know when to use the new tool thanks to its description

### Workflow 07 — Scheduler (delivery types)

The Scheduler calls Workflow 06 for each user. If we wanted to add a second delivery channel (for example Slack or Discord), it would be enough to create a workflow equivalent to 06 for that channel and add a call in the Scheduler based on the user's preferences.