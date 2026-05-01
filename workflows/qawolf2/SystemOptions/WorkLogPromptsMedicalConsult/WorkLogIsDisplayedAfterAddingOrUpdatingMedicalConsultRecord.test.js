/*

import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
} from '../../../../helpers/Node20Helpers.js';

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

test.describe('Work Log Prompt – Medical Consult via Bed Day & Medical Review', () => {
    let browser, context, page;

    test.beforeEach(async () => {
        const loginID = 'MedicallConsult';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });



    test('Work Log prompts on Medical Review save with time spent entry', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        const loginID = `MedicallConsult`;
        const lastFirstName = `Ayers, Ronald`;
        const authorizationType = `Inpatient`;
        const patientStatus = `Admitted`;
        const admitDate = dateFormat(today, 'MMddyyyyhhmmssaa');
        const authStatus = `In Progress`;
        const team = `Case Team`;
        const reviewer = `${loginID} Qaw`;
        const incrementType = `12`;
        const formattedDate = dateFormat(today, 'MM/dd/yyyy hh:mm:ss a');
        const tab = 'Authorizations';
        const gridId = '[id="authorizations-grid"]';


        await waitUntilLoaded(page);

        //--------------------------------
        // Act:
        //--------------------------------
        // Navigate to Tools > System Options
        await page.getByText(`Tools`).click();
        await page.getByText(`System Options`).click();

        // Click "Configuration" tab
        await page.getByText(`Configuration`, { exact: true }).click();

        // Scroll "Medical Consult" (Member Plan prompt) into view
        await page.locator(`#WorkLogPrompts_MemberPlan_Yes`).scrollIntoViewIfNeeded();

        try {
            // Ensure "Member Plan" Work Log prompt is ON
            await expect(page.locator(`#WorkLogPrompts_MemberPlan_Yes`)).toBeChecked();
        } catch {
            await page.locator(`#WorkLogPrompts_MemberPlan_Yes`).check();
        }

        await waitUntilLoaded(page);

        // Save & Close System Options
        await page.getByRole(`button`, { name: `Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Create an Inpatient authorization (inline steps)
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

        // Optional Work Log (close if prompted)
        try {
            await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
            await page.getByRole('button', { name: ' Save and Close' }).click();
        } catch {
            await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
        }
        await waitUntilLoaded(page);

        //--------------------------------
        // Add a Bed Day (ICU)
        //--------------------------------
        await page.getByRole(`button`, { name: ` \xa0Bed Day` }).click();
        await waitUntilLoaded(page);

        // Requesting Bed Level dropdown
        await page.getByRole(`button`, { name: `expand combobox` }).nth(1).click();

        await page.getByText(`ICU`, { exact: true }).last().click();

        await waitUntilLoaded(page);

        // Increase requested units
        await page.getByRole(`button`, { name: `Increase value` }).click();


        await waitUntilLoaded(page);

        // Save & Close the Bed Day popup
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        // If a Work Log appears due to Bed Day creation, close it
        try {
            await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
            await waitUntilLoaded(page);
        } catch {
            // no-op if not prompted
        }


        //--------------------------------
        // Open the created Bed Day & add a Medical Review
        //--------------------------------
        // Scroll to Bed Days section
        await page.locator(`#lineitems-anchor`).getByText(`Bed Days`).scrollIntoViewIfNeeded();

        // Open the newly created Bed Day row
        await page.getByRole(`gridcell`, { name: `ICU` }).first().dblclick();
        await waitUntilLoaded(page);

        // Open Medical Reviews from Bed Day toolbar/menu
        await page
            .getByLabel(`Bed Day #`)
            .getByRole(`menuitem`, { name: `Medical Reviews` })
            .locator(`span`)
            .first()
            .click();

        await waitUntilLoaded(page);

        // Add new Medical Review
        await page.getByRole(`button`, { name: ` \xa0Medical Review` }).click();
        await waitUntilLoaded(page);

        // Medical Review From
        await page.locator(`input[name="mrdt_med_review_from_id_input"]`).fill(`Add AvailableField`);

        await page.getByText(`Add AvailableField`).last().click();

        await waitUntilLoaded(page);

        // Review Due date/time
        await page.locator(`#mrdt_due_date`).click();

        await page.locator(`#mrdt_due_date`).fill(formattedDate);

        await waitUntilLoaded(page);

        await page.locator(`#mrdt_due_date`).dblclick();

        await waitUntilLoaded(page);

        // Save & Close Medical Review (should trigger Work Log)
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Work Log: enter Time Spent and close
        //--------------------------------
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        await waitUntilLoaded(page);

        await page.locator(`#work_time_spent`).fill(incrementType);

        await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Open "Work Logs" tab and validate
        //--------------------------------
        await page.locator(`li >> div:text-is("Work Logs") >> nth=1`).click();

        await waitUntilLoaded(page);



        try {

        //--------------------------------
        // Assert:
        //--------------------------------
        // Verify that new Work Log is visible (token from your spec)
        await expect(page.locator(`:text("Medicall Consult")`).first()).toBeVisible();

        // Verify that the Medical Review record context is visible in grid
        await expect(page.getByRole(`gridcell`, { name: `Add AvailableField` })).toBeVisible();

        await waitUntilLoaded(page);

        // Back to All Auths (ensures we’re on a clean screen for cleanup)
        await page.getByRole('button', {name: ' All Auths'}).click();


    } finally {
        // --- Cleanup (always runs) ---
        try {
            await waitUntilLoaded(page);
            await cleanupTabOnMembersPage(page, {
                tab: 'Authorizations',
                gridId: '[id="authorizations-grid"]',
                memberName: lastFirstName,
                loginID: loginID,
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

})
});

 */















