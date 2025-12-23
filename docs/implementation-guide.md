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

```bash
npm init -y
npm install playwright dotenv
npx playwright install


---


### Step 4: Folder Structure

workflows/
helpers/
environments/
.github/workflows/

---


### Step 5: .gitignore

node_modules/
playwright-report/
.env*

---


### Step 6: Shared Helpers

1. Create helpers/Node20Helpers.js

2. All workflows must reuse this file

3. No duplicated logic per test


---


## 📄 `docs/ci-cd.md`

```md
# CI/CD Configuration

## Overview
Automation is executed using GitHub Actions with:
- Scheduled runs
- Manual/deployment-triggered runs
- HTML reports and video recordings

---

## Daily Runs
- Frequency: Every 30 minutes
- Environments: staging, qawolf2
- Trigger: cron + manual

---

## Secrets
Configured in GitHub Actions:
- STAGING_BASE_URL
- STAGING_TEST_USER
- STAGING_TEST_PASSWORD
- STAGING_API_KEY
- QAWOLF2_BASE_URL
- QAWOLF2_TEST_USER
- QAWOLF2_TEST_PASSWORD
- QAWOLF2_API_KEY

---

## Artifacts
Each run produces:
- HTML report
- Screenshots (on failure)
- Video recordings

