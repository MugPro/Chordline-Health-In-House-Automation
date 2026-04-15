// WorkLogPromptsNoteRecords.test.js
import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    reportCleanupFailed,
    cleanupNotesFromMember,
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

test.describe('Work Log Prompt – Member Detail: Note Records', () => {
    let browser, context, page;

    test.beforeEach(async () => {
        const loginID = 'WorkLogPNoteRec';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });

    test.afterEach(async () => {
        await context?.close();
        await browser?.close();
    });

    test('Work Logs appear on Note create and edit', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `WorkLogPNoteRec`;
        const memberName = `Dillinger, James`;
        const status1 = `Pending`; // ["Closed", "Completed", "Pending"]
        const reason = `Member Activity`; // ["Member Activity", "Member Question", "Provider Question"]
        const noteSummary = `Note Record Created ${Date.now()}`;
        const noteSummaryEdit = `Note Record Edited ${Date.now()}`;

        //--------------------------------
        // Pre-cleanup (remove existing notes & related worklogs by this user)
        //--------------------------------
        try {
            await cleanupNotesFromMember(page, {
                loginID,
                memberName,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupNotesFromMember',
                errorMsg: e.message,
            });
        }

        //--------------------------------
        // Act:
        //--------------------------------
        // Navigate to Tools > System Options
        await page.getByText('Tools').click();
        await page.getByText('System Options').click();

        // Configuration
        await page.getByText('Configuration', { exact: true }).click();

        // Scroll into view: Work Log Prompts
        await page.getByText('Work Log Prompts').scrollIntoViewIfNeeded();

        // Ensure "Member Detail: Note Records" prompt is ON
        try {
            await expect(page.locator('#WorkLogPrompts_Note_Yes')).toBeChecked();
        } catch {
            await page.locator('#WorkLogPrompts_Note_Yes').check();
        }

        await waitUntilLoaded(page);
        // Save & Close System Options
        await page.getByRole('button', { name: 'Save and Close' }).click();
        await waitUntilLoaded(page);

        // Navigate to Home > Members
        await page.getByText('Home', { exact: true }).click();

        await waitUntilLoaded(page);

        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await waitUntilLoaded(page);

        // Search & open member details
        await page.getByRole('textbox', { name: 'Search...' }).fill(memberName);

        await waitUntilLoaded(page);

        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        await page.getByRole('gridcell', { name: memberName }).dblclick();
        await waitUntilLoaded(page);

        // Go to Notes via shortcut
        await page.locator('[id="shortcuts"] [data-value="notes-anchor"]').click();

        await waitUntilLoaded(page);

        // + Note
        await page.getByRole('button', { name: ' \xa0Note' }).click();

        await waitUntilLoaded(page);

        // Verify "New Notes" modal visible
        await expect(page.getByText('New Notes')).toBeVisible();

        await waitUntilLoaded(page);

        // Status
        await page.locator('input[name="note_status_id_input"]').fill(status1);

        await waitUntilLoaded(page);

        await page.getByRole('option', { name: status1 }).click();

        // Reason
        await page.locator('input[name="note_reason_id_input"]').fill(reason);

        await waitUntilLoaded(page);

        await page.getByRole('option', { name: reason }).click();

        await waitUntilLoaded(page);

        // Note Summary (iframe)
        const createFrame = page
            .frameLocator('[title="Editable area. Press F10 for toolbar."]')
            .first();
        await createFrame.locator('#note_detail').fill(noteSummary);

        await waitUntilLoaded(page);

        // Save & Close Note (should trigger Work Log)
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Work Log after create
        //--------------------------------
        await expect(page.getByText('New Work Log')).toBeVisible();

        await waitUntilLoaded(page);

        // capture WL timestamp
        const workActDate = await page.locator('#work_activity_date').evaluate(e => e.value);

        await waitUntilLoaded(page);

        // Close WL
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Open the created Note & Edit summary
        //--------------------------------
        // Filter by user in Notes list
        await page
            .locator('#notes-anchor')
            .getByRole('textbox', { name: 'Search...' })
            .fill(`${loginID} Qaw`);
        await waitUntilLoaded(page);
        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        // Double click the row containing noteSummary + loginID
        await page
            .locator(
                `[id="notes-child-grid"] table tbody tr:has-text("${noteSummary}"):has-text("${loginID}")`
            )
            .dblclick();
        await waitUntilLoaded(page);

        // Edit Note
        await page.getByLabel('Note #').getByRole('button', { name: ' Edit' }).click();
        await waitUntilLoaded(page);

        // Re-acquire the edit frame (modal content may refresh)
        const editFrame = page
            .frameLocator('[title="Editable area. Press F10 for toolbar."]')
            .first();
        await editFrame.locator('#note_detail').fill(noteSummaryEdit);

        await waitUntilLoaded(page);

        // Click anchor to enable Save button
        await page
            .getByLabel('Note #')
            .locator('#nextactions-anchor')
            .getByText('Next Actions')
            .click();

        await waitUntilLoaded(page);

        // Save & Close edit (should trigger Work Log)
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Work Log after edit
        //--------------------------------
        await expect(page.getByText('New Work Log')).toBeVisible();

        await waitUntilLoaded(page);

        // capture WL timestamp
        const workActDate2 = await page.locator('#work_activity_date').evaluate(e => e.value);

        await waitUntilLoaded(page);

        // Close WL
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Verify on Home > Work Logs
        //--------------------------------
        await page.getByText('Home', { exact: true }).click();

        await waitUntilLoaded(page);

        await page.getByRole('tab', { name: 'Work Logs' }).locator('span').click();

        await waitUntilLoaded(page);

        await page.getByRole('textbox', { name: 'Search...' }).fill(loginID);

        await waitUntilLoaded(page);

        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        // Expect exactly two WLs for this user
        await expect(
            page.locator('[id="worklogs-grid"] table tbody tr:visible')
        ).toHaveCount(2);

        // Match by Activity Date/Time values
        await expect(
            page.locator(
                `[id="worklogs-grid"] table tbody tr:visible:has-text("${workActDate}")`
            )
        ).toBeVisible();

        await expect(
            page.locator(
                `[id="worklogs-grid"] table tbody tr:visible:has-text("${workActDate2}")`
            )
        ).toBeVisible();

        await waitUntilLoaded(page);
        //--------------------------------
        // Cleanup:
        //--------------------------------
        await page.locator('#member-tab-name').click()

        await waitUntilLoaded(page);

        try {
            await cleanupNotesFromMember(page, {
                onMemberPage: true,
                loginID,
                memberName,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupNotesFromMember',
                errorMsg: e.message,
            });
        }
    });
});