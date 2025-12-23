
---

## CI/CD Configuration

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
