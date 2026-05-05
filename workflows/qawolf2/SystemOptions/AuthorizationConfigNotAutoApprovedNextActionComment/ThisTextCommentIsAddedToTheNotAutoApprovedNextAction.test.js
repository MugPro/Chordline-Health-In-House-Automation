
// TextCommentAddedToNotAutoApproved.test.js
import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';

// Helpers from your repo (paths may need adjusting to match your structure)
import {logIn, logIn3} from '../../../../helpers/Node20Helpers.js';
import { waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { cleanupTabOnMembersPage } from '../../../../helpers/Node20Helpers.js';
import { reportCleanupFailed } from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

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

test.describe('Text Comment is added to the not auto approved Next Action.', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = 'AuthNotAutoAppr';

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

    test('Next Action comment (Not Auto Approved) appears on Bed Day and Next Actions grid', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
       // const loginID = 'AuthNotAutoAppr';
        const username = 'Auth NotAutoAppr';
        const lastFirstName = 'Ace, Clancy';
        const authorizationType = 'Inpatient';
        const patientStatus = 'Admitted';
        const admitDate = dateFormat(today, 'MM dd yyyy hh mm ss aa'); // e.g., 07 25 2025 12 00 00 AM
        const authStatus = 'In Progress';
        const team = 'Case Team';


        const loginID = 'LoginIdTest1';
        const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper


        const reviewer = `${loginID} Qaw`; // for reference; not strictly needed unless your UI requires it
        const bedLevel = 'NICU';


       // const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
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
        await page.getByText('Tools').click({delay: 500, force: true});
        await page.getByText('System Options').click();

        // Configuration tab
        await page.getByText('Configuration', {exact: true}).click();

        // Scroll "Authorization Configuration" into view
        await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

        // Ensure "Create Next Action When Not Auto Approved" is toggled to Yes
        try {
            await expect(
                page.locator('#AuthConfig_NotAutoApprovedCreateNextAction_Yes'),
            ).toBeChecked();
        } catch {
            await page.locator('#AuthConfig_NotAutoApprovedCreateNextAction_Yes').check();
        }

        // Open the "Edit Comment" flyout for "Not Auto Approved Next Action Comment"
        // In many builds there are two "Edit Comment" buttons; the second corresponds to Not Auto Approved.
        await page.getByRole('button', {name: 'Edit Comment'}).nth(1).click();

        // Verify flyout header is present
        await expect(
            page.getByText('Not Auto Approved Next Action Comment', {exact: true}),
        ).toBeVisible();

        // Capture the comment text from the editable iframe
        const frame = page.frameLocator('[id="flyout-div"] [title="Editable area. Press F10 for toolbar."]');
        const nextActionComment = await frame
            .locator('[id="flyout-textarea"]')
            .innerText({timeout: 3000});


        // Save System Options changes
        await page.getByLabel(`Auto Approved Next Action`).getByRole(`button`, {name: `Save and Close`}).click();
        await waitUntilLoaded(page);
        await page.getByRole(`button`, {name: `Save and Close`}).click();
        await waitUntilLoaded(page);

        // --- Create an Authorization for the member (manual flow, mirroring your previous test) ---


        // Navigate to Home
        await page.getByText('Home', {exact: true}).click();

        // Members tab
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        // Search for the member
        await page.getByRole('textbox', {name: 'Search...'}).fill(lastFirstName);
        await page.keyboard.press('Enter');

        // Open the member
        await page.getByRole('gridcell', {name: lastFirstName}).dblclick();
        await waitUntilLoaded(page);

        // Authorizations tab
        await page.locator('#authorizations-menu').click();

        // Hover over "+ Authorization" (Inpatient) and choose type
        await page
            .getByRole('button')
            .filter({hasText: 'Authorization Inpatient'})
            .hover();
        await page
            .getByLabel(lastFirstName)
            .getByText(authorizationType, {exact: true})
            .click();

        await waitUntilLoaded(page);

        // Fill inpatient fields
        if (authorizationType === 'Inpatient' || authorizationType === 'Observation') {
            await page.locator('input[name="aush_inpatient_status_id__1_input"]').fill(patientStatus);
            await page.getByRole('option', {name: patientStatus}).locator('span').click();
        }

        if (authorizationType === 'Inpatient') {
            await page.locator('#aush_admit_date__1').click();
            await page.locator('#aush_admit_date__1').clear();
            await page.locator('#aush_admit_date__1').pressSequentially(admitDate);
        }

        // Auth Status
        await page.getByRole('button', {name: ''}).nth(2).click();
        await page.locator('input[name="aush_status_id__1_input"]').clear();
        await waitUntilLoaded(page);
        await page.locator('input[name="aush_status_id__1_input"]').fill(authStatus);
        await page.getByRole('option', {name: authStatus}).locator('span').click();

        // Team
        await page.locator('input[name="auth_team_reference_id_input"]').fill(team);
        await page.getByRole('option', {name: team}).click();

        // Provider 1 (site) lookup
        await page.locator('[name="auth_provider_1_site_id"] ~ button[title="Lookup"]').click();

        // In/Out of Network checkboxes
        await page.getByRole('checkbox', {name: 'Out of Network'}).check();
        await page.getByRole('checkbox', {name: 'In Network'}).check();

        // Search and select provider
        await page.getByRole('textbox', {name: 'Search...'}).fill(`St. Catherine's Hospital`);
        await page.getByRole('dialog', {name: 'Lookup'}).locator('#lookup-search-button').click();
        await page.getByRole('gridcell', {name: `St. Catherine's Hospital`}).first().click();
        await page.getByRole('button', {name: 'Select', exact: true}).click();

        // Handle optional duplicate notification
        await maybeHandleNotificationOk(page, {timeout: 7000});

        await waitUntilLoaded(page);

        // Provider 2 (admitting) lookup
        await page.locator('[name="auth_provider_2_site_id"] ~ button[title="Lookup"]').click();

        // In/Out of Network checkboxes
        await page.getByRole('checkbox', {name: 'Out of Network'}).check();
        await page.getByRole('checkbox', {name: 'In Network'}).check();

        // Search and select provider
        await page.getByRole('textbox', {name: 'Search...'}).fill(`St. Catherine's Hospital`);
        await page.getByRole('dialog', {name: 'Lookup'}).locator('#lookup-search-button').click();
        await page.getByRole('gridcell', {name: `St. Catherine's Hospital`}).first().click();
        await page.getByRole('button', {name: 'Select', exact: true}).click();

        // Save Authorization
        await page.getByRole('button', {name: ' Save'}).click();
        await waitUntilLoaded(page);

        // Optional Work Log handling
        try {
            await expect(page.getByText('New Work Log')).toBeVisible({timeout: 3000});
            // If needed, collect the date:
            // const worklogActivityDate = await page.locator('#work_activity_date').evaluate(e => e.value);
            await page.getByRole('button', {name: ' Save and Close'}).click();
        } catch {
            await expect(page.getByText('New Work Log')).not.toBeVisible({timeout: 3000});
        }
        await waitUntilLoaded(page);


        // Grab the "Auth #"
        await page.locator(`#form-header .headerLabel`).waitFor();
        const authNum = await page.locator(`#form-header .headerLabel`).innerText();


        // Add Bed Day
        await page.getByRole(`button`, {name: `  Bed Day`}).click();
        await waitUntilLoaded(page);
        // Requested Bed Level
        await page.locator('input[name="auli_requested_bed_level_input"]').fill(bedLevel);
        await page.getByRole('option', {name: bedLevel}).click();

        // Requested Units
        const spin = page.getByRole('spinbutton').first();
        await spin.fill('200');

        await waitUntilLoaded(page);

        // Save & Close Bed Day
        await page.getByRole('button', {name: ' Save and Close', exact: true}).click();
        await waitUntilLoaded(page);

        // Save & Close Work Log popup (if any)
        await page.getByRole('button', {name: ' Save and Close'}).click();
        await waitUntilLoaded(page);


        try {

            //--------------------------------
            // Assert:
            //--------------------------------

            await page.locator(`[id="shortcuts"] [data-value="nextactions-anchor"]:visible`).click();

            const grid = page.locator('div[data-parent-table-code="AUTH"][data-table-code="NACT"]');
            const rows = grid.locator('.k-grid-content table.k-grid-table tbody tr');
            await expect(rows).toHaveCount(1);

            //const serviceRequestDate = (await page.locator('#auli_service_request_date').inputValue()).split(" ")[0];

            const row = rows.first();
            const expectedTexts = ['Medium', 'Bed Day', 'Auto Approval Follow-up', 'Pending', nextActionComment,];
            for (const text of expectedTexts) {
                await expect(row).toContainText(text);
            }


            //--------------------------------
            // Cleanup:
            //--------------------------------

            // Back to All Auths (ensures we’re on a clean screen for cleanup)
            await page.getByRole('button', {name: ' All Auths'}).click();
            await waitUntilLoaded(page);


        } finally {
            // --- Cleanup (always runs) ---
            try {
                await waitUntilLoaded(page);
                await cleanupTabOnMembersPage(page, {
                    tab: 'Authorizations',
                    gridId: '[id="authorizations-grid"]',
                    memberName: lastFirstName,
                    loginID: username,
                    // omit onScreen so helper navigates to the member and tab
                });
                //await waitUntilLoaded(page);
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupTabOnMembersPage',
                    errorMsg: e.message,
                });
                // Optionally rethrow to fail if cleanup is mandatory:
                // throw e;
            }
        }


        //await browser.close();

    })
});



