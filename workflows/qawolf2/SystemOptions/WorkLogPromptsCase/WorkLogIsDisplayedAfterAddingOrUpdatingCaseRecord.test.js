// WorkLogPromptsCase.test.js
import { test, expect } from '@playwright/test';
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

test.describe('Work Log Prompt – Case Record', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = `WorkLogPCase`;

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

    test('Work Log prompts on Case Save & Case Edit', async () => {

        //--------------------------------
        // Arrange:
        //--------------------------------
        //const loginID = `WorkLogPCase`;
        const memberName = `Dillon, Rebecca`;
        const enrollRestrictions = `Updating case record ${Date.now()}`;
        const tab = `Case`;
        const gridId = `[id="member-case-grid"]`;


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


        //--------------------------------
        // Act:
        //--------------------------------

        // System Options: WorkLogPrompts Case = Yes
        await page.getByText(`Tools`).click();
        await page.getByText(`System Options`).click();

        await page.getByText(`Configuration`, { exact: true }).click();
        await page.getByText(`Work Log Prompts`).scrollIntoViewIfNeeded();

        try {
            await expect(page.locator(`#WorkLogPrompts_Case_Yes`)).toBeChecked();
        } catch {
            await page.locator(`#WorkLogPrompts_Case_Yes`).check();
        }

        await page.getByRole(`button`, { name: `Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate: Home > Members
        //--------------------------------
        await page.getByText(`Home`, { exact: true }).click();
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
        await page.keyboard.press("Enter");

        await page.getByRole(`gridcell`, { name: memberName }).dblclick();
        await waitUntilLoaded(page);

        //--------------------------------
        // Create new Case
        //--------------------------------
        await page.getByText(`Case`, { exact: true }).first().click();
        await page.getByRole(`button`, { name: ` Case` }).click();

        // Program, Case Manager, Status, Status Date should already be filled

        await page.getByRole(`button`, { name: ` Save` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Work Log pops up (Case Create)
        //--------------------------------
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        const workActDate = await page.locator(`#work_activity_date`).evaluate(e => e.value);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Edit Case and trigger another Work Log
        //--------------------------------
        await page.getByRole(`button`, { name: ` Edit` }).click();
        await waitUntilLoaded(page);

        const frame = page.frameLocator(`[title="Editable area. Press F10 for toolbar."]`).first();

        await frame
            .locator(`#case_enrollment_restrictions`)
            .fill(enrollRestrictions);

        // Enable Save button
        await page.locator(`#consent-anchor`).getByText(`Consent`).click();

        await page.getByRole(`button`, { name: ` Save` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: New Work Log pops up (Case Update)
        //--------------------------------
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        const workActDate2 = await page.locator(`#work_activity_date`).evaluate(e => e.value);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate to Work Logs
        //--------------------------------
        await page
            .locator(`[id="shortcuts-div"] [data-value="worklogs-anchor"]:visible`)
            .click();

        await page
            .locator(`[placeholder="Search..."]:visible`)
            .first()
            .fill(`${loginID} Qaw`);

        await page.keyboard.press(`Enter`);

        //--------------------------------
        // Assert: TWO work logs created by the user
        //--------------------------------
        await expect(
            page.locator(`#worklogs-child-grid table tbody tr:visible`)
        ).toHaveCount(2);

        await expect(
            page.locator(
                `#worklogs-child-grid table tbody tr:visible:has-text("${workActDate}")`
            )
        ).toBeVisible();

        await expect(
            page.locator(
                `#worklogs-child-grid table tbody tr:visible:has-text("${workActDate2}")`
            )
        ).toBeVisible();

        //--------------------------------
        // Cleanup:
        //--------------------------------
        await page.getByRole(`button`, { name: ` All Cases` }).click();

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
                dedupKey: "cleanupTabOnMembersPage",
                errorMsg: e.message,
            });
        }

    });
});