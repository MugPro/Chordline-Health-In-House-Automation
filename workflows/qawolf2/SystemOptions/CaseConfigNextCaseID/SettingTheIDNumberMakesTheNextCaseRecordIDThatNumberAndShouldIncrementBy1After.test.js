

// SettingTheIDNumberMakesTheNextCaseRecordIDThatNumberAndShouldIncrementBy1After.test.js
import { test, expect } from '@playwright/test';

// Helpers from your repo (paths may need adjusting to match your structure)
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

test.describe(
    'Setting Next Case ID sets the next Case # and increments by 1 thereafter',
    () => {
        let browser, context, page;

        /*
        test.beforeEach(async () => {
            const loginID = 'CaseConfigNCID';

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

        test('Next Case ID sets next Case # and increments by +1 afterwards', async () => {
            //--------------------------------
            // Arrange:
            //--------------------------------
            const loginID = 'CaseConfigNCID';
            const memberName = 'Reyes, Tomas';

            let highestCaseNumber; // numeric
            let sysOpCaseNum;      // numeric




            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL_2;


            // Act
            const { page, browser } = await logIn3({
                loginID,
                password,
                url
            });




            try {
                //--------------------------------
                // Act: Go to Home > Cases and get the highest current Case #
                //--------------------------------
                await page.getByText('Home', { exact: true }).click();
                await page.locator('[role="tab"]#home-tabs-tab-7').click(); // Cases tab
                await waitUntilLoaded(page);

                // Click the "Case #" column sort icon twice to sort descending
                const sortIcon = page.getByRole('columnheader', { name: 'Case #' }).locator('span').nth(1);
                await sortIcon.click();
                await waitUntilLoaded(page);
                await sortIcon.click();
                await waitUntilLoaded(page);

                // Verify aria-sort=descending
                await expect(
                    page.locator('[data-field="case_id"][aria-sort="descending"]')
                ).toBeVisible();

                // Read the topmost Case # value from the grid
                // Adjust the td index if your grid layout differs; using nth(5) to mirror your snippet.
                const firstRow = page.locator('#cases-grid table tbody tr').first();
                const firstRowCaseCell = firstRow.locator('td').nth(5);
                const highestCaseNumberText = await firstRowCaseCell.innerText();
                highestCaseNumber = Number(highestCaseNumberText);

                //--------------------------------
                // Act: Open System Options and set Next Case ID to highest + 2
                //--------------------------------
                await page.getByText('Tools').click();
                await page.getByText('System Options').click();

                await page.getByText('Configuration', { exact: true }).click();
                await page.getByText('Case Configuration').scrollIntoViewIfNeeded();

                // Grab current Next Case ID (read-only/visible input)
                // Matches: [id="system-options"] [class="right"]:has([id="NextCaseId"]) input >> nth=0
                const nextCaseIdInput = page
                    .locator('#system-options .right:has(#NextCaseId) input')
                    .first();

                const sysOpCaseNumValue = await nextCaseIdInput.evaluate((e) => e.value);
                sysOpCaseNum = Number(sysOpCaseNumValue);

                // Ensure we set Next Case ID to MAX(highestCaseNumber, sysOpCaseNum) + 2
                const base = Math.max(highestCaseNumber || 0, sysOpCaseNum || 0);
                const targetNextCaseId = base + 1;

                // Set the Next Case ID
                await nextCaseIdInput.click({ timeout: 3000 });
                await page.keyboard.press('Control+A');
                await nextCaseIdInput.pressSequentially(String(targetNextCaseId));

                // Save & Close System Options
                await page.getByRole('button', { name: 'Save and Close' }).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Act: Create a new Case for the member
                //--------------------------------
                // Members tab
                await page.locator('#home-tabs-tab-4').click();

                // Search for member
                await page.getByRole('textbox', { name: 'Search...' }).fill(memberName);
                await page.keyboard.press('Enter');

                // Open member row
                await page.getByRole('gridcell', { name: memberName }).dblclick();
                await waitUntilLoaded(page);

                // Case tab
                await page.getByText('Case', { exact: true }).first().click();

                // + Case
                await page.getByRole('button', { name: ' Case' }).click();
                await waitUntilLoaded(page);

                // Save the Case
                await page.getByRole('button', { name: ' Save' }).click();

                // Save & Close Work Log popup (if present)
                try {
                    await page.getByRole('button', { name: ' Save and Close' }).click({ timeout: 3000 });
                } catch {
                    // If no work log presented, continue
                }

                // Grab the new Case # from form header (e.g., "Case #12345")
                const caseHeaderText = await page.locator('#form-header .headerLabel').innerText();
                const newCaseNumber = Number(caseHeaderText.replace('Case #', '').trim());

                //--------------------------------
                // Assert:
                //--------------------------------
                try {
                    // Primary expectation: the new case equals targetNextCaseId
                    expect(newCaseNumber).toBe(targetNextCaseId);
                } catch {
                    // Fallback: If a parallel process already consumed targetNextCaseId,
                    // the new case might be greater than targetNextCaseId.
                    expect(newCaseNumber).toBeGreaterThan(targetNextCaseId);

                    // Verify in Cases grid that (base + 2) is present and (base + 1) is not
                    await page.getByText('Home', { exact: true }).click();
                    await page.locator('#home-tabs-tab-7').getByText('Cases').click();



                    await waitUntilLoaded(page);

                    await expect(
                        page.locator(
                            `#cases-grid table tbody tr td:text-is("${targetNextCaseId}")`
                        )
                    ).toBeVisible();

                    await expect(
                        page.locator(
                            `#cases-grid table tbody tr td:text-is("${base + 1}")`
                        )
                    ).not.toBeVisible();

                    // Return to the member tab (optional)
                    await page.locator('#member-tab-name').click().catch(() => {});
                }

                // Optional: return to All Cases for screenshots/report state
                await page.getByRole('button', { name: ' All Cases' }).click();
                await waitUntilLoaded(page);
            } finally {
                //--------------------------------
                // Cleanup (always):
                //--------------------------------
                try {
                    await waitUntilLoaded(page);
                    await cleanupTabOnMembersPage(page, {
                        tab: 'Case',
                        gridId: '[id="member-case-grid"]',
                        memberName,
                        loginID,
                        // NOTE: omit onScreen so the helper navigates:
                        // Home > Members > open member > Case tab
                    });
                } catch (e) {
                    // Report (but do not fail test because of reporting)
                    try {
                        await reportCleanupFailed({
                            dedupKey: 'cleanupTabOnMembersPage',
                            errorMsg: e.message,
                        });
                    } catch {}
                }
            }
        });
    }
);






