import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed, logIn3,
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











async function NewCleanupTabOnMembersPage(page, options = {}) {
    const tab = options.tab || `Compliance`;
    const gridId = options.gridId || `[id="compliance-grid"]`; // [`[id="authorizations-grid"]`, `[id="member-coverage-grid"]` ]
    const memberName = options.memberName || `Blackwell, Megan`;
    const memberId = options.memberId || ``;
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;

    //await waitUntilLoaded(page);

    if (!onScreen) {
        // Navigate to Home > Members
        await page.getByText(`Home`, { exact: true }).click();
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        // Fill search bar
        await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
        await page.keyboard.press("Enter");

        //await waitUntilLoaded(page);

        // Double click the member name row
        try {
            await page.getByRole(`gridcell`, { name: memberName }).dblclick();
            //await waitUntilLoaded(page);
        } catch {
            await page.getByRole(`gridcell`, { name: memberId }).dblclick();
            //await waitUntilLoaded(page);
        }

        // Navigate to tab on members page
        await page
            .getByLabel(memberName)
            .getByText(tab, { exact: true })
            .first()
            .click();
    }

    // Grab the count of rows visible that are created by our user
    let count = await page
        .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`)
        .count();

    //await waitUntilLoaded(page);

    for (let i = 0; i < count; i++) {
        // Hover the first row created by our user and click the trash icon
        await page
            .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`)
            .first()
            .hover();

        //await waitUntilLoaded(page);

        await page
            .locator(
                `${gridId} table tbody tr:visible:has-text("${loginID}") [title="Delete"]`,
            )
            .first()
            .click();

        //await waitUntilLoaded(page);

        // Click Yes button on the warning pop up
        await page.getByRole(`button`, { name: `Yes` }).click();
        //await waitUntilLoaded(page);
    }
}











