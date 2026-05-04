// WorkLogPromptsNoticeRecords.test.js
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

test.describe('Work Log Prompt – Compliance Notice Records', () => {
    let browser, context, page;

    /*

    test.beforeEach(async () => {
        const loginID = 'NoticeRecord';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            slowMo: 900,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });

     */

    test('Work Log appears with correct fields after editing a Notice', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        //const loginID = `NoticeRecord`;
        const userName = `Notice Record`;
        const lastFirstName = `Ace, Clancy`;
        const authorizationType = `Inpatient`;
        const patientStatus = `Admitted`;
        const admitDate = dateFormat(today, 'MM dd yyyy hh mm ss aa'); // "07 25 2025 12 00 00 AM" style
        const authStatus = `In Progress`;
        const team = `Case Team`;
        const reviewer = `${loginID} Qaw`;
        const timeSpent = `60`;
        const formattedDate = dateFormat(new Date(), 'MM/dd/yyyy');



        //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        const loginID = 'LoginIdTest1';
        const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url,
            slowMo: 900
        });


        //--------------------------------
        // Act:
        //--------------------------------
        // Tools > System Options
        await page.getByText('Tools').click();
        await page.getByText('System Options').click();

        // Configuration tab
        await page.getByText('Configuration', { exact: true }).click();

        // Scroll "Authorization Configuration" into view
        await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

        // Ensure Compliance → Notice prompt is ON
        try {
            await expect(page.locator('#WorkLogPrompts_Compliance_Notice_Yes')).toBeChecked();
        } catch {
            await page.locator('#WorkLogPrompts_Compliance_Notice_Yes').check();
        }

        //await waitUntilLoaded(page);
        // Save & Close
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

        //await waitUntilLoaded(page);

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

















        //await waitUntilLoaded(page);

        //--------------------------------
        // Member Detail → Notices
        //--------------------------------
        await page.getByRole('menuitem', { name: 'Member Detail' }).locator('span').nth(1).click();

        // Open Notices shortcut
        await page.locator('#compliance-notices-anchor').getByText('Notices').click();

        //await waitUntilLoaded(page);

        // Click the first "Grievance" row
        await page.getByRole('gridcell', { name: 'Grievance' }).first().click();

        //await waitUntilLoaded(page);

        // Edit
        await page.getByRole('button', { name: '', exact: true }).click();

        //await waitUntilLoaded(page);

        // Click "X" to remove status (fifth close icon as per your nth(4))
        await page.getByRole('button', { name: '', exact: true }).nth(4).click();

        //await waitUntilLoaded(page);

        // Attempt Status = Pending
        await page.locator('input[name="cpna_attempt_status_id__1_input"]').fill('Pending');

        // If your UI requires selecting from the dropdown explicitly, uncomment:
        // await page.getByRole('option', { name: 'Pending', exact: true }).click();

        //await waitUntilLoaded(page);

        // Save & Close the Notice
        await page.getByRole('button', { name: ' Save and Close' }).click();

        //await waitUntilLoaded(page);

        // Work Log prompt should appear — fill Time Spent
        await expect(page.getByText('New Work Log')).toBeVisible();
        await page.locator('#work_time_spent').fill(timeSpent);

        //await waitUntilLoaded(page);

        // Save & Close Work Log
        await page.getByRole('button', { name: ' Save and Close' }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // Work Logs tab → open latest Compliance log
        //--------------------------------
        await page.locator('span[role="none"] :text("Work Logs") >> nth=0').click();

        //await waitUntilLoaded(page);

        // Navigate next and previous page (as in your steps)
        await page.locator('#worklogs-child-grid [aria-label="Go to the next page"]').first().click();

        //await waitUntilLoaded(page);

        await page.locator('#worklogs-child-grid [aria-label="Go to the previous page"]').first().click();

        //await waitUntilLoaded(page);

        // Click latest row with "Compliance"
        await page.getByRole('gridcell', { name: 'Compliance', exact: true }).first().click();

        //await waitUntilLoaded(page);

        // Edit (open the Work Log record)
        await page.getByRole('button', { name: '', exact: true }).click();

        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert:
        //--------------------------------
        // Completed By = userName
        await expect(page.locator('input[name="work_completed_by_input"]')).toHaveValue(userName);

        // Health Plan text visible in Work Log
        await expect(page.locator('div:text("Wonderful Health Plan") >> nth=1')).toBeVisible();

        // Activity Date/Time starts with today's date (MM/dd/yyyy)
        const inputValue = await page.locator('#work_activity_date').inputValue();
        expect(inputValue.split(' ')[0]).toBe(formattedDate);
    });
});