import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

// Adjust paths to match your repo structure:
import {logIn, logIn3} from '../../../../helpers/Node20Helpers.js';
import { waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";
// (We keep manual steps consistent with your Test 1; not using createAuthorizationForMember here.)

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

    // Scope to the dialog to avoid clicking the wrong "Okay"
    await dialog.getByRole('button', { name: okButtonName }).click({ timeout });

    // If closing the dialog triggers any spinner, uncomment:
    // await waitUntilLoaded(page);

    return true;
}

test.describe('Authorization Config - Default Diagnosis = First Diagnosis', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = 'AuthConfigDefDiagNoD';



        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url
        });

    });

     */

    test.afterEach(async () => {
        await context?.close();
        await browser?.close();
    });

    test('Last - Copy the most recent Diagnosis forward to subsequent line items.', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        //const loginID = 'AuthConfigDefDiagNoD';
        const lastFirstName = 'Nelson, William';
        const authorizationType = 'Inpatient';
        const patientStatus = 'Admitted';
        const admitDate = format(today, 'MM dd yyyy hh mm ss aa');
        const authStatus = 'In Progress';
        const team = 'Case Team';


        const loginID = 'LoginIdTest1';
        const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

        const reviewer = `${loginID} Qaw`;
        const diag1 = 'A00 - Cholera';
        const diag2 = 'A01.0 - Typhoid fever';
        const bedLevel = 'Medical';



        //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url
        });

        //--------------------------------
        // Act:
        //--------------------------------

        // Navigate to Tools > System Options
        await page.getByText('Tools').click();
        await page.getByText('System Options').click();

        // Open Configuration tab
        await page.getByText('Configuration', { exact: true }).click();

        // Scroll to Authorization Configuration
        await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

        // Select Default Diagnosis = First Diagnosis
        await page
            .locator('[aria-controls="AuthConfig_DefaultDiagnosis_listbox"]')
            .click();
        await page.getByRole('option', { name: 'Last Diagnosis' }).click();

        // Save & Close
        await page.getByRole('button', { name: 'Save and Close' }).click();
        await waitUntilLoaded(page);

        // --- Create an Authorization for the member (same pattern as your Test 1) ---

        // Navigate to Home
        await page.getByText('Home', { exact: true }).click();

        // Members tab
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        // Search for the member
        await page.getByRole('textbox', { name: 'Search...' }).fill(lastFirstName);
        await page.keyboard.press('Enter');

        // Open the member
        await page.getByRole('gridcell', { name: lastFirstName }).dblclick();
        await waitUntilLoaded(page);

        // Authorizations tab
        await page.locator('#authorizations-menu').click();

        // Hover over "+ Authorization" (Inpatient) and choose type
        await page
            .getByRole('button')
            .filter({ hasText: 'Authorization Inpatient' })
            .hover();
        await page
            .getByLabel(lastFirstName)
            .getByText(authorizationType, { exact: true })
            .click();

        await waitUntilLoaded(page);

        // Fill inpatient fields
        if (authorizationType === 'Inpatient' || authorizationType === 'Observation') {
            await page.locator('input[name="aush_inpatient_status_id__1_input"]').fill(patientStatus);
            await page.getByRole('option', { name: patientStatus }).locator('span').click();
        }

        if (authorizationType === 'Inpatient') {
            await page.locator('#aush_admit_date__1').click();
            await page.locator('#aush_admit_date__1').clear();
            await page.locator('#aush_admit_date__1').pressSequentially(admitDate);
        }

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

        // In/Out of Network checkboxes
        await page.getByRole('checkbox', { name: 'Out of Network' }).check();
        await page.getByRole('checkbox', { name: 'In Network' }).check();

        // Search and select provider
        await page.getByRole('textbox', { name: 'Search...' }).fill(`St. Catherine's Hospital`);
        await page.getByRole('dialog', { name: 'Lookup' }).locator('#lookup-search-button').click();
        await page.getByRole('gridcell', { name: `St. Catherine's Hospital` }).first().click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();

        // Handle optional duplicate notification
        await maybeHandleNotificationOk(page, { timeout: 3000 });

        await waitUntilLoaded(page);

        // Provider 2 (admitting) lookup
        await page.locator('[name="auth_provider_2_site_id"] ~ button[title="Lookup"]').click();

        // In/Out of Network checkboxes
        await page.getByRole('checkbox', { name: 'Out of Network' }).check();
        await page.getByRole('checkbox', { name: 'In Network' }).check();

        // Search and select provider
        await page.getByRole('textbox', { name: 'Search...' }).fill(`St. Catherine's Hospital`);
        await page.getByRole('dialog', { name: 'Lookup' }).locator('#lookup-search-button').click();
        await page.getByRole('gridcell', { name: `St. Catherine's Hospital` }).first().click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();

        // Save Authorization
        await page.getByRole('button', { name: ' Save' }).click();
        await waitUntilLoaded(page);

        // Optional Work Log handling
        try {
            await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
            // If needed, collect the date:
            // const worklogActivityDate = await page.locator('#work_activity_date').evaluate(e => e.value);
            await page.getByRole('button', { name: ' Save and Close' }).click();
        } catch {
            await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
        }
        await waitUntilLoaded(page);

        // Confirm auth header visible (optional)
        await page.locator('#form-header .headerLabel').waitFor();

        // --- Create FIRST Bed Day with two diagnoses ---

        await page.getByRole('button', { name: /Bed Day/ }).click();
        await waitUntilLoaded(page);

        // +Diagnosis 1
        await page.getByRole('button', { name: /Diagnosis/ }).click();
        await waitUntilLoaded(page);
        await page.locator('input[name="audg_code__1_input"]').fill(diag1);
        await page.getByRole('option', { name: diag1, exact: true }).locator('span').click();

        // +Diagnosis 2
        await page.getByRole('button', { name: /Diagnosis/ }).click();
        await waitUntilLoaded(page);
        await page.locator('input[name="audg_code__2_input"]').fill(diag2);
        await page.getByRole('option', { name: diag2, exact: true }).locator('span').click();

        // Requested Bed Level
        await page.locator('input[name="auli_requested_bed_level_input"]').fill(bedLevel);
        await page.getByRole('option', { name: bedLevel }).click();

        // Requested Units
        const spin = page.getByRole('spinbutton').first();
        await spin.fill('1');

        // Save & Close Bed Day
        await page.getByRole('button', { name: ' Save and Close', exact: true }).click();
        await waitUntilLoaded(page);

        // Save & Close Work Log popup (if any)
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        // Go to Bed Days shortcut and add another Bed Day
        await page.locator('#shortcuts-div [data-value="lineitems-anchor"]:visible').click();
        await page.getByRole('button', { name: /Bed Day/ }).click();

        //--------------------------------
        // Assert:
        //--------------------------------

        // With "First Diagnosis" setting, the FIRST diagnosis (diag1) should be pre-populated.
        await expect(
            page.locator(
                `[data-collection-code="COLLECTION_AUTH_LINE_ITEM_DIAGNOSIS"]:has-text("${diag2}")`
            )
        ).toBeVisible();

        // Optionally verify the Diagnosis anchor is visible
        await expect(
            page.locator('#diagnosis-anchor div').filter({ hasText: 'Diagnosis' })
        ).toBeVisible();

       // await browser.close();

    });
});
