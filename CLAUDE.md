# Bibirble (Web) notes

## What's New list

- Every feature in the What's New list (`index.html`, `.whats-new-list`) must be summarised in **at most two lines** on a phone screen (check at 320px wide, the smallest common phone). Keep it short: a bold name, then a few words.
- Add new features to the top of the list.

## Shipping changes

- Bump `CACHE` in `sw.js` (e.g. `bibirble-v2` → `bibirble-v3`) so installed apps get the new files.

## Documentation

- Any agent writing or changing documentation must match the existing docs: read the neighbouring doc first
  and copy its shape. Plain, short sentences in everyday words; files and functions in backticks.
- `README.md`: update the matching entry (project structure list, How to Play, areas list, credits) rather
  than adding a new section. Keep it in step with the C++ version's docs (bibirble's `CLAUDE.md` has the
  full checklist).
- HTML docs: plain HTML with no styling (no `<style>`, `style=`, classes, CSS or scripts) and no metadata
  (no doctype, `<html>`, `<head>`, `<meta>`, `<title>`).

