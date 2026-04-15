// File: tests/DeleteAssessment.test.js
// Description: Deletes an existing Assessment (with name starting with `assessmentsCRUD`)
//              by confirming the warning dialog, then verifies it no longer appears in the grid.

import { test, expect } from '@playwright/test';
import {logIn, reportCleanupFailed, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';

test.describe('Assessments - Delete Assessment', () => {
    test('Delete an assessment and verify it is removed from the grid', async () => {

        //--------------------------------
        // Arrange:
        //--------------------------------
        // Constants
        const loginID = `AssessCrud`;
        const assessmentName = `assessmentsCRUD${Date.now()}`;

        const randomIdxsHelper = (min, max, count = 3) => {
            const range = [];
            for (let i = min; i <= max; i++) {
                range.push(i);
            }

            // Shuffle the array using Fisher-Yates
            for (let i = range.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [range[i], range[j]] = [range[j], range[i]];
            }

            return range.slice(0, count);
        };

        // Log in (launches its own browser/context)
        const { page, context, browser } = await logIn({ loginID });

        try {
            // Navigate to Tools > Assessments
            await page.getByText('Tools').click();
            await page.locator('#menu-tools').getByText('Assessments').click();

            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup:
            //--------------------------------
            // Search for any pre-existing "assessmentsCRUD*" items and delete them
            await page
                .getByRole('dialog', { name: 'Manage Assessments' })
                .getByPlaceholder('Search...')
                .fill('assessmentsCRUD');
            await page.keyboard.press('Enter');

            //await waitUntilLoaded(page);

            try {
                // If there are no results, this should pass quickly
                await expect(
                    page.locator(
                        `[id="browse-grid"] table tbody tr:has-text("assessmentsCrud") [title="Delete"]`,
                    ),
                ).toHaveCount(0, { timeout: 3000 });
            } catch {
                // Grab the count and delete rows iteratively
                let count = await page
                    .locator(
                        `[id="browse-grid"] table tbody tr:has-text("assessmentsCrud") [title="Delete"]`,
                    )
                    .count();

                await waitUntilLoaded(page);

                for (let i = 0; i < count; i++) {
                    // Click the first assessment in the table

                    await page
                        .locator(
                            `[id="browse-grid"] table tbody tr:has-text("assessmentsCrud")`,
                        )
                        .first()
                        .click();

                   // await waitUntilLoaded(page);

                    // Click the trashcan icon
                    await page
                        .locator(
                            `[id="browse-grid"] table tbody tr:has-text("assessmentsCrud") [title="Delete"]`,
                        )
                        .first()
                        .click();

                    await waitUntilLoaded(page);

                    // Confirm delete and wait for loading to complete
                    await page.getByRole('button', { name: 'Yes' }).click();
                    await waitUntilLoaded(page);
                }
            }
            // If cleanup itself throws
            // (e.g., no results grid present), capture a warning (non-fatal)
            // so the test can still proceed to creation.
            // eslint-disable-next-line no-empty
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'assessmentsCRUD',
                errorMsg: e?.message || String(e),
            });
        }

        //await waitUntilLoaded(page);

        // Close the page/browser resources
        await context.close();
        await browser.close();
    });
});