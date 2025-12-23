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
