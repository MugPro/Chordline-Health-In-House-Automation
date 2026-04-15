// WorkLogPromptsCompliance.test.js
import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
    createComplianceForMember,
} from '../../../../helpers/Node20Helpers.js';

// Optional transient dialog handler (kept for parity with other tests)
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

test.describe('Work Log Prompt – Compliance Appeal', () => {
    let browser, context, page;

    test.beforeEach(async () => {
        const loginID = `WorkLogPCDAA`;

        // Intentionally logging in without password to follow the provided data pattern
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
        }));
    });

    test.afterEach(async () => {
        await context?.close();
        await browser?.close();
    });

    test('Work Log prompts on Compliance Appeal Create & Edit', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `WorkLogPCDAA`;
        const memberName = `Chin, Huang`;
        const complianceType = `Appeal`;
        const team = `Compliance Team`;
        const appealType = `Claims Appeal`;
        const appealCategory = `DMR`;
        const level = `First Level`;
        const priority = `Concurrent`;
        const dueDateExtensionType = `None`;
        const appealReason = `Edit for worklog to appear ${Date.now()}`;
        const tab = `Compliance`;
        const gridId = `[id="compliance-grid"]`;

        //--------------------------------
        // Pre-cleanup on Compliance tab
        //--------------------------------
        try {
            await cleanupTabOnMembersPage(page, {
                tab,
                gridId,
                memberName,
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
        // System Options: ensure WorkLogPrompts_Compliance = Yes
        await page.getByText(`Tools`).click();
        await page.getByText(`System Options`).click();

        await page.getByText(`Configuration`, { exact: true }).click();
        await page.getByText(`Work Log Prompts`).scrollIntoViewIfNeeded();

        try {
            await expect(page.locator(`#WorkLogPrompts_Compliance_Yes`)).toBeChecked();
        } catch {
            await page.locator(`#WorkLogPrompts_Compliance_Yes`).check();
        }

        await page.getByRole(`button`, { name: `Save and Close` }).click();
        await waitUntilLoaded(page);

        // Create a Compliance Appeal for member and grab first work log activity date
        const { worklogActivityDate } = await createComplianceForMember(page, {
            memberName,
            complianceType,
            team,
            appealType,
            appealCategory,
            level,
            priority,
            dueDateExtensionType,
        });

        //--------------------------------
        // Edit the appeal to trigger a second Work Log
        //--------------------------------
        await page.getByRole(`button`, { name: ` Edit` }).click();
        await waitUntilLoaded(page);

        // Enter "Reason for Appeal" in the editor
        const frame = page.frameLocator(`[title="Editable area. Press F10 for toolbar."]`).first();
        await frame.locator(`#cpch_reason`).fill(appealReason);

        // Enable Save button by changing to a stable anchor section
        await page.locator(`#appeal-anchor`).getByText(`Appeal`).click();

        // Save and wait for Work Log prompt
        await page.getByRole(`button`, { name: ` Save` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: "New Work Log" appears on edit
        //--------------------------------
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        // Capture second work log activity date
        const worklogActivityDate2 = await page
            .locator(`#work_activity_date`)
            .evaluate(e => e.value);

        // Save and close Work Log
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate to Work Logs via shortcut and validate entries
        //--------------------------------
        await page
            .locator(`[id="shortcuts-div"] [data-value="worklogs-anchor"]:visible`)
            .click();

        await page
            .locator(`[placeholder="Search..."]:visible`)
            .first()
            .fill(`${loginID} Qaw`);
        await page.keyboard.press(`Enter`);

        // Expect exactly two work logs created by this user
        await expect(
            page.locator(`#worklogs-child-grid table tbody tr:visible`)
        ).toHaveCount(2);

        // Verify both work logs (create + edit) exist by their captured activity dates
        await expect(
            page.locator(
                `#worklogs-child-grid table tbody tr:visible:has-text("${worklogActivityDate}")`
            )
        ).toBeVisible();

        await expect(
            page.locator(
                `#worklogs-child-grid table tbody tr:visible:has-text("${worklogActivityDate2}")`
            )
        ).toBeVisible();

        //--------------------------------
        // Cleanup:
        //--------------------------------
        await page.getByRole(`button`, { name: ` All Compliance` }).click();

        try {
            await cleanupTabOnMembersPage(page, {
                tab,
                gridId,
                memberName,
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