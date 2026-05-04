// CreateEditAndDeleteMemberRole.test.js
import { test, expect } from '@playwright/test';
// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanMemberRoles, logIn3
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
   ------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 20;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);

/** Click a locator and then wait a bit */
const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

/** Fill a locator and then wait a bit */
const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

/** Generate a random alphabetical string (avoids needing faker) */
const randomAlpha = (len = 10) =>
    Array.from({ length: len }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

test('Create, edit, and delete Member Role', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `RulesMandatoryWhen`;

    // Sign in to the app
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



    // Clean-up: Member roles (idempotent)
    await cleanMemberRoles(page);

    //--------------------------------
    // Act:
    //--------------------------------
    // Click the "Tools" text
    await clickAndWait(page, page.getByText(`Tools`));

    // Click the "Users & Roles" text (renders &amp; as &)
    await clickAndWait(page, page.getByText(`Users & Roles`));

    // Click the "Member Roles" text
    await clickAndWait(page, page.getByText(`Member Roles`));

    // Click the "+ New" button (NBSP in label)
    await clickAndWait(page, page.getByRole(`button`, { name: ` \u00A0New` }));
    await waitUntilLoaded(page);

    // Click the "Only Show Active Members" radio
    await clickAndWait(page, page.getByRole(`radio`, { name: `Only Show Active Members` }));

    // Generate a random alphabetical string for the member role name
    const memberRoleName = randomAlpha(10);

    // Wait for page load (defensive)
    await waitUntilLoaded(page);

    // Fill the "​ New Member Role" dialog with the name
    const newMemberRoleDialog = page.getByRole(`dialog`, { name: /\u200B?\s*New Member Role/i });
    await fillAndWait(page, newMemberRoleDialog.getByRole(`textbox`), memberRoleName);

    // ------------------------------
    // Company radio: random select
    // ------------------------------
    const companyRadioButtons = [
        page.locator(`#company-ignore`),
        page.locator(`#company-include`),
    ];

    const randomCompanyIndex = Math.floor(Math.random() * companyRadioButtons.length);
    const selectedCompanyRadio = companyRadioButtons[randomCompanyIndex];
    await selectedCompanyRadio.click();

    // Get the label for the selected company radio (prefer label[for], fallback to following sibling)
    const companyRadioLabels = [
        page.locator('label[for="company-ignore"]'),
        page.locator('label[for="company-include"]'),
    ];

    let selectedCompanyLabel;
    try {
        selectedCompanyLabel = await companyRadioLabels[randomCompanyIndex].innerText({ timeout: 3000 });
    } catch {
        selectedCompanyLabel = await selectedCompanyRadio.locator('xpath=following-sibling::label[1]').innerText();
    }
    const selectedCompanyRadioLabel = selectedCompanyLabel;

    // ------------------------------
    // Case Programs radio: random select
    // ------------------------------
    const caseProgramsRadioButtons = [
        page.locator(`#case-program-ignore`),
        page.locator(`#case-program-include`),
    ];

    const randomCaseProgramsIndex = Math.floor(Math.random() * caseProgramsRadioButtons.length);
    const selectedCaseProgramsRadio = caseProgramsRadioButtons[randomCaseProgramsIndex];
    await selectedCaseProgramsRadio.click();

    const caseProgramsRadioLabels = [
        page.locator('label[for="case-program-ignore"]'),
        page.locator('label[for="case-program-include"]'),
    ];

    let selectedCaseProgramsLabel;
    try {
        selectedCaseProgramsLabel = await caseProgramsRadioLabels[randomCaseProgramsIndex].innerText({ timeout: 3000 });
    } catch {
        selectedCaseProgramsLabel = await selectedCaseProgramsRadio.locator('xpath=following-sibling::label[1]').innerText();
    }
    const selectedCaseProgramsRadioLabel = selectedCaseProgramsLabel;

    // ------------------------------
    // Referrals radio: random select
    // ------------------------------
    const referralsRadioButtons = [
        page.locator(`#referrals-ignore`),
        page.locator(`#referrals-include`),
    ];

    const randomReferralsIndex = Math.floor(Math.random() * referralsRadioButtons.length);
    const selectedReferralsRadio = referralsRadioButtons[randomReferralsIndex];
    await selectedReferralsRadio.click();

    const referralsRadioLabels = [
        page.locator('label[for="referrals-ignore"]'),
        page.locator('label[for="referrals-include"]'),
    ];

    let selectedReferralsLabel;
    try {
        selectedReferralsLabel = await referralsRadioLabels[randomReferralsIndex].innerText({ timeout: 5000 });
    } catch {
        selectedReferralsLabel = await selectedReferralsRadio.locator('xpath=following-sibling::label[1]').innerText();
    }
    const selectedReferralsRadioLabel = selectedReferralsLabel;

    // Build selectors from labels (Ignore vs Include)
    const companyRadioSelector = selectedCompanyRadioLabel.toLowerCase().includes('ignore')
        ? `#company-ignore`
        : `#company-include`;

    const caseProgramsRadioSelector = selectedCaseProgramsRadioLabel.toLowerCase().includes('ignore')
        ? `#case-program-ignore`
        : `#case-program-include`;

    const referralsRadioSelector = selectedReferralsRadioLabel.toLowerCase().includes('ignore')
        ? `#referrals-ignore`
        : `#referrals-include`;

    await waitUntilLoaded(page);
    // Click the "Save and Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: `Save and Close` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert (Post-Create):
    //--------------------------------
    // Assert the new member role is visible in the Member Roles table
    const createdRow = page.locator(
        `tr.k-table-row:has(td.k-table-td:has-text("${memberRoleName}"))`
    );
    await expect(createdRow).toBeVisible();

    // Click the newly created role's gridcell
    await clickAndWait(page, page.getByRole(`gridcell`, { name: memberRoleName }));

    // Click the Edit button (icon-only)
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    await waitUntilLoaded(page);

    // Wait for the edit dialog to appear
    await expect(page.getByRole(`dialog`, { name: /Edit Member Role/i })).toBeVisible();

    // Assert the three radio button selections match what we chose
    await expect(page.locator(companyRadioSelector)).toBeChecked();
    await expect(page.locator(caseProgramsRadioSelector)).toBeChecked();
    await expect(page.locator(referralsRadioSelector)).toBeChecked();

    await waitUntilLoaded(page);

    //--------------------------------
    // Arrange (prepare for edit toggles):
    //--------------------------------
    // Close the edit dialog
    await clickAndWait(
        page,
        page.getByLabel(`Edit Member Role`).getByText(`Close`, { exact: true })
    );

    //await waitUntilLoaded(page);

    // Re-open the newly created member role and enter edit mode
    await clickAndWait(page, createdRow);
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    await waitUntilLoaded(page);

    //--------------------------------
    // Act (Toggle selections in Edit):
    //--------------------------------
    // Toggle Company (name="filter-company")
    const currentCompanyChecked = await page
        .locator('input[name="filter-company"]:checked')
        .getAttribute('id');

    const newCompanyOption =
        currentCompanyChecked === 'company-ignore' ? '#company-include' : '#company-ignore';
    await page.locator(newCompanyOption).check();

    // Toggle Case Programs (name="filterProgram")
    const currentCaseProgramsChecked = await page
        .locator('input[name="filterProgram"]:checked')
        .getAttribute('id');

    const newCaseProgramsOption =
        currentCaseProgramsChecked === 'case-program-ignore'
            ? '#case-program-include'
            : '#case-program-ignore';
    await page.locator(newCaseProgramsOption).check();

    // Toggle Referrals (name="filterReferrals")
    const currentReferralsChecked = await page
        .locator('input[name="filterReferrals"]:checked')
        .getAttribute('id');

    const newReferralsOption =
        currentReferralsChecked === 'referrals-ignore'
            ? '#referrals-include'
            : '#referrals-ignore';
    await page.locator(newReferralsOption).check();

    // Toggle Member Groups (name="filterMemberGroup")
    const currentMemberGroupsChecked = await page
        .locator('input[name="filterMemberGroup"]:checked')
        .getAttribute('id');

    const newMemberGroupsOption =
        currentMemberGroupsChecked === 'member-group-ignore'
            ? '#member-group-specify'
            : '#member-group-ignore';
    await page.locator(newMemberGroupsOption).check();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert (Post-Edit toggles):
    //--------------------------------
    await expect(page.locator(newCompanyOption)).toBeChecked();
    await expect(page.locator(newCaseProgramsOption)).toBeChecked();
    await expect(page.locator(newReferralsOption)).toBeChecked();
    await expect(page.locator(newMemberGroupsOption)).toBeChecked();

    //--------------------------------
    // Arrange (prepare to delete):
    //--------------------------------
    // Close the edit dialog
    await clickAndWait(
        page,
        page.getByLabel(`Edit Member Role`).getByText(`Close`, { exact: true })
    );

    // Confirm close prompt
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));

    //await waitUntilLoaded(page);

    //--------------------------------
    // Act (Delete the role):
    //--------------------------------
    // Select the created role row
    await clickAndWait(page, createdRow);

    // Click the Delete button (icon-only)
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    // Confirm deletion
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));

    //await waitUntilLoaded(page);

    //--------------------------------
    // Assert (Post-Delete):
    //--------------------------------
    // Role row should no longer be visible
    await expect(
        page.locator(`tr.k-table-row:has(td.k-table-td:has-text("${memberRoleName}"))`)
    ).not.toBeVisible();

    // Close out of Member Roles area if a Close exists
    const closeText = page.getByText(`Close`, { exact: true });
    if (await closeText.isVisible().catch(() => false)) {
        await clickAndWait(page, closeText);
    }

    // Final clean-up (idempotent)
    await cleanMemberRoles(page);
});
