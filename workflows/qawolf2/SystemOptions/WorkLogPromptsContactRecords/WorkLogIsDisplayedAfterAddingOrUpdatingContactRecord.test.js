// WorkLogPromptsContactRecords.test.js
import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';
import { faker } from '@faker-js/faker';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
    createAuthorizationForMember, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

// Optional transient dialog handler (kept for parity across tests)
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

test.describe('Work Log Prompt – Contact Records', () => {
    let browser, context, page;


    /*
    test.beforeEach(async () => {
        const loginID = 'WorkLogPrompts';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });

     */

    test.afterEach(async () => {
        await context?.close();
        await browser?.close();
    });

    test('Work Log appears with correct fields after creating Contact (Phone Call)', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        //const loginID = `WorkLogPrompts`;
        //const userName = `WorkLog Prompts`;


        const userName = `t2F t2L`;

        const lastFirstName = `Ace, Clancy`;
        const authorizationType = `Inpatient`;
        const patientStatus = `Admitted`;
        const admitDate = dateFormat(today, 'MMddyyyyhhmmssaa'); // compact format
        const authStatus = `In Progress`;
        const team = `Case Team`;

        const loginID = 'LoginIdTest1';
        const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

        const reviewer = `${loginID} Qaw`;
        const formattedDate = dateFormat(new Date(), 'MM/dd/yyyy');
        const tab = 'Authorizations';
        const gridId = `[id="authorizations-grid"]`;

        // Using faker for US phone number format; if your faker version supports phoneNumber(), switch accordingly
        const phoneNumber = faker.phone.number('(###) ###-####');




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
        await page.getByText(`Tools`).click();
        await page.getByText(`System Options`).click();

        // Click "Configuration" tab
        await page.getByText(`Configuration`, { exact: true }).click();

        try {
            // Verify that "Contact" Work Log prompts is set to "Yes"
            await expect(page.locator(`#WorkLogPrompts_Contact_Yes`)).toBeChecked();
        } catch {
            // Toggle "Yes"
            await page.locator(`#WorkLogPrompts_Contact_Yes`).check();
        }


        await waitUntilLoaded(page);

        // Save & Close System Options
        await page.getByRole(`button`, { name: `Save and Close` }).click();
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

        await waitUntilLoaded(page);

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





















        await waitUntilLoaded(page);

        //--------------------------------
        // Create Contact: Phone Call
        //--------------------------------
        // Click `Contacts` tab
        await page.getByRole(`menuitem`, { name: `Contacts` }).locator(`span`).click();

        // Click `+ Contact` button
        await page
            .getByRole(`button`)
            .filter({ hasText: `Contact Phone Call Visit UM` })
            .click();


        // Choose `Phone Call`
        await page.getByRole(`menuitem`, { name: `Phone Call` }).locator(`a`).click();


        await waitUntilLoaded(page);

        // Fill in phone number
        await page.locator(`#ctct_phone_number_national_number`).fill(phoneNumber);


        await waitUntilLoaded(page);

        // Click `Save`
        await page.getByRole(`button`, { name: ` Save`, exact: true }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert:
        //--------------------------------
        // Ensure Work Log modal is visible
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        // Verify Completed By is the active user
        await expect(page.locator(`input[name="work_completed_by_input"]`)).toHaveValue(userName);

        // Verify Health Plan text
        await expect(
            page.getByLabel(`New Work Log`).getByText(`Wonderful Health Plan`)
        ).toBeVisible();

        // Verify Activity Date/Time starts with today's date (MM/dd/yyyy)
        const inputValue = await page.locator(`#work_activity_date`).inputValue();
        expect(inputValue.split(' ')[0]).toBe(formattedDate);


        await waitUntilLoaded(page);

        // Close the Work Log to keep UI clean
        await page.getByRole(`button`, { name: ` Save and Close` }).click();


        await waitUntilLoaded(page);

        await page.getByRole('button', { name: ' Close' }).click();


        await waitUntilLoaded(page);

        //--------------------------------
        // Cleanup (optional but recommended):
        //--------------------------------
        try {
            // Navigate back to Authorizations list and clean up created auth
            await page.getByText(`Authorizations`).nth(2).click();
            await page.getByRole(`button`, { name: ` All Auths` }).click();

            await cleanupTabOnMembersPage(page, {
                tab,
                memberName: lastFirstName,
                loginID: userName,
                gridId,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupTabOnMembersPage',
                errorMsg: e.message,
            });
        }

        //await browser.close();

    });
});
