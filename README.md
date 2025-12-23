# In-House Playwright Automation

## Overview

This repository contains our in-house Playwright-based end-to-end automation framework, designed to fully replace QA Wolf for both **staging** and **qawolf2** environments.

The goal is to own our automation end-to-end, improve maintainability, reduce external dependency, and integrate tightly with our CI/CD pipelines while preserving full test coverage.

---

## Objectives

- Replace QA Wolf with a fully internal Playwright automation framework
- Maintain coverage for all existing workflows (177 total)
- Support both **staging** and **qawolf2** environments
- Enable scheduled and deployment-triggered test runs
- Provide clear reporting, artifacts, and video recordings
- Create a maintainable and extensible foundation for future automation

---

## Tech Stack

- **Playwright** (JavaScript, ES Modules)
- **Node.js 20+**
- **GitHub Actions** for CI/CD
- **GitHub Secrets** for environment configuration
- HTML reports, screenshots, and video recordings

---

## Environments

The framework supports two environments:
- `staging`
- `qawolf2`

Each environment has its own configuration and secrets while sharing the same test code and helpers.

---

## High-Level Architecture

- Shared helper utilities for common actions (authentication, navigation, etc.)
- Workflows organized by functional area
- Environment-specific configuration loaded at runtime
- CI/CD workflows for scheduled and manual execution

---

## Timeline (12 Weeks)

- **Weeks 1–2:** Framework setup and configuration
- **Weeks 3–8:** Migration of all QA Wolf workflows
- **Weeks 9–12:** CI/CD integration, stabilization, and reporting

Detailed timeline available in [`docs/roadmap.md`](docs/roadmap.md).

---

## Deliverables

- All QA Wolf workflows running internally via Playwright
- Scheduled and manual test execution via GitHub Actions
- HTML reports, screenshots, and video artifacts
- Fully documented framework for long-term maintenance

---

## Documentation

Detailed documentation is available in the `docs/` directory:

- **Roadmap & Timeline:** [`docs/roadmap.md`](docs/roadmap.md)
- **Implementation Guide:** [`docs/implementation-guide.md`](docs/implementation-guide.md)
- **CI/CD Configuration:** [`docs/ci-cd.md`](docs/ci-cd.md)
- **Workflow Structure & Migration:** [`docs/workflows.md`](docs/workflows.md)

---

## Status

Initial framework setup in progress.  
Workflow migration and CI/CD integration will proceed incrementally per the roadmap.

---

## Ownership

This framework is maintained internally and serves as the long-term replacement for QA Wolf automation.
