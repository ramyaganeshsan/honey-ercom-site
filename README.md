# honey-ercom-site

Wrapper repo for:

- `original_HoneyEcommerce_new_ui` — React storefront (`localhost:3000`)
- `original_partyBox_new_api` — Node API (`localhost:5000`)

## Current status

These folders are **git submodule stubs without checked-out source**. Copy or submodule-add the real projects before running.

See **[HOW_TO_FIX_AND_RUN.md](./HOW_TO_FIX_AND_RUN.md)** for step-by-step fixes:

1. Backend DB missing column `minimumProductQuantityToNotify` (causes Error 500)
2. Dummy data + images
3. ESLint warning cleanup

## Local run (after source is present)

```bash
# API
cd original_partyBox_new_api && npm install && npm start

# UI
cd original_HoneyEcommerce_new_ui && npm install && npm start
```
