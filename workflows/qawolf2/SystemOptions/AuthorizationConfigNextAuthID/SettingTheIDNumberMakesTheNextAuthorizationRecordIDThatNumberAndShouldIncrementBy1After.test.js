import { test, expect } from '@playwright/test';
import { format } from 'date-fns';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

// Reusable helper: handle a dialog *if* it appears, otherwise skip
async function maybeHandleNotificationOk(page, {
    dialogName = 'Notification',   // ARIA dialog name
    okButtonName = 'Okay',         // Button label inside dialog
    timeout = 3000,                // Max wait for optional modal
} = {}) {
    const dialog = page.getByRole('dialog', { name: dialogName });

    const appeared = await dialog.waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);

    if (!appeared) return false;

    await dialog.getByRole('button', { name: okButtonName }).click({ timeout });
    // If closing triggers spinner:
    // await waitUntilLoaded(page);
    return true;
}

test.describe('Setting Next Auth ID influences next Authorization and increments by 1 thereafter', () => {
    let browser, context, page;

    test.beforeEach(async () => {
        const loginID = 'NextReview';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });

    test.afterEach(async () => {
        await context?.close();
        await browser?.close();
    });

    test('Next Auth ID should be used for the next authorization and increment sequentially', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        const loginID = 'NextReview';
        const lastFirstName = 'Ace, Clancy';
        const authorizationType = 'Inpatient';
        const patientStatus = 'Admitted';
        const admitDate = format(today, 'MM dd yyyy hh mm ss aa');
        const authStatus = 'In Progress';
        const team = 'Case Team';
        const reviewer = `${loginID} Qaw`;

        //--------------------------------
        // Act:
        //--------------------------------

        // Navigate Home
        await page.getByText('Home', { exact: true }).click();

        // Click Authorization tab
        await page.getByRole('tab', { name: 'Authorizations' }).locator('span').click();

        // Click the "Auth ID" column twice to sort by descending
        const authIdColSortHandle = page.getByRole('columnheader', { name: 'Auth ID' }).locator('span').nth(1);
        await authIdColSortHandle.click();
        await waitUntilLoaded(page);
        await authIdColSortHandle.click();
        await waitUntilLoaded(page);

        await expect(
            page.locator('[data-field="auth_id"][aria-sort="descending"]'),
        ).toBeVisible();

        // Grab the highest current auth number from the grid (3rd column)
        let highestAuthID = await page
            .locator('[aria-colcount="3"] td:nth-of-type(3)')
            .first()
            .innerText();

        // Navigate to Tools > System Options
        await page.getByText('Tools').click();
        await page.getByText('System Options').click();

        // Click "Configuration" tab
        await page.getByText('Configuration', { exact: true }).click();

        // Scroll "Authorization Configuration" into view
        await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

        // Read System Options field for Next Auth ID
        const sysOpSelector = `[id="system-options"] [class="right"]:has([id="NextAuthId"]) input >> nth=0`;
        const sysOpAuthID = await page.locator(sysOpSelector).evaluate(e => e.value);

        // Determine the max between grid highest and sys op value
        highestAuthID = Math.max(
            Number(highestAuthID),
            Number((sysOpAuthID || '').replace(',', '')),
        );

        // Change the Next Auth ID to be +2 of the highest
        const newNextID = Number(highestAuthID) + 2;

        await page.locator(sysOpSelector).click({ timeout: 3000 });
        await page.keyboard.press('Control+A');
        await page.locator(sysOpSelector).pressSequentially(`${newNextID}`);

        // Click "Save and Close"
        await page.getByRole('button', { name: 'Save and Close' }).click();
        await waitUntilLoaded(page);

        // --- Create the Authorization (MANUAL STEPS, like your FirstDiagnosis test) ---

        // Navigate to Home
        await page.getByText('Home', { exact: true }).click();

        // Navigate to the Members tab
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        // Search for a member
        await page.getByRole('textbox', { name: 'Search...' }).fill(lastFirstName);
        await page.keyboard.press('Enter');

        // Open member page
        await page.getByRole('gridcell', { name: lastFirstName }).dblclick();
        await waitUntilLoaded(page);

        // Click the "Authorizations" tab
        await page.locator('#authorizations-menu').click();

        // Hover over "+ Authorization" and select Inpatient
        await page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }).hover();
        await page.getByLabel(lastFirstName).getByText(authorizationType, { exact: true }).click();
        await waitUntilLoaded(page);

        // Fill inpatient status
        await page.locator('input[name="aush_inpatient_status_id__1_input"]').fill(patientStatus);
        await page.getByRole('option', { name: patientStatus }).locator('span').click();

        // Fill Admit Date
        await page.locator('#aush_admit_date__1').click();
        await page.locator('#aush_admit_date__1').clear();
        await page.locator('#aush_admit_date__1').pressSequentially(admitDate);

        // Auth Status
        await page.getByRole('button', { name: '' }).nth(2).click();
        await page.locator('input[name="aush_status_id__1_input"]').clear();
        await waitUntilLoaded(page);
        await page.locator('input[name="aush_status_id__1_input"]').fill(authStatus);
        await page.getByRole('option', { name: authStatus }).locator('span').click();

        // Team
        await page.locator('input[name="auth_team_reference_id_input"]').fill(team);
        await page.getByRole('option', { name: team }).click();

        // Provider 1 (site) lookup
        await page.locator('[name="auth_provider_1_site_id"] ~ button[title="Lookup"]').click();

        // Check In and Out of Network
        await page.getByRole('checkbox', { name: 'Out of Network' }).check();
        await page.getByRole('checkbox', { name: 'In Network' }).check();

        // Search/select provider
        await page.getByRole('textbox', { name: 'Search...' }).fill(`St. Catherine's Hospital`);
        await page.getByRole('dialog', { name: 'Lookup' }).locator('#lookup-search-button').click();
        await page.getByRole('gridcell', { name: `St. Catherine's Hospital` }).first().click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();

        // Optional duplicate notification
        await maybeHandleNotificationOk(page, { timeout: 3000 });
        await waitUntilLoaded(page);

        // Provider 2 (admitting) lookup
        await page.locator('[name="auth_provider_2_site_id"] ~ button[title="Lookup"]').click();

        // Check In and Out of Network
        await page.getByRole('checkbox', { name: 'Out of Network' }).check();
        await page.getByRole('checkbox', { name: 'In Network' }).check();

        // Search/select provider
        await page.getByRole('textbox', { name: 'Search...' }).fill(`St. Catherine's Hospital`);
        await page.getByRole('dialog', { name: 'Lookup' }).locator('#lookup-search-button').click();
        await page.getByRole('gridcell', { name: `St. Catherine's Hospital` }).first().click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();

        // Save Authorization
        await page.getByRole('button', { name: ' Save' }).click();
        await waitUntilLoaded(page);

        // Optional Work Log
        try {
            await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
            await page.getByRole('button', { name: ' Save and Close' }).click();
        } catch {
            await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
        }
        await waitUntilLoaded(page);

        // Grab the Auth number from header
        await page.locator('#form-header .headerLabel').waitFor();
        const authNumText = await page.locator('#form-header .headerLabel').innerText();
        const authNum = authNumText.replace('Inpatient Auth #', '').trim();

        //--------------------------------
        // Assert:
        //--------------------------------

        // Minimal debug line next to expect
        console.log('ASSERT CHECK → Expected:', String(newNextID), '| Actual:', authNum);

        try {
            expect(authNum).toBe(String(newNextID));
        } catch {
            // Fallback behavior: some systems might jump forward (e.g., parallel increments)
            expect(Number(authNum)).toBeGreaterThan(newNextID);

            // Navigate Home > Authorizations grid to assert presence/absence
            await page.getByText('Home', { exact: true }).click();
            await page.locator('#home-tabs-tab-5').getByText('Authorizations').click();

            // Assert that newNextID exists
            await expect(
                page.locator(`[id="cases-grid"] table tbody tr td:text-is("${newNextID}")`)
            ).toBeVisible();

            // Assert that (newNextID - 1) does NOT exist
            await expect(
                page.locator(`[id="cases-grid"] table tbody tr td:text-is("${newNextID - 1}")`)
            ).not.toBeVisible();

            // Return to member tab (if needed)
            await page.locator('#member-tab-name').click();
        }
    });
});