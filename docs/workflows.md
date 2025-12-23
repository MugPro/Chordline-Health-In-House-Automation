# Workflow Structure & Migration

## Organization
Workflows are grouped by functional area:

```text
workflows/
├─ auth/
├─ users/
├─ companies/
├─ assessments/
```
---


## Migration Rules
When migrating workflows from QA Wolf to Playwright, the following rules apply:

- One QA Wolf workflow = one Playwright test

- Use shared helpers for login, navigation, and common actions

- No hardcoded environment values (URLs, credentials, API keys)

- Assertions must validate user-visible behavior

- Tests should be deterministic, readable, and maintainable

---


## Naming Conventions

- Test files must end with .test.js

- Test names should describe user behavior, not technical steps


Good examples

- VerifyUserCanLogin.test.js
- VerifyCompanyCanBeCreated.test.js


Avoid

- test1.test.js
- companyFlow.test.js

---


## Example Playwright Test
```text
import { test, expect } from '@playwright/test';
import { Node20Helpers } from '../../helpers/Node20Helpers.js';

test('User can log in successfully', async ({ page }) => {
  await Node20Helpers.login(page);

  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

---


## Adding New Workflows

To add a new workflow:

1. Create a folder under workflows/ (or reuse an existing one)

2. Add a new Playwright test file

3. Import and use shared helpers

4. Run the test locally

5. Commit and push changes

```text
npx playwright test --project=staging
```

---


## Local Validation Checklist

Before pushing changes:
- Test passes locally
  
- No hardcoded values

- Uses shared helpers

- Assertions verify expected UI behavior

---


## CI/CD Behavior

Once changes are pushed:

- GitHub Actions runs automatically

- Tests execute against staging and qawolf2

- HTML reports, screenshots, and video recordings are generated

- Failures are available as GitHub Actions artifacts

---


## Ongoing Maintenance

- Update shared helpers when common behavior changes

- Avoid duplicating logic across workflows

- Refactor tests instead of copying

- Address flaky tests immediately
