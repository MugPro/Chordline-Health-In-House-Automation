# QA Wolf → In-House Automation Migration Plan

## 1. Objective

Replace the QA Wolf platform with an internal Playwright-based automation framework for the **Staging** and **QA Wolf2** environments.

### Goals
- Maintain full test coverage
- Improve test maintainability and ownership
- Integrate automation with CI/CD
- Reduce vendor dependency and long-term cost
- Enable faster iteration and debugging

---

## 2. Current Automation Coverage (Representative Workflows)

### Authentication
- Forgot Password
- External Login
- Internal Login & Logout

### Users & Roles
- Import Users
- Export Users
- Member Roles CRUD
- Teams CRUD

### Companies
- Benefit Plans CRUD
- Rates CRUD

### Assessments & Forms
- Assessments CRUD
- Question Library
- Care Plan Templates
- Forms CRUD

### Automation Rules
- Auto Approval Rules CRUD
- Workflow Rules CRUD

### Member Details
- Authorizations CRUD
- Medications CRUD
- Notes
- Forms
- Reports

---

## 3. Migration Strategy

The migration will follow a **phased and incremental approach** to minimize risk and ensure full parity with QA Wolf before decommissioning.

Total planned duration: **12 weeks**, including buffer time for:
- PTO or illness
- Environment instability
- Unexpected test flakiness
- CI or infrastructure issues

QA Wolf will continue running in parallel until migration is complete and signed off.

---

## 4. 12-Week Execution Timeline

### Weeks 1–2: Assessment & Alignment
**Activities**
- Review all existing QA Wolf workflows
- Confirm Staging and QA Wolf2 environment parity
- Review current CI execution, retries, and reporting
- Identify high-risk or flaky tests
- Confirm migration order and priorities

**Deliverables**
- Finalized scope
- Confirmed workflow list
- Agreed migration order

---

### Weeks 3–4: Framework Setup
**Activities**
- Create automation GitHub repository
- Initialize Playwright framework
- Configure environment switching (Staging / QA Wolf2)
- Set up GitHub Actions CI
- Enable screenshots, videos, retries, and HTML reports
- Add existing QA Wolf helper file **unchanged**

**Deliverables**
- Working in-house automation framework
- CI pipeline running successfully
- No workflows migrated yet

---

### Weeks 5–6: Pilot Migration (Authentication)
**Activities**
- Migrate Authentication workflows:
  - Forgot Password
  - Login / Logout
- Validate helper compatibility
- Compare behavior and results with QA Wolf
- Address timing, selector, or environment issues

**Deliverables**
- Successful pilot module
- Proven feasibility of in-house automation
- Confidence in helper reuse strategy

---

### Weeks 7–10: Full Workflow Migration
**Activities**
- Gradually migrate remaining workflows:
  - Users & Roles
  - Companies
  - Assessments & Forms
  - Automation Rules
  - Member Details
- Track coverage parity
- Stabilize flaky tests
- Run QA Wolf and in-house automation in parallel

**Deliverables**
- All workflows migrated
- Daily CI runs covering full regression suite
- QA Wolf used only as backup

---

### Weeks 11–12: Stabilization & Decommission Preparation
**Activities**
- Final full regression runs
- Fix remaining flaky or unstable tests
- Confirm coverage parity with QA Wolf
- Document usage and contribution guidelines
- Stakeholder review and sign-off
- Prepare QA Wolf shutdown plan

**Deliverables**
- Stable, reliable in-house automation
- Approval to decommission QA Wolf

---

## 5. In-House Automation Framework

### Project Structure


chordline-automation/
├─ package.json
├─ playwright.config.js
├─ helpers/
│ └─ helpers.js # QA Wolf helpers (unchanged)
├─ tests/
│ ├─ staging-workflows/
│ └─ qawolf2-workflows/
├─ .github/workflows/
│ └─ ci.yml
└─ docs/
└─ qa-wolf-migration-plan.md




---

## 6. Helper Strategy

- Reuse the existing QA Wolf helper file without modification
- Avoid refactoring during migration to reduce risk
- Refactor helpers only after full migration and stabilization

---

## 7. CI/CD Integration

- GitHub Actions used for automation execution
- Daily scheduled regression runs
- Manual and on-demand execution supported
- HTML reports and video recordings stored as artifacts
- Secrets managed via GitHub Actions

---

## 8. Migration Completion Criteria

QA Wolf can be safely decommissioned once:
- All workflows are migrated
- CI runs are stable and reliable
- Coverage parity is confirmed
- Stakeholders approve the transition

---

## 9. Risks & Mitigation

| Risk | Mitigation |
|----|----|
| Test flakiness | Retries, stabilization window |
| Environment instability | Parallel QA Wolf execution |
| PTO / illness | 12-week buffer |
| Helper complexity | No refactor during migration |

---

## 10. Outcome

This migration will deliver:
- Full QA Wolf feature parity
- CI-driven automation execution
- Improved maintainability and debugging
- Complete ownership of test automation
- No vendor lock-in


