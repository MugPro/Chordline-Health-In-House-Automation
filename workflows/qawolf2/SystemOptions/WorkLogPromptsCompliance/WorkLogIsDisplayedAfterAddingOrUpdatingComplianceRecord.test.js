
/*

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

 */















import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
    createComplianceForMember, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

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








async function NewCleanupTabOnMembersPage(page, options = {}) {
    const tab = options.tab || `Compliance`;
    const gridId = options.gridId || `[id="compliance-grid"]`; // [`[id="authorizations-grid"]`, `[id="member-coverage-grid"]` ]
    const memberName = options.memberName || `Blackwell, Megan`;
    const memberId = options.memberId || ``;
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;
    const userName  = options.userName;

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
        .locator(`${gridId} table tbody tr:visible:has-text("${userName}")`)
        .count();

    //await waitUntilLoaded(page);

    for (let i = 0; i < count; i++) {
        // Hover the first row created by our user and click the trash icon
        await page
            .locator(`${gridId} table tbody tr:visible:has-text("${userName}")`)
            .first()
            .hover();

        //await waitUntilLoaded(page);

        await page
            .locator(
                `${gridId} table tbody tr:visible:has-text("${userName}") [title="Delete"]`,
            )
            .first()
            .click();

        //await waitUntilLoaded(page);

        // Click Yes button on the warning pop up
        await page.getByRole(`button`, { name: `Yes` }).click();
        //await waitUntilLoaded(page);
    }
}












async function NewCreateComplianceForMember(page, options = {}) {
    const memberName = options.memberName || `Chin, Huang`;
    const complianceType = options.complianceType || `Appeal`; // ["Appeal", "Grievance"]
    const team = options.team || `Compliance Team`; // ["Case Team", "Compliance Team", "MD Team", "Review Team", "UM Team"]
    const appealType = options.appealType || `Claims Appeal`; // ["Claims Appeal", "Denial Appeal"]
    const appealCategory = options.appealCategory || `DMR`; // ["DMR", "DMR Reconsideration", "NCP Claim", "NCP Reconsideration", "PTS Determination", "PTS Reconsideration"]
    const level = options.level || `First Level`; // ["First Level", "Fourth Level", "Judicial Review", "Second Level", "Third Level"]
    const priority = options.priority || `Concurrent`; // ["Concurrent", "PTS-expedited", "PTS-Standard", "Retro"]
    const dueDateExtensionType = options.dueDateExtensionType || `None`; // ["Extension", "None", "Tolled"]
    let worklogActivityDate = `No worklog appeared please check system configurations > Worklogs`;

    // Navigate to Home > Members
    await page.getByText(`Home`, { exact: true }).click();
    await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

    // Search for member
    await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
    await page.keyboard.press("Enter");

    // Double click {memberName} to open member page
    await page.getByRole(`gridcell`, { name: memberName }).dblclick();
    //await waitUntilLoaded(page);

    // Click the "Compliance" tab
    await page
        .getByLabel(memberName)
        .getByText(`Compliance`, { exact: true })
        .first()
        .click();

    // Hover the "+ Compliance" button
    await page
        .getByRole(`button`)
        .filter({ hasText: `Compliance Appeal Grievance` })
        .hover();
    await page
        .getByRole(`menuitem`, { name: complianceType, exact: true })
        .locator(`a`)
        .click();

    // Fill in Team and select option
    await page.locator(`input[name="cpch_team_reference_id_input"]`).fill(team);
    await page
        .getByRole(`option`, { name: team, exact: true })
        .locator(`span`)
        .click();

    // Fill in Appeal Type and select option
    await page.locator(`input[name="cpch_type_input"]`).fill(appealType);
    await page
        .getByRole(`option`, { name: appealType, exact: true })
        .locator(`span`)
        .click();

    // Fill in Appeal Category
    await page
        .locator(`input[name="cpch_appeal_category_input"]`)
        .fill(appealCategory);
    await page
        .getByRole(`option`, { name: appealCategory, exact: true })
        .locator(`span`)
        .click();

    // Appeal Status should default to Open
    // Opened Date should be date of creation

    // Fill in level and select option
    await page.locator(`input[name="cpch_level_input"]`).fill(level);
    await page
        .getByRole(`option`, { name: level, exact: true })
        .locator(`span`)
        .click();

    // Fill Priority and select option
    await page.locator(`input[name="cpch_priority_input"]`).fill(priority);
    await page
        .getByRole(`option`, { name: priority, exact: true })
        .locator(`span`)
        .click();

    // Toggle on "Due Date Extention Type" radio button
    await page.getByRole(`radio`, { name: dueDateExtensionType }).click();

    // TODO: If needed
    // // Get iframe locator
    // const frame = page.frameLocator(`[title="Editable area. Press F10 for toolbar."]`).first();

    // // Fill in the "Reason for Appeal"
    // await frame.locator(`[id="cpch_reason"]`).fill(`Test`)

    // Click "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();
    //await waitUntilLoaded(page);

    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
        // Grab the work activity date of the work log
        worklogActivityDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible({
            timeout: 3000,
        });
    }

    const appealNum = await page.getByText(`Appeal #`).innerText();
    return { appealNum, worklogActivityDate };
}















test.describe('Work Log Prompt – Compliance Appeal', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = `WorkLogPCDAA`;

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url,
            slowMo: 700,
        });

    });

     */



    test('Work Log prompts on Compliance Appeal Create & Edit', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
       // const loginID = `WorkLogPCDAA`;
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

        const userName = 't2F t2L';



        //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        const loginID = 'LoginIdTest1';
        const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url,
            slowMo: 700
        });




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
        //await waitUntilLoaded(page);

        // Create a Compliance Appeal for member and grab first work log activity date
        const { worklogActivityDate } = await NewCreateComplianceForMember(page, {
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
        //await waitUntilLoaded(page);

        // Enter "Reason for Appeal" in the editor
        const frame = page.frameLocator(`[title="Editable area. Press F10 for toolbar."]`).first();
        await frame.locator(`#cpch_reason`).fill(appealReason);

        // Enable Save button by changing to a stable anchor section
        await page.locator(`#appeal-anchor`).getByText(`Appeal`).click();

        // Save and wait for Work Log prompt
        await page.getByRole(`button`, { name: ` Save` }).click();
        //await waitUntilLoaded(page);

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
        //await waitUntilLoaded(page);

        //--------------------------------
        // Navigate to Work Logs via shortcut and validate entries
        //--------------------------------
        await page
            .locator(`[id="shortcuts-div"] [data-value="worklogs-anchor"]:visible`)
            .click();

        await page
            .locator(`[placeholder="Search..."]:visible`)
            .first()
            //.fill(`${loginID} Qaw`);
            .fill(userName);
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
            await NewCleanupTabOnMembersPage(page, {
                tab,
                gridId,
                memberName,
                loginID,
                userName,
                onScreen: true,
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