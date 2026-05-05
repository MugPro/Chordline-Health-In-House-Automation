// WorkLogPromptsTouchRecord.test.js
import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';
import {
    logIn,
    waitUntilLoaded,
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

test.describe('Work Log Prompt – Touch Records (Phone Call)', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = 'TouchRecord';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            slowMo: 1000,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });

     */

    test('Touch → Phone Call prompts Work Log and fields are correct', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        //const loginID = `TouchRecord`;
        const userName = `Touch Record`;
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
        const phoneNumber = `9165551000`;
        const timeSpent = `120`;



        //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;


        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url,
            slowMo: 1000
        });


        //--------------------------------
        // Act:
        //--------------------------------
        // Navigate to Tools > System Options
        await page.getByText('Tools').click();
        await page.getByText('System Options').click();

        // Click "Configuration" tab
        await page.getByText('Configuration', { exact: true }).click();

        // Scroll "Authorization Configuration" (where Touch toggle is placed in your UI)
        await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

        // Ensure Work Log Prompts: Touch is ON
        try {
            await expect(page.locator('#WorkLogPrompts_Touch_Yes')).toBeChecked();
        } catch {
            await page.locator('#WorkLogPrompts_Touch_Yes').check();
        }

        // Save and Close
        await page.getByRole('button', { name: 'Save and Close' }).click();
        //await waitUntilLoaded(page);















        // Navigate to Home
        await page.getByText('Home', {exact: true}).click();

        // Members tab
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        // Search for the member
        await page.getByRole('textbox', {name: 'Search...'}).fill(lastFirstName);
        await page.keyboard.press('Enter');

        // Open the member
        await page.getByRole('gridcell', {name: lastFirstName}).dblclick();
        //await waitUntilLoaded(page);

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

        //await waitUntilLoaded(page);

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
        //await waitUntilLoaded(page);
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

       // await waitUntilLoaded(page);

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
        //await waitUntilLoaded(page);

        // Optional Work Log handling
        try {
            await expect(page.getByText('New Work Log')).toBeVisible({timeout: 3000});
            // If needed, collect the date:
            // const worklogActivityDate = await page.locator('#work_activity_date').evaluate(e => e.value);
            await page.getByRole('button', {name: ' Save and Close'}).click();
        } catch {
            await expect(page.getByText('New Work Log')).not.toBeVisible({timeout: 3000});
        }
        //await waitUntilLoaded(page);


        // Grab the "Auth #"
        await page.locator(`#form-header .headerLabel`).waitFor();
        const authNum = await page.locator(`#form-header .headerLabel`).innerText();




















       // await waitUntilLoaded(page);

        //--------------------------------
        // Member Detail → Authorizations → Case → Save
        //--------------------------------
        await page.getByRole('menuitem', { name: 'Member Detail' }).locator('span').nth(1).click();

        // Sometimes the Member Detail view nests tabs; this selector aligns with your steps
        await page.getByText('AuthorizationsAuthorizations').click();

        // Navigate to Case
        await page.getByRole('menuitem', { name: 'Case' }).locator('span').nth(1).click();

        // + Case
        await page.getByRole('button', { name: ' Case' }).click();

        // Save (program/manager/status prefills)
        await page.getByRole('button', { name: ' Save' }).click();

        // Close Case (if any modal shows, your helper flow handles wait)
        await page.getByRole('button', { name: ' Save and Close' }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // Touches → + Touch → Phone Call
        //--------------------------------
        await page.getByRole('menuitem', { name: 'Touches' }).locator('span').click();
        await page.getByRole('menuitem', { name: 'Touches' }).locator('span').first().click();

        // + Touch
        await page
            .getByRole('button')
            .filter({ hasText: 'Touch Phone Call Visit CM' })
            .click();

       // await waitUntilLoaded(page);

        // Phone Call
        await page.getByRole('menuitem', { name: 'Phone Call' }).locator('a').click();
        //await waitUntilLoaded(page);

        // Phone number
        await page.locator('#tuch_phone_number_national_number').fill(phoneNumber);

        // Save Touch (expect Work Log prompt)
        await page.getByRole('button', { name: ' Save', exact: true }).click();

        // Fill Time Spent = 120 and close WL
        await page.locator('#work_time_spent').fill(timeSpent);
        await page.getByRole('button', { name: ' Save and Close' }).click();
        //await waitUntilLoaded(page);

        // Close Touch record
        await page.getByRole('button', { name: ' Close' }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // Verify in Member Detail → Touches
        //--------------------------------
        await page.getByRole('menuitem', { name: 'Member Detail' }).locator('span').nth(1).click();

        // Open Touches section
        await page.locator(':text-is("Touches") >> nth=0').click();

        // Filter the Touches by "Case" (ensures Touch created under Case context)
        await page
            .locator('#worklogs-child-browse-div [placeholder="Search..."]')
            .first()
            .fill('Case');
        await page.keyboard.press('Enter');

        // Click the most recent 2.00 hr log (120 minutes)
        await page.getByRole('gridcell', { name: '2.00 hr' }).first().click();

        // Edit the Work Log
        await page.getByRole('button', { name: '', exact: true }).click();

        //--------------------------------
        // Assert:
        //--------------------------------
        await expect(page.locator('#work_time_spent')).toHaveValue(timeSpent);
        await expect(page.locator('input[name="work_completed_by_input"]')).toHaveValue(userName);

        const inputValue = await page.locator('#work_activity_date').inputValue();
        expect(inputValue.split(' ')[0]).toBe(formattedDate);

        await browser.close();

    });

});