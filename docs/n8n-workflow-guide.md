# n8n Guide — Create and Import a Workflow

## Fundamental Concepts

### Workflow

A n8n workflow is a sequence of connected **nodes**. Each execution starts from a **trigger** and traverses the nodes in connection order.

### Node

A node is a single block that performs an operation: reading a Google Sheet, sending an email, calling an AI, running JavaScript code, etc. Each node has configurable **parameters** and produces **output data** passed to the next node.

### Trigger

The trigger is the starting node of a workflow. There can only be one active trigger per execution. In Persona, three types of triggers are used:

| Type | Node | Workflow |
|---|---|---|
| Chat message received | `Chat Trigger` | 03 — Main Chatbot |
| Call from another workflow | `Execute Workflow Trigger` | 01, 02, 04, 05, 08 |
| HTTP request | `Webhook` | 09, 10 |
| Cron schedule | `Schedule Trigger` | 07 |

### Credential

A credential is a reusable authentication configuration (API key, OAuth, etc.). It is created once and can be shared between multiple nodes and workflows.

---

## Import the Persona Workflows

1. Open n8n at **http://localhost:5678**
2. In the left sidebar, click **Workflows**
3. Click the **+** button or **Add workflow**
4. In the dropdown menu, choose **Import from file**
5. Select a `.json` file from the `workflows/` folder
6. Click **Import** to confirm
7. Repeat for the 10 files, in numeric order

> Workflows that call each other (via `Execute Workflow`) look up the other workflows by name. All workflows must be imported for the calls to work.

---

## Configure Credentials After Import

After import, the nodes that require credentials display a yellow warning icon. To configure them:

1. Open the relevant workflow
2. Click the node with the warning icon
3. In the configuration panel on the right, click the **Credential** field
4. Select an existing credential or click **Create new** to create one
5. Save the node (click outside it or press Esc)

---

## Activate a Workflow

By default, an imported workflow is **inactive**: its triggers do not run. To activate it:

1. Open the workflow
2. Click the **Inactive** button in the top-right corner (it becomes **Active**)

> The `03_Persona - Main Chatbot` workflow must be active for the chatbot to respond.
> The `07_Persona - Scheduler` workflow must be active for automatic sending.

The other workflows (01, 02, 04, 05, 06, 08) are triggered by other workflows — they do not need to be activated separately, but they must exist in n8n.

---

## Test a Workflow Manually

To test a workflow without waiting for its trigger:

1. Open the workflow
2. Click **Test workflow** (button at the bottom of the editor)
3. If the workflow has a `Manual Trigger`, click it to trigger the workflow
4. Results appear in each node (small badge with the number of processed items)
5. Click a node to see the produced data

---

## Create a New Workflow from Scratch

### Step 1 — Create the workflow

1. Go to **Workflows** > **+ Add workflow**
2. Give the workflow a name (click the title at the top)

### Step 2 — Add the trigger

1. Click the **+** button in the editor (or double-click the canvas)
2. Search for the desired trigger type
3. Configure it (webhook path, schedule, etc.)

### Step 3 — Add nodes

1. Click the **+** at the end of a connection to add the next node
2. Choose the node type from the list
3. Configure its parameters

### Step 4 — Connect the nodes

Nodes connect by dragging from one node's output point (►) to another node's input point. A node can have multiple outputs (If/Switch branches).

### Step 5 — Save and activate

- **Ctrl+S** (or Cmd+S) to save
- **Active** button to enable the trigger

---

## Create a Callable Workflow (Sub-workflow)

A sub-workflow is a workflow triggered by another workflow via the `Execute Workflow` node. For a workflow to be callable:

1. Add an **Execute Workflow Trigger** node as the first node
2. Configure its expected input parameters (optional, for documentation)
3. The workflow can then be called from another workflow with the **Execute Workflow** node by selecting the workflow by name

In Persona, workflows 01, 02, 04, 05, and 08 follow this pattern. They are also testable with a `Manual Trigger` in parallel.

---

## Debug a Workflow

- **View the data**: click any node after an execution to see what it produced
- **View history**: the **Executions** tab in the workflow shows past runs (success/error)
- **n8n logs**: `docker logs -f n8n` for real-time logs
- **Step-by-step execution**: use test mode and trigger it manually to inspect each step
