// WorkLogPromptsMedications.test.js
import { test, expect } from '@playwright/test';
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

   // await waitUntilLoaded(page);

    for (let i = 0; i < count; i++) {
        // Hover the first row created by our user and click the trash icon
        await page
            .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`)
            .first()
            .hover();

       // await waitUntilLoaded(page);

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











test.describe('Work Log Prompt – Medications (Add, Edit, Reconciliation)', () => {
    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = 'WorkLogPMedica';
        ({ browser, context, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            slowMo: 1000,// intentionally no password per your snippet
        }));
    });

     */

    test('Work Logs appear on Medication add, edit, and reconciliation', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `WorkLogPMedica`;
        const memberName = `Studabaker, Missy`;
        const specialInstructions = `Editing medication ${Date.now()}`;
        const medRecon = `Created medRecon ${Date.now()}`;
        const comment = `${Date.now()}`;



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
        // Pre-cleanup (Medications + User Work Logs under Member Detail)
        //--------------------------------
        try {
            await NewCleanupTabOnMembersPage(page, {
                tab: 'Medications',
                gridId: '[id="medications-grid"]',
                memberName,
                loginID,
            });

            // Navigate to Member Detail tab
            await page
                .getByRole('menuitem', { name: 'Member Detail' })
                .locator('span')
                .nth(1)
                .click();

            // Open Work Logs shortcut
            await page.locator('[id="shortcuts"] [data-value="worklogs-anchor"]').click();

            //await waitUntilLoaded(page);

            // If search is visible, delete existing user worklogs for this user
            const searchVisible = await page
                .locator('#worklogs-anchor')
                .getByRole('textbox', { name: 'Search...' })
                .isVisible();


            //await waitUntilLoaded(page);

            if (searchVisible) {
                await page
                    .locator('#worklogs-anchor')
                    .getByRole('textbox', { name: 'Search...' })
                    .fill(loginID);
                await page.keyboard.press('Enter');
                //await waitUntilLoaded(page);

                const count = await page
                    .locator('[id="worklogs-child-grid"] table tbody tr')
                    .count();


               // await waitUntilLoaded(page);

                for (let i = 0; i < count; i++) {
                    // Delete first row matching the user each time
                    await page
                        .locator(
                            `[id="worklogs-child-grid"] table tbody tr:has-text("${loginID}")`
                        )
                        .first()
                        .hover();
                    await page
                        .locator(
                            `[id="worklogs-child-grid"] table tbody tr:has-text("${loginID}") [title="Delete"]`
                        )
                        .first()
                        .click();

                    //await waitUntilLoaded(page);

                    await page.getByRole('button', { name: 'Yes' }).click();
                    //await waitUntilLoaded(page);
                }
            }
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
        await page.getByText('Tools').click();
        await page.getByText('System Options').click();

        // Click "Configuration" tab
        await page.getByText('Configuration', { exact: true }).click();

        //await waitUntilLoaded(page);

        // Scroll "Work Log Prompts" into view
        await page.getByText('Work Log Prompts').scrollIntoViewIfNeeded();

        // Ensure "Medications" prompt is ON
        try {
            await expect(page.locator('#WorkLogPrompts_Medications_Yes')).toBeChecked();
        } catch {
            await page.locator('#WorkLogPrompts_Medications_Yes').check();
        }


        //await waitUntilLoaded(page);

        // Save and Close System Options
        await page.getByRole('button', { name: 'Save and Close' }).click();
        //await waitUntilLoaded(page);

        // Navigate to Home > Members
        await page.getByText('Home', { exact: true }).click();

        //await waitUntilLoaded(page);

        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        //await waitUntilLoaded(page);

        // Search for member and open
        await page.getByRole('textbox', { name: 'Search...' }).fill(memberName);
        await page.keyboard.press('Enter');

       // await waitUntilLoaded(page);

        await page.getByRole('gridcell', { name: memberName }).dblclick();
        //await waitUntilLoaded(page);

        // Go to Medications tab
        await page.locator('#medications-menu').click();

        //await waitUntilLoaded(page);

        //--------------------------------
        // + Medication (Add)
        //--------------------------------
        await page.locator('#new-medication-button').click();

        await waitUntilLoaded(page);

        // Fill in a medication and select option
        await page
            .locator(`input[name="pmed_medication_id_input"]`)
            .fill(`Advil`);
        await page
            .locator(`:text("Advil 200 mg/1 CAPSULE, LIQUID FILLED")`)
            .last()
            .click();







        //await waitUntilLoaded(page);

        // Dose
        await page.locator('#pmed_dose').fill('200 mg');

       // await waitUntilLoaded(page);

        // Frequency: BID
        await page.locator('input[name="pmed_frequency_id_input"]').fill('BID');

        //await waitUntilLoaded(page);

        await page.getByRole('option', { name: 'BID' }).click();

        //await waitUntilLoaded(page);

        // Status: Taking
        await page
            .getByRole('combobox')
            .filter({ hasText: 'TakingNot TakingNot Taking as' })
            .locator('span')
            .nth(1)
            .click();

        //await waitUntilLoaded(page);

        await page.getByRole('option', { name: 'Taking', exact: true }).click();

        //await waitUntilLoaded(page);

        // Save Medication → triggers Work Log
        await page.getByRole('button', { name: ' Save' }).click();
        //await waitUntilLoaded(page);

        // Work Log visible
        await expect(page.getByText('New Work Log')).toBeVisible();

        //await waitUntilLoaded(page);

        // Capture WL timestamp
        const workActDate = await page.locator('#work_activity_date').evaluate(e => e.value);

        //await waitUntilLoaded(page);

        // Close the Work Log
        await page.getByRole('button', { name: ' Save and Close' }).click();

        //await waitUntilLoaded(page);

        // Capture Medication #
        const medNum = await page.getByText('Medication #').innerText();

        //await waitUntilLoaded(page);

        //--------------------------------
        // Edit Medication (Special Instructions) → new WL
        //--------------------------------
        await page.getByRole('button', { name: ' Edit' }).click();

        //await waitUntilLoaded(page);

        await page.locator('#pmed_special_instructions_for_prn').fill(specialInstructions);

        //await waitUntilLoaded(page);

        await page.getByRole('button', { name: ' Save' }).click();

       // await waitUntilLoaded(page);

        // Work Log visible
        await expect(page.getByText('New Work Log')).toBeVisible();

        //await waitUntilLoaded(page);

        // Capture WL timestamp
        const workActDate2 = await page.locator('#work_activity_date').evaluate(e => e.value);

        //await waitUntilLoaded(page);

        // Close the Work Log
        await page.getByRole('button', { name: ' Save and Close' }).click();

       // await waitUntilLoaded(page);

        //--------------------------------
        // All Medications → Reconciliation
        //--------------------------------
        await page.getByRole('button', { name: ' All Medications' }).click();

       // await waitUntilLoaded(page);

        await page.getByRole('button', { name: ' Reconciliation' }).click();
        //await waitUntilLoaded(page);

        // Reconcile first item and add top-level comment
        await page.getByRole('button', { name: 'Reconcile' }).first().click();

        //await waitUntilLoaded(page);

        await page.getByRole('textbox').fill(comment);

        //await waitUntilLoaded(page);

        // Fill Reconciliation Summary (iframe)
        const frame = page
            .frameLocator('[title="Editable area. Press F10 for toolbar."]')
            .first();
        await frame.locator('#pmrs_summary').fill(medRecon);

        //await waitUntilLoaded(page);

        // Click anchor to enable Save button
        await page
            .locator('#reconciliationsummary-anchor')
            .getByText('Reconciliation Summary')
            .click();

       // await waitUntilLoaded(page);

        // Save → triggers Work Log
        await page.getByRole('button', { name: ' Save' }).click();
       // await waitUntilLoaded(page);

        //--------------------------------
        // Assert: New Work Log after Reconciliation
        //--------------------------------
        await expect(page.getByText('New Work Log')).toBeVisible();

        //await waitUntilLoaded(page);

        // Capture WL timestamp
        const workActDate3 = await page.locator('#work_activity_date').evaluate(e => e.value);

        //await waitUntilLoaded(page);

        // Close the Work Log
        await page.getByRole('button', { name: ' Save and Close' }).click();

        //await waitUntilLoaded(page);
        //--------------------------------
        // Verify 3 Work Logs on Home → Work Logs
        //--------------------------------
        await page.getByText('Home', { exact: true }).click();

       // await waitUntilLoaded(page);

        await page.getByRole('tab', { name: 'Work Logs' }).locator('span').click();

       // await waitUntilLoaded(page);

        await page.getByRole('textbox', { name: 'Search...' }).fill(loginID);

        //await waitUntilLoaded(page);

        await page.keyboard.press('Enter');

       // await waitUntilLoaded(page);

        // Expect three rows visible
        await expect(
            page.locator('[id="worklogs-grid"] table tbody tr:visible')
        ).toHaveCount(3);

        // Validate each WL by its Activity Date/Time
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

        await expect(
            page.locator(
                `[id="worklogs-grid"] table tbody tr:visible:has-text("${workActDate3}")`
            )
        ).toBeVisible();


      //  await waitUntilLoaded(page);

        //--------------------------------
        // Cleanup:
        //--------------------------------
        // Return to the member tab (if needed)
        await page.locator('#member-tab-name').click();

       // await waitUntilLoaded(page);

        try {
            // Cleanup Medications tab
            await NewCleanupTabOnMembersPage(page, {
                tab: 'Medications',
                gridId: '[id="medications-grid"]',
                memberName,
                loginID,
                onScreen: true,
            });

            // Navigate to Member Detail and delete created user work logs again
            await page
                .getByRole('menuitem', { name: 'Member Detail' })
                .locator('span')
                .nth(1)
                .click();

           // await waitUntilLoaded(page);

            await page.locator('[id="shortcuts"] [data-value="worklogs-anchor"]').click();

          //  await waitUntilLoaded(page);

            const searchVisible2 = await page
                .locator('#worklogs-anchor')
                .getByRole('textbox', { name: 'Search...' })
                .isVisible();

          //  await waitUntilLoaded(page);

            if (searchVisible2) {
                await page
                    .locator('#worklogs-anchor')
                    .getByRole('textbox', { name: 'Search...' })
                    .fill(loginID);
              //  await waitUntilLoaded(page);
                await page.keyboard.press('Enter');
               // await waitUntilLoaded(page);

                const count2 = await page
                    .locator('[id="worklogs-child-grid"] table tbody tr')
                    .count();

               // await waitUntilLoaded(page);

                for (let i = 0; i < count2; i++) {
                    await page
                        .locator(
                            `[id="worklogs-child-grid"] table tbody tr:has-text("${loginID}")`
                        )
                        .first()
                        .hover();
                    await page
                        .locator(
                            `[id="worklogs-child-grid"] table tbody tr:has-text("${loginID}") [title="Delete"]`
                        )
                        .first()
                        .click();


                  //  await waitUntilLoaded(page);

                    await page.getByRole('button', { name: 'Yes' }).click();
                   // await waitUntilLoaded(page);
                }
            }
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupTabOnMembersPage',
                errorMsg: e.message,
            });
        }
    });
});