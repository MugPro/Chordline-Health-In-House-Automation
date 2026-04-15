// File: tests/1_CreateAssessment.test.js
// Description: Creates a new Assessment with 3 random sections and 3 random questions,
//              then verifies the selected sections/questions are present on the Edit page.


import { env } from '../../../../environments/staging.env.js';

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded, reportCleanupFailed } from '../../../../helpers/Node20Helpers.js';

/**
 * Optional: Lightweight fallback reporter in case your helpers file
 * doesn't export a reportCleanupFailed() utility. Replace with your
 * own telemetry/reporting if desired.
 */



test.describe('Assessments - Create Assessment', () => {
    test('Create a new assessment and verify sections & questions', async () => {
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

            await waitUntilLoaded(page);

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

                    //await waitUntilLoaded(page);

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

        //--------------------------------
        // Act:
        //--------------------------------
        // Click + New and wait for load
        await page.getByRole('button', { name: ' \u00A0New' }).click();
        await waitUntilLoaded(page);

        // Verify "New Assessment" page
        await expect(page.getByText('New Assessment')).toBeVisible();

        // Fill in the Assessment name
        await page.locator('#assessment_name').fill(assessmentName);

        await waitUntilLoaded(page);

        // Click the Sections dropdown
        await page.getByText('Sections').click();

        await waitUntilLoaded(page);

        // Grab section locators and names
        const sectionLocators = await page
            .locator(`[id="manage-rules-sections"] ul li`)
            .all();
        const sectionNames = await page
            .locator(`[id="manage-rules-sections"] ul li span[class="k-menu-link-text"]`)
            .allInnerTexts();

        await waitUntilLoaded(page);

        // Randomly select 3 section indexes
        const threeRandomIndexes = randomIdxsHelper(0, sectionLocators.length - 1);

        // Check the selected sections
        for (let idx of threeRandomIndexes) {
            await sectionLocators[idx]
                .locator(`input[type="checkbox"]`)
                .check({ force: true });
        }

        await waitUntilLoaded(page);

        // Click the first "+ Question" button (visible)
        await page
            .locator(`button:visible:has-text("Question")`)
            .first()
            .click({ force: true });

        // Click the "Add a new question" dropdown (Question Library)
        await page.getByText('Question Library', { exact: true }).nth(2).click();

        await waitUntilLoaded(page);

        // Grab dropdown option names
        const questionDropDownNames = await page
            .locator(`[data-role="popup"]:visible ul li`)
            .allInnerTexts();

        // Pick 3 random question types
        const threeRandomIndexes2 = randomIdxsHelper(
            0,
            questionDropDownNames.length - 1,
        );

        await waitUntilLoaded(page);

        // Close the dropdown
        await page
            .locator(`#new-question-tool-tip-div_tb_active`)
            .getByTitle('Close')
            .click();

        await waitUntilLoaded(page);

        // Click the + Question for each section and add a question
        let idx2 = 0;
        for (let idx of threeRandomIndexes2) {
            // Click the corresponding Question button and increment idx2
            await page
                .locator(`button:visible:has-text("Question")`)
                .nth(idx2)
                .click({ force: true });
            idx2++;

            await waitUntilLoaded(page);

            // Open Question types dropdown
            await page.locator(`[aria-controls="fieldTypes_listbox"]`).click();

            await waitUntilLoaded(page);

            // Select by visible name
            let name = questionDropDownNames[idx];
            await page
                .locator(`[id="fieldTypes_listbox"]:visible li div:text-is("${name}")`)
                .click();

            await waitUntilLoaded(page);

            // Click Add
            await page.getByRole('button', { name: 'Add', exact: true }).click();

            await waitUntilLoaded(page);

            // Special-case handling per provided logic
            if (name.trim() === 'Question Library') {
                await page
                    .getByRole('gridcell', { name: 'Can you verify who is your' })
                    .click();
                await page.getByRole('button', { name: 'Select', exact: true }).click();
            }

            if (name.trim() === 'Lookup') {
                await page
                    .locator(`input[name="fieldQuestionLookupTable_input"]`)
                    .fill('Activity Type');
                await page.getByRole('option', { name: 'Activity Type' }).click();
            }
        }

        await waitUntilLoaded(page);

        // Save the assessment
        await page.getByRole('button', { name: 'Save' }).click();
        await waitUntilLoaded(page);

        // Close the New Assessment modal
        await page.getByLabel('New Assessment').getByText('Close').click();

        await waitUntilLoaded(page);

        // Search for the assessment by name
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill(assessmentName);
        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        // Open the assessment (double click) to edit
        await page.getByRole('gridcell', { name: assessmentName }).dblclick();

        // Expect "Edit Assessment" visible
        await expect(page.getByText('Edit Assessment')).toBeVisible();

        //--------------------------------
        // Assert:
        //--------------------------------
        // Assert the three sections are visible
        for (let idx of threeRandomIndexes) {
            let name = sectionNames[idx];
            if (name === 'Administrative') {
                if (idx === 7) name = 'Administrative_Footer';
                else name = 'Administrative_Header';
            }

            // Ensure we match both the data-title attribute (underscored) AND the visible text
            await expect(
                page.locator(
                    `[data-title="${name.split(' ').join('_')}"]:text-is("${sectionNames[idx]}")`,
                ),
            ).toBeVisible({ timeout: 3000 });
        }

        // Assert the 3 questions are visible
        for (let idx of threeRandomIndexes2) {
            let name = questionDropDownNames[idx];
            await expect(
                page
                    .locator(`div[class="flex-item label"]:has-text("${name.trim()}")`)
                    .first(),
            ).toBeVisible({ timeout: 3000 });
        }

        await waitUntilLoaded(page);
        // End test body

        // Ensure the test cleans up browser resources it started
        await context.close();
        await browser.close();
    });
});
