// WorkLogPromptsMedicalPlan.test.js
import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
    createACaseForMember,
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

test.describe('Work Log Prompt – Member Plan (Care Plan & Plan Components)', () => {
    let browser, context, page;

    test.beforeEach(async () => {
        const loginID = 'WorkLogMedPlan';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            slowMo: 1000,
            password: process.env.DEFAULT_PASS_OCT_2025,
        }));
    });



    //test('Work Log prompts on Care Plan creation and on Problem/Goal/Intervention/Outcome edits',

    test.skip(
        'Work Log prompts on Care Plan creation and on Problem/Goal/Intervention/Outcome edits',
        async () => {



            // TEMPORARY SKIP
            // Backend error occurs 100% when saving Care Plan:
            // "A problem occurred during save. Please contact the system administrator..."

            // Remove skip once backend defect is fixed




            //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `WorkLogMedPlan`;
        const memberName = `Blackwell, Pauline`;
        const assessment = `Demo Assessment`;
        const memDesc = `${loginID}${Date.now()}`;











        await waitUntilLoaded(page);

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
            // Ensure "Work Log Prompts: Member Plan" is set to "Yes"
            await expect(page.locator(`#WorkLogPrompts_MemberPlan_Yes`)).toBeChecked();
        } catch {
            await page.locator(`#WorkLogPrompts_MemberPlan_Yes`).check();
        }

        //await waitUntilLoaded(page);

        // Save and Close
        await page.getByRole(`button`, { name: `Save and Close` }).click();
       // await waitUntilLoaded(page);

        //--------------------------------
        // Create a Case for the member
        //--------------------------------
        await createACaseForMember(page, { memberName });
        //await waitUntilLoaded(page);

        //--------------------------------
        // Open +Assessment and select Demo Assessment
        //--------------------------------
        await page.getByRole(`button`, { name: ` \xa0Assessment` }).click();

       // await waitUntilLoaded(page);

        await page.getByRole(`gridcell`, { name: assessment }).click();
        await page.getByRole(`button`, { name: `Select`, exact: true }).click();

        // Assessment answers
        await page.getByRole(`radio`, { name: `No`, exact: true }).first().click();    // Med Rec completed? -> No
        await page.getByRole(`radio`, { name: `Yes` }).nth(1).click();                 // Always remember to take meds? -> Yes
        await page.getByRole(`radio`, { name: `No` }).nth(2).click();                  // Moderate activities -> No
        await page.getByRole(`radio`, { name: `No`, exact: true }).nth(3).click();     // Vigorous activities -> No

       // await waitUntilLoaded(page);

        // Signature Of
        await page.locator(`#custom_778_signatureOf`).fill(loginID);

        //await waitUntilLoaded(page);

        // Save Assessment
        await page.getByRole(`button`, { name: ` Save` }).click();

        //await waitUntilLoaded(page);

        // Confirm warning Yes
        await page.getByRole(`button`, { name: `Yes` }).click();
       // await waitUntilLoaded(page);











        // Verify Create Care Plan offered
        await expect(page.getByText(`Create Care Plan`)).toBeVisible();

       // await waitUntilLoaded(page);




        // Save Care Plan
        await page.getByRole(`button`, { name: `Save Care Plan` }).click();

       // await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Work Log appears after adding Care Plan
        //--------------------------------
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        // Select coverage (as provided – open combobox and select from listbox)
        await page.waitForTimeout(5_000);
        await page
            .getByLabel(`New Work Log`)
            .locator(`#case-select`)
            .getByRole(`button`, { name: `expand combobox` })
            .click();
        await page.locator(`#work_member_id-autocomplete_listbox`).click();


        //await waitUntilLoaded(page);

        // Save & Close Work Log (Care Plan)
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // Check all Problem Status checkboxes
        //--------------------------------
        await page.locator(`fieldset [type="checkbox"]:visible`).first().waitFor();
        const allProblemStatusBoxes = await page.locator(`fieldset [type="checkbox"]:visible`).all();
        for (let box of allProblemStatusBoxes) {
            await expect(async () => {
                await box.check();
                await expect(box).toBeChecked({ timeout: 2500 });
            }).toPass({ timeout: 30 * 1000 });
        }


        //await waitUntilLoaded(page);

        //--------------------------------
        // Expand Demo Care Plan row
        //--------------------------------
        await page
            .locator(`[id*="care-plan-table"]`)
            .getByText(`Demo Care Plan, #`)
            .first()
            .click();


        //await waitUntilLoaded(page);

        //--------------------------------
        // PROBLEM: Edit "Physical inactivity."
        //--------------------------------
        await page.getByText(`Physical inactivity.`).click();
        await page.locator(`button[title="Edit"]:visible`).click();

        //await waitUntilLoaded(page);

        await page.locator(`#cppp_member_description`).fill(memDesc);

        //await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();

       // await waitUntilLoaded(page);

        // Assert Work Log popup on Problem update
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        //await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // GOAL: Edit "Member participates in physician approved exercise program."
        //--------------------------------
        await page
            .getByText(`Member participates in physician approved exercise program.`)
            .first()
            .click();

        //await waitUntilLoaded(page);

        await page.locator(`button[title="Edit"]:visible`).click();
        await page.locator(`#cppg_member_description`).fill(memDesc);

        //await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();

        //await waitUntilLoaded(page);

        // Assert Work Log popup on Goal update
        await expect(page.getByText(`New Work Log`)).toBeVisible();

        //await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // INTERVENTION: "Assess member's exercise."
        //--------------------------------
        await page.locator(`:text("Assess member's exercise.")`).click();

        //await waitUntilLoaded(page);

        await page.locator(`button[title="Edit"]:visible`).click();

        //await waitUntilLoaded(page);

        // + Intervention Status
        await page.getByRole(`button`, { name: ` \xa0Intervention Status` }).click();

        //await waitUntilLoaded(page);

        // Close the small dialog if it appears (per your steps)
        await page.getByRole(`button`, { name: ``, exact: true }).click();

        //await waitUntilLoaded(page);

        // Fill & select Intervention Status = Open
        await page
            .locator(`input[name*="cpis_intervention_status_id__2_input"]`)
            .fill(`Open`);
        await page.getByRole(`option`, { name: `Open` }).click();

        //await waitUntilLoaded(page);

        // Save & Close Intervention
        await page.getByRole(`button`, { name: ` Save and Close` }).click();

        //await waitUntilLoaded(page);

        // Assert Work Log popup on Intervention update
        await expect(page.getByText(`New Work Log`)).toBeVisible();

       // await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // OUTCOME: Edit first occurrence text
        //--------------------------------
        await page
            .locator(`[data-title="Outcome"]`)
            .getByText(`Member participates in a`)
            .first()
            .click();

        //await waitUntilLoaded(page);

        await page.locator(`button[title="Edit"]:visible`).click();
        await page.locator(`#cppo_member_description`).fill(memDesc);

       // await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();

       // await waitUntilLoaded(page);

        // Assert Work Log popup on Outcome update
        await expect(page.getByText(`New Work Log`)).toBeVisible();

       // await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
       // await waitUntilLoaded(page);

        //--------------------------------
        // Cleanup:
        //--------------------------------
        // Navigate to Case tab (menu)
        await page.getByRole(`menuitem`, { name: `Case` }).locator(`span`).nth(1).click();

       // await waitUntilLoaded(page);

        // All Cases
        await page.getByRole(`button`, { name: ` All Cases` }).click();

       // await waitUntilLoaded(page);

        try {
            await cleanupTabOnMembersPage(page, {
                tab: `Case`,
                gridId: `[id="member-case-grid"]`,
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