// WorkLogIsDisplayedAfterAddingOrUpdatingAuthorization.test.js
import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';

// Helpers from your repo (paths may need adjusting to match your structure)
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

// Optional transient dialog handler (e.g., duplicate provider warning)
async function maybeHandleNotificationOk(
    page,
    { dialogName = 'Notification', okButtonName = 'Okay', timeout = 3000 } = {},
) {
    const dialog = page.getByRole('dialog', { name: dialogName });
    const appeared = await dialog
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
    if (!appeared) return false;
    await dialog.getByRole('button', { name: okButtonName }).click({ timeout });
    return true;
}

test.describe('Work Log appears (with correct Completed By & Activity Date) after updating an Authorization', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = 'AuthorizationRecord';

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

    test('Work Log is displayed after adding or updating authorization fields', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        //const loginID = 'AuthorizationRecord';
        //const displayName = 'Authorization Record'; // display name that appears in grids/fields

        const displayName = 't2F t2L'; // display name that appears in grids/fields



        const lastFirstName = 'Ace, Clancy';

        const authorizationType = 'Inpatient';
        const patientStatus = 'Admitted';
        // The user’s data indicates this compact format
        const admitDate = dateFormat(today, 'MMddyyyyhhmmssaa'); // e.g., 07252025120000AM
        const authStatus = 'In Progress';
        const team = 'Case Team';


        const loginID = 'LoginIdTest1';
        const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

        const reviewer = `${loginID} Qaw`; // not strictly required by UI unless needed
        const todayDate = dateFormat(new Date(), 'MM/dd/yyyy');

        const tab = 'Authorizations';
        const gridId = '[id="authorizations-grid"]';



        //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;


        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url
        });


        try {
            //--------------------------------
            // Initial cleanup (if any)
            //--------------------------------
            await cleanupTabOnMembersPage(page, {
                tab,
                memberName: lastFirstName,
                loginID: displayName,
                gridId,
            });

            //--------------------------------
            // Act: Ensure System Option ("Allow inpatient/Observation Conversion") = Yes
            //--------------------------------
            await page.getByText('Tools').click({ delay: 300, force: true });
            await page.getByText('System Options').click();
            await page.getByText('Configuration', { exact: true }).click();
            await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

            // Toggle the "Allow inpatient/Observation Conversion" to Yes if needed
            try {
                await expect(page.locator('#AuthConfig_AuthConversion_Yes')).toBeChecked();
            } catch {
                await page.locator('#AuthConfig_AuthConversion_Yes').check();
            }

            // Save & Close
            await page.getByRole('button', { name: 'Save and Close' }).click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Act: Create an Inpatient authorization (manual flow)
            //--------------------------------
            // Home > Members
            await page.getByText('Home', { exact: true }).click();
            await page.locator('#home-tabs-tab-4').getByText('Members').click();

            // Search & open member
            await page.getByRole('textbox', { name: 'Search...' }).fill(lastFirstName);
            await page.keyboard.press('Enter');
            await page.getByRole('gridcell', { name: lastFirstName }).dblclick();
            await waitUntilLoaded(page);

            // New Authorization (Inpatient)
            await page.locator('#authorizations-menu').click();
            await page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }).hover();
            await page.getByLabel(lastFirstName).getByText(authorizationType, { exact: true }).click();
            await waitUntilLoaded(page);

            // Fill inpatient fields
            if (authorizationType === 'Inpatient' || authorizationType === 'Observation') {
                await page
                    .locator('input[name="aush_inpatient_status_id__1_input"]')
                    .fill(patientStatus);
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
            await page.getByRole('checkbox', { name: 'Out of Network' }).check();
            await page.getByRole('checkbox', { name: 'In Network' }).check();
            await page.getByRole('textbox', { name: 'Search...' }).fill(`St. Catherine's Hospital`);
            await page.getByRole('dialog', { name: 'Lookup' }).locator('#lookup-search-button').click();
            await page.getByRole('gridcell', { name: `St. Catherine's Hospital` }).first().click();
            await page.getByRole('button', { name: 'Select', exact: true }).click();

            // Optional duplicate-notification
            await maybeHandleNotificationOk(page, { timeout: 7000 });
            await waitUntilLoaded(page);

            // Provider 2 (admitting) lookup
            await page.locator('[name="auth_provider_2_site_id"] ~ button[title="Lookup"]').click();
            await page.getByRole('checkbox', { name: 'Out of Network' }).check();
            await page.getByRole('checkbox', { name: 'In Network' }).check();
            await page.getByRole('textbox', { name: 'Search...' }).fill(`St. Catherine's Hospital`);
            await page.getByRole('dialog', { name: 'Lookup' }).locator('#lookup-search-button').click();
            await page.getByRole('gridcell', { name: `St. Catherine's Hospital` }).first().click();
            await page.getByRole('button', { name: 'Select', exact: true }).click();

            // Save authorization
            await page.getByRole('button', { name: ' Save' }).click();
            await waitUntilLoaded(page);

            // Optional "New Work Log" on initial save (close if present)
            try {
                await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
                await page.getByRole('button', { name: ' Save and Close' }).click();
            } catch {
                await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
            }
            await waitUntilLoaded(page);

            //--------------------------------
            // Act: Edit the Authorization to trigger a Work Log
            //--------------------------------
            // Click Edit
            await page.getByRole('button', { name: ' Edit' }).click();



            await waitUntilLoaded(page);



            // Remove "Case Team" (trash/X for team field); using nth(1) per your steps
            await page.getByRole('button', { name: '' }).nth(1).click();

            // Expand combobox (nth(1)) and choose "Add AvailableField"
            await page.getByRole('button', { name: 'expand combobox' }).nth(1).click();
            await page.getByRole('option', { name: 'Add AvailableField' }).locator('span').click();

            // Scroll to "Admitting Hospital" and pick a value via lookup
            await page.getByText('Admitting Hospital:').scrollIntoViewIfNeeded();
            await page
                .locator(
                    `[data-bind="attr: { class: fields.auth_provider_1_site_id.inputClass }"] [title="Lookup"]`,
                )
                .click();

            // Pick "Sacramento General Hospital" from the lookup
            await page.getByRole('gridcell', { name: 'Sacramento General Hospital' }).click();
            await page.getByRole('button', { name: 'Select', exact: true }).click();



            // Optional duplicate-notification
            await maybeHandleNotificationOk(page, { timeout: 7000 });
            await waitUntilLoaded(page);


            // Save the Authorization update — this should trigger a "New Work Log"
            await page.getByRole('button', { name: ' Save' }).click();


            await waitUntilLoaded(page);

            //--------------------------------
            // Assert: Work Log fields (Completed By, Activity Date)
            //--------------------------------
            // Ensure the "New Work Log" dialog is visible
            await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 7000 });

            // Completed By should be the display name for this test login
            await expect(page.locator('input[name="work_completed_by_input"]')).toHaveValue(displayName);

            // Activity Date starts with today's date (MM/dd/yyyy)
            const activityDateValue = await page.locator('input[name="work_activity_date"]').inputValue();
            expect(activityDateValue.startsWith(todayDate)).toBe(true);


            await waitUntilLoaded(page);

            //--------------------------------
            // Close Work Log & optional All Auths
            //--------------------------------
            await page.getByRole('button', { name: ' Save and Close' }).click();
            await waitUntilLoaded(page);

            // Optional: go to All Auths (consistent with your pattern)
            await page.getByRole('button', { name: ' All Auths' }).click();
            await waitUntilLoaded(page);
        } finally {
            //--------------------------------
            // Cleanup (always):
            //--------------------------------
            try {
                await waitUntilLoaded(page);
                await cleanupTabOnMembersPage(page, {
                    tab,
                    memberName: lastFirstName,
                    loginID: displayName,
                    gridId,
                    // Omit onScreen so helper navigates Home > Members > member > Authorizations
                });
            } catch (e) {
                try {
                    await reportCleanupFailed({
                        dedupKey: 'cleanupTabOnMembersPage',
                        errorMsg: e.message,
                    });
                } catch {
                    // swallow reporting errors
                }
            }
        }

        //await browser.close();

    });
});