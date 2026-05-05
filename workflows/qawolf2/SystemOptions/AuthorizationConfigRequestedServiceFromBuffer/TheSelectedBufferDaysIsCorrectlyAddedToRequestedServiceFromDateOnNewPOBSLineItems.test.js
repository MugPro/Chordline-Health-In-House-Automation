// TheSelectedBufferDaysIsCorrectlyAddedToRequestedServiceFromDateOnNewPOBSLineItems.test.js
import { test, expect } from '@playwright/test';
import {
    format as dateFormat,
    parse,
    differenceInCalendarDays,
} from 'date-fns';

// Helpers from your repo (paths may need adjusting)
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

// Optional transient dialog handler
async function maybeHandleNotificationOk(
    page,
    {
        dialogName = 'Notification',
        okButtonName = 'Okay',
        timeout = 3000,
    } = {}
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
    'Requested Service From Buffer (+1) is applied on new POBS (Bed Day) line items',
    () => {
        let browser, context, page;

        /*
        test.beforeEach(async () => {
            const loginID = 'AuthReqServBuff';


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

        test('The selected buffer days are correctly added to Requested Service From date on new POBS line items', async () => {
            //--------------------------------
            // Arrange:
            //--------------------------------
            const today = Date.now();
            //const loginID = 'AuthReqServBuff';
            //const username = 'Auth ReqServBuff'; // display name used in your grids


            const username = `t2F t2L`;

            const lastFirstName = 'Ace, Clancy';
            const authorizationType = 'Inpatient';
            const patientStatus = 'Admitted';
            const admitDate = dateFormat(today, 'MM dd yyyy hh mm ss aa');
            const authStatus = 'In Progress';
            const team = 'Case Team';
            const bedLevel = 'NICU';
            const numBedDays = '5';
            const numBedDays2 = '1';


            let firstBedDaysRequestedServiceToDate = '';
            let secondBedDaysRequestedServiceFrom = '';


            //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL_2;

            const loginID = 'LoginIdTest1';
            const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper



            // Act
            const { page, browser } = await logIn3({
                loginID,
                password,
                url
            });



            try {
                //--------------------------------
                // Act: Set System Option (+1 buffer)
                //--------------------------------

                await waitUntilLoaded(page);

                await page.getByText('Tools').click({ delay: 500, force: true });
                await page.getByText('System Options').click();

                await page.getByText('Configuration', { exact: true }).click();
                await page
                    .getByText('Authorization Configuration')
                    .scrollIntoViewIfNeeded();

                // Ensure "Requested Service From Buffer = +1"
                try {
                    await expect(
                        page.locator('#AuthConfig_RequestedServiceFromBuffer_\\+1')
                    ).toBeChecked({ timeout: 10_000 });
                } catch {
                    await page.locator('#AuthConfig_RequestedServiceFromBuffer_\\+1').check();
                }

                // Save & Close System Options
                await page.getByRole('button', { name: 'Save and Close' }).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Act: Create an Inpatient authorization
                //--------------------------------

                // Navigate to Home > Members
                await page.getByText('Home', { exact: true }).click();
                await page.locator('#home-tabs-tab-4').getByText('Members').click();

                // Search & open member
                await page.getByRole('textbox', { name: 'Search...' }).fill(lastFirstName);
                await page.keyboard.press('Enter');
                await page.getByRole('gridcell', { name: lastFirstName }).dblclick();
                await waitUntilLoaded(page);

                // New Authorization (Inpatient)
                await page.locator('#authorizations-menu').click();
                await page
                    .getByRole('button')
                    .filter({ hasText: 'Authorization Inpatient' })
                    .hover();
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

                // Optional Work Log
                try {
                    await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
                    await page.getByRole('button', { name: ' Save and Close' }).click();
                } catch {
                    await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
                }
                await waitUntilLoaded(page);





                // Grab the "Auth #"
                await page.locator(`#form-header .headerLabel`).waitFor();
                const authNum = await page.locator(`#form-header .headerLabel`).innerText();






                //--------------------------------
                // Act: Bed Day #1 (5 units)
                //--------------------------------
                // Add Bed Day
                await page.getByRole(`button`, {name: `  Bed Day`}).click();


                await waitUntilLoaded(page);

                // Requested Bed Level
                await page.locator('input[name="auli_requested_bed_level_input"]').fill(bedLevel);
                await page.getByRole('option', { name: bedLevel }).click();


                /*
                // Requested Units
                const spin1 = page.getByRole('spinbutton').first();
                //await spin1.click();
                await spin1.fill(numBedDays);

                 */


                await page.getByRole('spinbutton').click();
                await page.locator('#auli_requested_units').fill('5');
                await page.locator('#auli_requested_units').press('Enter');



                await waitUntilLoaded(page);

                // Save (not close) to compute service range
                await page.getByRole('button', { name: ' Save', exact: true }).click();
                await waitUntilLoaded(page);

                // Save & Close Work Log (if any)
                await page.getByRole('button', { name: ' Save and Close' }).click();
                await waitUntilLoaded(page);

                // Capture "Requested Service To" (date only)
                firstBedDaysRequestedServiceToDate = (
                    await page.locator('#auli_requested_service_to').innerText()
                ).split(' ')[0];

                // Close Bed Days popup
                await page.getByRole('button', { name: ' Close' }).click();


                await waitUntilLoaded(page);



                // Grab the "Auth #"
                await page.locator(`#form-header .headerLabel`).waitFor();
                const authNum2 = await page.locator(`#form-header .headerLabel`).innerText();


                //--------------------------------
                // Act: Bed Day #2 (1 unit)
                //--------------------------------
                // Add Bed Day
                await page.getByRole(`button`, {name: `  Bed Day`}).click();

                await waitUntilLoaded(page);

                await page.locator('input[name="auli_requested_bed_level_input"]').fill(bedLevel);
                await page.getByRole('option', { name: bedLevel }).click();


                await page.getByRole('spinbutton').click();
                await page.locator('#auli_requested_units').fill('1');
                await page.locator('#auli_requested_units').press('Enter');

                await page.getByRole('button', { name: ' Save', exact: true }).click();
                await waitUntilLoaded(page);

                await page.getByRole('button', { name: ' Save and Close' }).click();
                await waitUntilLoaded(page);

                // Capture "Requested Service From" (date only)
                secondBedDaysRequestedServiceFrom = (
                    await page.locator('#auli_requested_service_from').innerText()
                ).split(' ')[0];



                // Close Bed Days popup
                await page.getByRole('button', { name: ' Close' }).click();




                //--------------------------------
                // Assert:
                //--------------------------------
                const firstToParsed = parse(
                    firstBedDaysRequestedServiceToDate,
                    'MM/dd/yyyy',
                    new Date()
                );
                const secondFromParsed = parse(
                    secondBedDaysRequestedServiceFrom,
                    'MM/dd/yyyy',
                    new Date()
                );


                await waitUntilLoaded(page);

                // Expect a +1 day buffer: secondFrom - firstTo = 1 day
                const dayDiff = differenceInCalendarDays(secondFromParsed, firstToParsed);
                expect(dayDiff).toBe(1);

                // Optional nav back to All Auths for screenshots/report view
                await page.getByRole('button', { name: ' All Auths' }).click();
                await waitUntilLoaded(page);
            } finally {
                //--------------------------------
                // Cleanup (always):
                //--------------------------------
                try {
                    await waitUntilLoaded(page);
                    await cleanupTabOnMembersPage(page, {
                        tab: 'Authorizations',
                        gridId: '[id="authorizations-grid"]',
                        memberName: lastFirstName,
                        loginID: username,
                        // omit onScreen so helper navigates Home > Members > member > Authorizations
                    });
                } catch (e) {
                    // Swallow reporting errors so they don't flip the test result
                    try {
                        await reportCleanupFailed({
                            dedupKey: 'cleanupTabOnMembersPage',
                            errorMsg: e.message,
                        });
                    } catch {}
                }
            }

            //await browser.close();

        });
    }
);