test.describe('Work Log Prompt – Medical Consult via Bed Day & Medical Review', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = 'MedicallConsult';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            slowMo: 1000,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });

     */



    test('Work Log prompts on Medical Review save with time spent entry', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        const loginID = `MedicallConsult`;
        const lastFirstName = `Ayers, Ronald`;
        const authorizationType = `Inpatient`;
        const patientStatus = `Admitted`;
        const admitDate = dateFormat(today, 'MMddyyyyhhmmssaa');
        const authStatus = `In Progress`;
        const team = `Case Team`;
        const reviewer = `${loginID} Qaw`;
        const incrementType = `12`;
        const formattedDate = dateFormat(today, 'MM/dd/yyyy hh:mm:ss a');
        const tab = 'Authorizations';
        const gridId = '[id="authorizations-grid"]';



        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url,
            slowMo: 1000
        });




        await waitUntilLoaded(page);

        //--------------------------------
        // Act:
        //--------------------------------
        // Navigate to Tools > System Options
        await page.getByText(`Tools`).click();
        await page.getByText(`System Options`).click();

        // Click "Configuration" tab
        await page.getByText(`Configuration`, { exact: true }).click();

        // Scroll "Medical Consult" (Member Plan prompt) into view
        await page.locator(`#WorkLogPrompts_MemberPlan_Yes`).scrollIntoViewIfNeeded();

        try {
            // Ensure "Member Plan" Work Log prompt is ON
            await expect(page.locator(`#WorkLogPrompts_MemberPlan_Yes`)).toBeChecked();
        } catch {
            await page.locator(`#WorkLogPrompts_MemberPlan_Yes`).check();
        }

        //await waitUntilLoaded(page);

        // Save & Close System Options
        await page.getByRole(`button`, { name: `Save and Close` }).click();
       // await waitUntilLoaded(page);

        //--------------------------------
        // Create an Inpatient authorization (inline steps)
        //--------------------------------
        // Navigate to Home > Members
        await page.getByText('Home', { exact: true }).click();
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        // Search & open member
        await page.getByRole('textbox', { name: 'Search...' }).fill(lastFirstName);
        await page.keyboard.press('Enter');
        await page.getByRole('gridcell', { name: lastFirstName }).dblclick();
       // await waitUntilLoaded(page);

        // New Authorization (Inpatient)
        await page.locator('#authorizations-menu').click();
       // await waitUntilLoaded(page);

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
       // await waitUntilLoaded(page);
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
        //await waitUntilLoaded(page);

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
        //await waitUntilLoaded(page);

        // Optional Work Log (close if prompted)
        try {
            await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
            await page.getByRole('button', { name: ' Save and Close' }).click();
        } catch {
            await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
        }


        //await waitUntilLoaded(page);

        //--------------------------------
        // Add a Bed Day (ICU)
        //--------------------------------
        await page.getByRole(`button`, { name: ` \xa0Bed Day` }).click();
        await waitUntilLoaded(page);

        // Requesting Bed Level dropdown
        await page.getByRole(`button`, { name: `expand combobox` }).nth(1).click();

        await page.getByText(`ICU`, { exact: true }).last().click();

        //await waitUntilLoaded(page);

        // Increase requested units
        await page.getByRole(`button`, { name: `Increase value` }).click();


       // await waitUntilLoaded(page);

        // Save & Close the Bed Day popup
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        // If a Work Log appears due to Bed Day creation, close it
        try {
            await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
           // await waitUntilLoaded(page);
        } catch {
            // no-op if not prompted
        }


        //--------------------------------
        // Open the created Bed Day & add a Medical Review
        //--------------------------------
        // Scroll to Bed Days section
        await page.locator(`#lineitems-anchor`).getByText(`Bed Days`).scrollIntoViewIfNeeded();

        // Open the newly created Bed Day row
        await page.getByRole(`gridcell`, { name: `ICU` }).first().dblclick();
        //await waitUntilLoaded(page);

        // Open Medical Reviews from Bed Day toolbar/menu
        await page
            .getByLabel(`Bed Day #`)
            .getByRole(`menuitem`, { name: `Medical Reviews` })
            .locator(`span`)
            .first()
            .click();

        //await waitUntilLoaded(page);

        // Add new Medical Review
        await page.getByRole(`button`, { name: ` \xa0Medical Review` }).click();
       // await waitUntilLoaded(page);

        // Medical Review From
        await page.locator(`input[name="mrdt_med_review_from_id_input"]`).fill(`Add AvailableField`);

        await page.getByText(`Add AvailableField`).last().click();

        //await waitUntilLoaded(page);

        // Review Due date/time
        await page.locator(`#mrdt_due_date`).click();

        await page.locator(`#mrdt_due_date`).fill(formattedDate);

        //await waitUntilLoaded(page);

        await page.locator(`#mrdt_due_date`).dblclick();

        //await waitUntilLoaded(page);

        // Save & Close Medical Review (should trigger Work Log)
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // Work Log: enter Time Spent and close
        //--------------------------------
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        //await waitUntilLoaded(page);

        await page.locator(`#work_time_spent`).fill(incrementType);

       // await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
       // await waitUntilLoaded(page);

        //--------------------------------
        // Open "Work Logs" tab and validate
        //--------------------------------
        await page.locator(`li >> div:text-is("Work Logs") >> nth=1`).click();

        //await waitUntilLoaded(page);



        try {

            //--------------------------------
            // Assert:
            //--------------------------------
            // Verify that new Work Log is visible (token from your spec)
            await expect(page.locator(`:text("Medicall Consult")`).first()).toBeVisible();

            // Verify that the Medical Review record context is visible in grid
            await expect(page.getByRole(`gridcell`, { name: `Add AvailableField` })).toBeVisible();

            //await waitUntilLoaded(page);

            // Back to All Auths (ensures we’re on a clean screen for cleanup)
            await page.getByRole('button', {name: ' All Auths'}).click();


        } finally {
            // --- Cleanup (always runs) ---
            try {
                //await waitUntilLoaded(page);
                await NewCleanupTabOnMembersPage(page, {
                    tab: 'Authorizations',
                    gridId: '[id="authorizations-grid"]',
                    memberName: lastFirstName,
                    loginID: loginID,
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

    })
});
