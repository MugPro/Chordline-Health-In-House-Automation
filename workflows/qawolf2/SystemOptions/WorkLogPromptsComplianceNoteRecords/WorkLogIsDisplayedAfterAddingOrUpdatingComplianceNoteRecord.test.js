// WorkLogPromptsComplianceNoteRecords.test.js
import { test, expect } from '@playwright/test';
import { format as dateFormat } from 'date-fns';
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

test.describe('Work Log Prompt – Compliance Note Records', () => {
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



    test('Work Log appears with correct fields after creating Compliance Appeal (Note Records)', async () => {
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

        // Scroll "Authorization Configuration" into view
        await page.getByText(`Authorization Configuration`).scrollIntoViewIfNeeded();

        try {
            // Verify that "Compliance Note" prompt is set to "Yes"
            await expect(page.locator(`#WorkLogPrompts_Compliance_Note_Yes`)).toBeChecked();
        } catch {
            // Toggle "Yes"
            await page.locator(`#WorkLogPrompts_Compliance_Note_Yes`).check();
        }

        // Save system option
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

        // Click `Compliance` tab for the member
        await page
            .getByLabel(lastFirstName)
            .getByText(`Compliance`, { exact: true })
            .first()
            .click();

        // Click `+ Compliance` button (menu opens: Compliance Appeal Grievance)
        await page
            .getByRole(`button`)
            .filter({ hasText: `Compliance Appeal Grievance` })
            .click();

        // Click `Appeal`
        await page.getByRole(`menuitem`, { name: `Appeal` }).locator(`a`).click();

        await waitUntilLoaded(page);

        // Click `Team` input button, then select "Case Team"
        await page.locator(`span > .k-input > .k-input-button`).first().click();
        await page.getByRole(`option`, { name: `Case Team` }).click();

        // Click `Reviewer` (user lookup) input button, then pick "Aman Yadav"
        await page.locator(`[data-table-code="USER"] [type="button"]`).first().click();
        await page.getByRole(`option`, { name: `Aman Yadav` }).click();

        // Appeal Category: NCP Claim
        await page.locator(`input[name="cpch_appeal_category_input"]`).fill(`NCP Claim`);
        await page.getByRole(`option`, { name: `NCP Claim` }).locator(`span`).click();

        // Level: First Level
        await page.locator(`input[name="cpch_level_input"]`).fill(`First Level`);
        await page.getByRole(`option`, { name: `First Level` }).locator(`span`).click();

        // Appeal Type: Claims Appeal
        await page.locator(`input[name="cpch_type_input"]`).fill(`Claims Appeal`);
        await page.getByRole(`option`, { name: `Claims Appeal` }).locator(`span`).click();

        // Priority: Retro
        await page.locator(`input[name="cpch_priority_input"]`).fill(`Retro`);
        await page.getByRole(`option`, { name: `Retro` }).locator(`span`).click();

        // Save the Compliance Appeal to trigger Work Log prompt
        await page.getByRole(`button`, { name: ` Save` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert:
        //--------------------------------
        // Ensure Work Log modal is visible before asserting fields
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        // "Completed By" should be the current user display name
        await expect(page.locator(`input[name="work_completed_by_input"]`)).toHaveValue(userName);

        // Activity Date/Time should start with today's date (MM/dd/yyyy)
        const activityDateValue = await page.locator('input[name="work_activity_date"]').inputValue();
        expect(activityDateValue.startsWith(formattedDate)).toBe(true);

        // Verify Health Plan label/text in the work log
        await expect(
            page.getByLabel(`New Work Log`).getByText(`Wonderful Health Plan`)
        ).toBeVisible();

        await waitUntilLoaded(page);

        // Save & Close the Work Log
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);




        /*

        // Open Work Logs via the shortcut (more robust selector)
        await page.locator(`[id="shortcuts-div"] [data-value="worklogs-anchor"]:visible`).click();

        // Verify the user's name is visible in work logs (row rendered)
        //await expect(page.locator(`#worklogs-child-grid`)).toBeVisible();
        await expect(page.locator(`#worklogs-child-grid`)).toContainText(userName);

        // Verify Activity Type is "No" (per spec)
        await expect(page.getByRole(`gridcell`, { name: `No` })).toBeVisible();

         */







        // Open Work Logs via the shortcut
        await page.locator(`[id="shortcuts-div"] [data-value="worklogs-anchor"]:visible`).click();
        await waitUntilLoaded(page);

// Narrow to the Compliance (CPCH) Work Logs grid specifically
        const complianceWorklogsGrid = page.locator(
            `#worklogs-child-grid[data-parent-table-code="CPCH"]`
        );

// Ensure the Compliance work logs grid is visible
        await expect(complianceWorklogsGrid).toBeVisible();

        /*
// (Optional but recommended) Filter the grid by user to avoid flakiness if other logs exist
        const visibleSearch = complianceWorklogsGrid.locator(`[placeholder="Search..."]:visible`).first();
        await visibleSearch.fill(userName);
        await page.keyboard.press('Enter');

         */

// Verify the user's name is present in the compliance work logs grid
        await expect(complianceWorklogsGrid).toContainText(userName);

// Verify Activity Type is "No" within the same grid
        await expect(
            complianceWorklogsGrid.getByRole(`gridcell`, { name: `No` })
        ).toBeVisible();





        await waitUntilLoaded(page);
        //--------------------------------
        // Cleanup:
        //--------------------------------
        // Go back to Authorizations
        await page.getByText(`Authorizations`).nth(2).click();
        await page.getByRole(`button`, { name: ` All Auths` }).click();

        try {
            await cleanupTabOnMembersPage(page, {
                tab,
                memberName: lastFirstName,
                loginID: 'WorkLog Prompts',
                gridId,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupTabOnMembersPage',
                errorMsg: e.message,
            });
        }

        await browser.close();

    });
});