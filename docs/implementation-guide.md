# Implementation Guide: In-House Playwright Automation

This document describes how to build, run, and maintain the internal Playwright automation framework.

---

## Phase 1: Initial Setup

### Step 1: Create GitHub Repository
- Organization: ChordLine
- Repository: inhouse-automation
- Private repository
- Do not initialize with README or .gitignore

---

### Step 2: Create Local Project
- Open IntelliJ
- Create Node.js project
- Node version: 20+
- Enable ES modules

---

### Step 3: Install Dependencies


1. npm init -y
   
2. npm install playwright dotenv
   
3. npx playwright install


---


### Step 4: Folder Structure

```text
workflows/
helpers/
environments/
.github/workflows/
```
---


### Step 5: .gitignore

```text
node_modules/
playwright-report/
.env*
```

---


### Step 6: Shared Helpers

- Create helpers/Node20Helpers.js

- All workflows must reuse this file

- No duplicated logic per test


---


