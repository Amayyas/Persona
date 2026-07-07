#!/usr/bin/env python3
"""Validates n8n workflow exports before they're merged.

Checks:
  1. Every workflows/*.json file is syntactically valid JSON.
  2. No Google Sheets "documentId" still points at a real spreadsheet ID
     instead of the YOUR_GOOGLE_SHEET_ID placeholder.
  3. No node's $('Name') expression references a node that doesn't exist
     in that same workflow (catches broken renames).
"""
import json
import re
import sys
from pathlib import Path

WORKFLOWS_DIR = Path(__file__).resolve().parent.parent.parent / "workflows"
PLACEHOLDER = "YOUR_GOOGLE_SHEET_ID"

errors = []

for path in sorted(WORKFLOWS_DIR.glob("*.json")):
    text = path.read_text(encoding="utf-8")

    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        errors.append(f"{path.name}: invalid JSON ({e})")
        continue

    for match in re.finditer(r'"documentId"\s*:\s*{[^}]*"value"\s*:\s*"([^"]*)"', text):
        value = match.group(1)
        if value != PLACEHOLDER and not value.startswith("={{"):
            errors.append(
                f"{path.name}: hardcoded Google Sheet ID found ({value!r}); "
                f"use the {PLACEHOLDER} placeholder instead"
            )

    node_names = {n["name"] for n in data.get("nodes", [])}
    refs = set(re.findall(r"\$\(\s*['\"]([^'\"]+)['\"]\s*\)", text))
    dangling = refs - node_names
    if dangling:
        errors.append(f"{path.name}: dangling node reference(s) {dangling}")

if errors:
    print("Workflow validation failed:\n")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)

print(f"All {len(list(WORKFLOWS_DIR.glob('*.json')))} workflow files are valid.")
