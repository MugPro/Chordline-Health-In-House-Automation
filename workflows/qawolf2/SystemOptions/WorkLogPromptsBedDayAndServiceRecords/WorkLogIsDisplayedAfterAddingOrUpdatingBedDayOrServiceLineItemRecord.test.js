// WorkLogIsDisplayedAfterAddingOrUpdatingBedDayOrServiceLineItemRecord.test.js
import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';

// Helpers from your repo (paths may need adjusting)
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
    { dialogName = 'Notification', okButtonName = 'Okay', timeout = 3000 } = {}
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

test.describe(
    'Work Log is displayed after adding or updating Bed Day or Service Line Item',
    () => {
        let browser, context, page;

        /*
        test.beforeEach(async () => {
            const loginID = 'TouchRecord';

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

        test('Work Log displayed & fields correct after Bed Day add/update', async () => {
            //--------------------------------
            // Arrange:
            //--------------------------------
            const today = Date.now();
            const loginID = 'TouchRecord';
            const userName = 'Touch Record';
            const lastFirstName = 'Ace, Clancy';
            const authorizationType = 'Inpatient';
            const patientStatus = 'Admitted';
            const admitDate = dateFormat(today, 'MMddyyyyhhmmssaa'); // compact format as provided
            const authStatus = 'In Progress';
            const team = 'Case Team';
            const reviewer = `${loginID} Qaw`; // not strictly required unless UI needs it
            const formattedDate = dateFormat(new Date(), 'MM/dd/yyyy');
            const timeSpent = '120';

            const tab = 'Authorizations';
            const gridId = '[id="authorizations-grid"]';



            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL_2;


            // Act
            const { page, browser } = await logIn3({
                loginID,
                password,
                url
            });



            try {
                //--------------------------------
                // System Options: WorkLogPrompts_BedDayService = Yes
                //--------------------------------
                await page.getByText('Tools').click({ delay: 300, force: true });
                await page.getByText('System Options').click();

                await page.getByText('Configuration', { exact: true }).click();
                await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

                // Ensure "WorkLogPrompts_BedDayService" is set to Yes
                try {
                    await expect(page.locator('#WorkLogPrompts_BedDayService_Yes')).toBeChecked();
                } catch {
                    await page.locator('#WorkLogPrompts_BedDayService_Yes').check();
                }

                // Save & Close
                await page.getByRole('button', { name: 'Save and Close' }).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Create an Inpatient Authorization (manual flow)
                //--------------------------------
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
                await page.getByRole('checkbox', { name: 'Out of Network' }).check();
                await page.getByRole('checkbox', { name: 'In Network' }).check();
                await page.getByRole('textbox', { name: 'Search...' }).fill(`St. Catherine's Hospital`);
                await page.getByRole('dialog', { name: 'Lookup' }).locator('#lookup-search-button').click();
                await page.getByRole('gridcell', { name: `St. Catherine's Hospital` }).first().click();
                await page.getByRole('button', { name: 'Select', exact: true }).click();

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
                // Add Bed Day (this should trigger Work Log per System Option)
                //--------------------------------
                await page.getByRole('button', { name: /Bed Day/ }).click();
                await waitUntilLoaded(page);


                await page.locator('input[name="auli_requested_bed_level_input"]').fill('Behavioral Health');
                await page.getByRole('option', { name: 'Behavioral Health' }).click();

                await waitUntilLoaded(page);

                // Increase Requested Units (click the numeric spinner up button once)
                await page.getByRole('button', { name: 'Increase value' }).click();


                await waitUntilLoaded(page);

                // Save & Close the Bed Day popup
                await page.getByRole('button', { name: ' Save and Close' }).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Assert: Work Log appears; fill Time Spent and save
                //--------------------------------
                // Ensure Work Log popup visible (prompted by Bed Day add/update)
                await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 7000 });

                // Fill Time Spent (minutes) and Save & Close
                await page.locator('#work_time_spent').fill(timeSpent);
                await page.getByRole('button', { name: ' Save and Close' }).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Member Detail > Touches: open the most recent log and verify
                //--------------------------------
                // Switch to "Member Detail" (menu) then "Touches" tab
                await page.getByRole('menuitem', { name: 'Member Detail' }).locator('span').nth(1).click();
                await page.getByText('Touches', { exact: true }).first().click();

                // Filter Touches by "Authorization"
                await page
                    .locator('#worklogs-child-browse-div [placeholder="Search..."]')
                    .first()
                    .fill('Authorization');
                await page.keyboard.press('Enter');

                // Click the most recent 2.00 hr log (120 minutes = 2.00 hr)
                // If your UI formats differently, adjust this selector accordingly.
                await page.getByRole('gridcell', { name: '2.00 hr' }).first().click();

                // Edit the Work Log
                await page.getByRole('button', { name: '', exact: true }).click();

                //--------------------------------
                // Assertions on the Work Log record
                //--------------------------------
                await expect(page.locator('#work_time_spent')).toHaveValue(timeSpent);
                await expect(page.locator('input[name="work_completed_by_input"]')).toHaveValue(userName);

                const inputValue = await page.locator('#work_activity_date').inputValue();
                expect(inputValue.split(' ')[0]).toBe(formattedDate);

                await waitUntilLoaded(page);
                await page.getByRole('button', { name: ' Close' }).click();

                //await waitUntilLoaded(page);

            } finally {
                //--------------------------------
                // Cleanup (always)
                //--------------------------------
                try {
                    await waitUntilLoaded(page);
                    await cleanupTabOnMembersPage(page, {
                        tab,
                        gridId,
                        memberName: lastFirstName,
                        loginID: userName,
                        // omit onScreen so helper navigates Home > Members > member > Authorizations
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
        });
    }
);