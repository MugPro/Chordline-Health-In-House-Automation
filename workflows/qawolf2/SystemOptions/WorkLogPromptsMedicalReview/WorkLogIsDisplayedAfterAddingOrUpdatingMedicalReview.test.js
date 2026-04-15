// WorkLogPromptsMedicalReview.test.js
import { test, expect } from '@playwright/test';
import { format as dateFormat, addWeeks } from 'date-fns';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
    createAuthorizationForMember,
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

test.describe('Work Log Prompt – Authorizations: Medical Review', () => {
    let browser, context, page;

    test.beforeEach(async () => {
        const loginID = 'WorkLogPDAUMedRev';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            // Use password if your environment requires it; omit to follow your snippet exactly:
            // password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });

    test.afterEach(async () => {
        await context?.close();
        await browser?.close();
    });

    test('Work Log prompts after adding and editing a Medical Review', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const now = new Date();
        const week = addWeeks(now, 1);

        const loginID = `WorkLogPDAUMedRev`;
        const lastFirstName = `Bannister, Robert`;
        const authorizationType = `Inpatient`;
        const team = `Case Team`;
        const reviewer = `${loginID} Qaw`;
        const patientStatus = `Admitted`;

        // Note: Using formats exactly as provided in your data
        const admitDate = dateFormat(now, 'MM dd yyyy hh mm ss aa');
        const weekDate = dateFormat(week, 'MM dd yyyy hh mm ss aa');
        const weekDateFormat = dateFormat(week, 'MM/dd/yyyy hh:mm:ss aa');

        const authStatus = `In Progress`;
        const bedLevel = `ICU`;
        const medRevForm = `Bed Day`;
        const medRevSum = `Updated Medical Review ${Date.now()}`;

        const tab = `Authorizations`;
        const gridId = `[id="authorizations-grid"]`;

        //--------------------------------
        // Pre-cleanup
        //--------------------------------

        await waitUntilLoaded(page);

        try {
            await cleanupTabOnMembersPage(page, {
                tab,
                gridId,
                memberName: lastFirstName,
                loginID,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupTabOnMembersPage',
                errorMsg: e.message,
            });
        }

        //--------------------------------
        // Act:
        //--------------------------------
        // Navigate to Tools > System Options
        await page.getByText(`Tools`).click();
        await page.getByText(`System Options`).click();

        // Click "Configuration" tab
        await page.getByText(`Configuration`, { exact: true }).click();

        // Scroll "Work Log Prompts" into view
        await page.getByText(`Work Log Prompts`).scrollIntoViewIfNeeded();

        try {
            // Ensure Authorizations: Medical Review prompt is ON
            await expect(page.locator(`#WorkLogPrompts_MedicalReview_Yes`)).toBeChecked();
        } catch {
            await page.locator(`#WorkLogPrompts_MedicalReview_Yes`).check();
        }

        await waitUntilLoaded(page);

        // Save and Close
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
        // Add a Bed Day
        //--------------------------------
        await page.getByRole(`button`, { name: ` \xa0Bed Day` }).click();
        await waitUntilLoaded(page);

        // Requested Bed Level: ICU
        await page.locator(`input[name="auli_requested_bed_level_input"]`).fill(bedLevel);
        await page.getByRole(`option`, { name: bedLevel, exact: true }).click();

        // Requested Units: 1
        await page.getByRole(`spinbutton`).click();
        await page.keyboard.press(`1`);

        // Save Bed Day
        await page.getByRole(`button`, { name: ` Save`, exact: true }).click();
        await waitUntilLoaded(page);

        // Work Log opens due to Bed Day creation → Close it
        try {
            await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
            await waitUntilLoaded(page);
        } catch {
            // no-op if not visible
        }

        // Verify that the "Bed Days #" popup is visible
        await expect(page.getByText(`Bed Days #`)).toBeVisible();

        //--------------------------------
        // Add a Medical Review
        //--------------------------------
        await page.getByRole(`button`, { name: ` \xa0Medical Review` }).click();
        await waitUntilLoaded(page);

        // Verify "New Medical Reviews" is visible
        await expect(page.getByText(`New Medical Reviews`)).toBeVisible();

        // Medical Review Form = Bed Day
        await page.locator(`input[name="mrdt_med_review_from_id_input"]`).fill(medRevForm);
        await page.getByRole(`option`, { name: medRevForm }).locator(`span`).click();

        // Review Due = next week, using provided formatting string
        await page.locator(`#mrdt_due_date`).click();
        await page.locator(`#mrdt_due_date`).clear();
        await page.locator(`#mrdt_due_date`).pressSequentially(weekDate);

        // Save & Close Medical Review → triggers Work Log
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: New Work Log visible after adding Medical Review
        //--------------------------------
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        // Capture Work Log "Activity Date/Time"
        const workLogActDate = await page.locator(`#work_activity_date`).evaluate(e => e.value);

        // Close Work Log
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Open Medical Review to edit via shortcut
        //--------------------------------
        await page.locator(`[id="shortcuts"] [data-value="medicalreviews-anchor"]:visible`).click();

        // Double click the Medical Review row by user & due date (weekDateFormat)
        await page
            .locator(
                `[id="medicalreviews-child-grid"] table tbody tr:has-text("${loginID}"):has-text("${weekDateFormat}")`
            )
            .dblclick();
        await waitUntilLoaded(page);

        // Verify "Medical Review #" is visible
        await expect(page.getByText(`Medical Review #`)).toBeVisible();

        // Edit Medical Review
        await page.getByLabel(`Medical Review #`).getByRole(`button`, { name: ` Edit` }).click();
        await waitUntilLoaded(page);

        // Fill "Medical Review Summary" in the iframe editor
        const frame = page
            .frameLocator(`[id="record-div"] [title="Editable area. Press F10 for toolbar."]`)
            .first();
        await frame.locator(`#mrdt_summary`).fill(medRevSum);

        // Click anchor to enable Save
        await page.locator(`#medicalreview-anchor`).getByText(`Medical Review`).click();

        // Save & Close edit
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        // Assert Work Log appears after updating Medical Review
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        // Close the Work Log
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Cleanup:
        //--------------------------------
        // All Auths
        await page.getByRole(`button`, { name: ` All Auths` }).click();

        await waitUntilLoaded(page);

        try {
            await cleanupTabOnMembersPage(page, {
                tab,
                gridId,
                memberName: lastFirstName,
                loginID,
                onScreen: true,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupTabOnMembersPage',
                errorMsg: e.message,
            });
        }
    });
});