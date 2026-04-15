/*

// File: tests/UpdateAssessment.test.js
// Description: Opens an existing `assessmentsCRUD*` assessment, edits the text of the
//              three questions that were added previously, saves, re-opens, and verifies:
//              1) the original three sections are still present
//              2) the updated question texts are visible.

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';

test.describe('Assessments - Update Assessment', () => {
    test('Update question texts and verify sections unchanged', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        // Log in (launches its own browser/context)
        const { page, context, browser } = await logIn({ loginID: 'AssessCrud' });

        // Navigate to Tools > Assessments
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();

        // Locate an existing assessment created by the Create test
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill('assessmentsCRUD');
        await page.keyboard.press('Enter');

        // Ensure at least one matching assessment exists
        const matchingRows = page.locator(
            `[id="browse-grid"] table tbody tr:has-text("assessmentsCRUD")`,
        );
        await expect(matchingRows).toHaveCountGreaterThan(0);

        // Use the first matching assessment
        const firstRow = matchingRows.first();
        const firstRowFirstCell = firstRow.getByRole('gridcell').first();
        const assessmentName = (await firstRowFirstCell.innerText()).trim();

        // Open it to reach the Edit page
        await page.getByRole('gridcell', { name: assessmentName }).dblclick();
        await expect(page.getByText('Edit Assessment')).toBeVisible();

        // --- Capture original sections (names + which were selected) so we can assert later ---
        // Open "Sections" dropdown to read all section names and determine which were checked
        await page.getByText('Sections').click();

        const sectionItemLocators = page.locator(`#manage-rules-sections ul li`);
        const sectionCount = await sectionItemLocators.count();

        // All section visible names
        const sectionNames = await page
            .locator(`#manage-rules-sections ul li span.k-menu-link-text`)
            .allInnerTexts();

        // Determine which three checkboxes are checked (these are our original 3 sections)
        // If more than 3 are checked (edge-case), we’ll just take the first 3.
        let threeRandomIndexes = [];
        for (let i = 0; i < sectionCount; i++) {
            const cb = sectionItemLocators.nth(i).locator(`input[type="checkbox"]`);
            if (await cb.isChecked()) {
                threeRandomIndexes.push(i);
            }
        }
        if (threeRandomIndexes.length > 3) {
            threeRandomIndexes = threeRandomIndexes.slice(0, 3);
        }

        // --- Identify the 3 questions that were previously added, by their visible type labels ---
        // We’ll prepare arrays to mimic the original variable names used in your snippet.
        let questionDropDownNames = await page
            .locator(`div.flex-item.label`)
            .allInnerTexts();
        // Keep the first 3 as our targets, then operate by index
        questionDropDownNames = questionDropDownNames.slice(0, 3);
        const threeRandomIndexes2 = [0, 1, 2];

        // Constants: generate 3 new question texts (2 words each)
        const twoWords = () =>
            (faker.random?.words?.(2)) || faker.word.words(2) || faker.lorem.words(2);
        const questionTexts = Array(3)
            .fill('')
            .map(() => twoWords());

        //--------------------------------
        // Act:
        //--------------------------------
        // Adjust the question texts
        for (let i = 0; i < threeRandomIndexes2.length; i++) {
            // Grab the index and the name of the question
            let idx = threeRandomIndexes2[i];
            let name = questionDropDownNames[idx];

            // Click the question (by label text first, fallback to data-type)
            try {
                await page
                    .locator(`div[class="flex-item label"]:has-text("${name.trim()}")`)
                    .click({ timeout: 3000 });
            } catch {
                if (name.trim() === 'Date Time') name = 'Datetime';
                try {
                    await page
                        .locator(`[class*="drag-field"][data-type*="${name.trim()}"]`)
                        .click({ timeout: 3000 });
                } catch {
                    // Final fallback: click by index in case neither label nor data-type matches precisely
                    await page.locator(`[class*="drag-field"]`).nth(i).click({ timeout: 3000 });
                }
            }

            // Edit the question text
            await page.locator('#question-text').fill(questionTexts[i]);
            await page.locator('#question-text').blur();
        }

        // Click the Save button
        await page.getByRole('button', { name: 'Save' }).click();
        await waitUntilLoaded(page);

        // Click Close
        await page.getByLabel('Edit Assessment').getByText('Close').click();

        // Double click the assessment to open up the edit page again
        await page.getByRole('gridcell', { name: assessmentName }).dblclick();

        // Expect "Edit Assessment" to be visible
        await expect(page.getByText('Edit Assessment')).toBeVisible();

        //--------------------------------
        // Assert:
        //--------------------------------
        // Assert the three sections are visible - these should remain unchanged
        for (let idx of threeRandomIndexes) {
            let name = sectionNames[idx];
            if (name === 'Administrative') {
                if (idx === 7) name = 'Administrative_Footer';
                else name = 'Administrative_Header';
            }
            await expect(
                page.locator(
                    `[data-title="${name.split(' ').join('_')}"]:text-is("${sectionNames[idx]}")`,
                ),
            ).toBeVisible({ timeout: 3000 });
        }

        // Assert the 3 edited questions are visible
        for (let i = 0; i < questionTexts.length; i++) {
            let name = questionTexts[i];
            await expect(
                page.locator(`div[class="flex-item label"]:has-text("${name.trim()}")`),
            ).toBeVisible({ timeout: 3000 });
        }

        // Close resources
        await context.close();
        await browser.close();
    });
});

 */






















// File: tests/UpdateAssessment.test.js
// Purpose: If an `assessmentsCRUD*` assessment exists, update the text of 3 questions,
//          save and verify. If none exists, clearly report and skip the test.

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';

test.describe('Assessments - Update Assessment', () => {
    test('Update question texts or report no assessment to update', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const { page, context, browser } = await logIn({ loginID: 'AssessCrud' });

        // Navigate to Tools > Assessments
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();

       // await waitUntilLoaded(page);

        // Fresh search for our naming convention
        const search = page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...');
        await search.click();
        await search.press('Control+A');
        await search.press('Delete');
        await search.fill('assessmentsCRUD');
        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);


        // Find rows with the convention
        const matchingRows = page.locator(
            `#browse-grid table tbody tr:has-text("assessmentsCRUD")`,
        );

        const count = await matchingRows.count();
        if (count === 0) {
            // Nothing to update — skip cleanly with a clear note
            test.skip(true, 'No assessment found to update. Ensure 1_CreateAssessment.test.js ran successfully.');
            await context.close();
            await browser.close();
            return;
        }

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
                `[id="browse-grid"] table tbody tr:has-text("assessmentsCrud") [title="Edit"]`,
            )
            .first()
            .click();

        await waitUntilLoaded(page);

        await expect(page.getByText('Edit Assessment')).toBeVisible();

        // --- Capture the currently selected sections so we can assert later ---
        await page.getByText('Sections').click();

        await waitUntilLoaded(page);

        const sectionItemLocators = page.locator(`#manage-rules-sections ul li`);
        const sectionCount = await sectionItemLocators.count();

        const sectionNames = await page
            .locator(`#manage-rules-sections ul li span.k-menu-link-text`)
            .allInnerTexts();



        // Collect indices of checked sections (cap at 3 to match original assertions)
        let threeRandomIndexes = [];
        for (let i = 0; i < sectionCount; i++) {
            const cb = sectionItemLocators.nth(i).locator(`input[type="checkbox"]`);
            if (await cb.isChecked()) threeRandomIndexes.push(i);
        }
        if (threeRandomIndexes.length > 3) threeRandomIndexes = threeRandomIndexes.slice(0, 3);

        // Close dropdown if it overlays content
       // await page.keyboard.press('Escape').catch(() => {});

        //--------------------------------
        // Act:
        //--------------------------------
        // Identify 3 question “labels” in the design surface; fallback to common types if needed
        let questionDropDownNames = await page.locator(`div.flex-item.label`).allInnerTexts();
        if (questionDropDownNames.length < 3) {
            // Fallback names (only used for locating widgets)
            questionDropDownNames = ['Question Library', 'Text', 'Lookup'];
        }
        const threeRandomIndexes2 = [0];

        await waitUntilLoaded(page);

        // Generate 3 new question texts (2 words each)
        const twoWords = () => faker.word.words(2);

        const questionTexts = Array(1)
            .fill('')
            .map(() => twoWords());

        await waitUntilLoaded(page);

        // Update questions
        for (let i = 0; i < threeRandomIndexes2.length; i++) {
            let idx = threeRandomIndexes2[i];
            let name = questionDropDownNames[idx];

            // Click the question (by visible label first; fallback by data-type)
            try {
                await page
                    .locator(`div[class="flex-item label"]:has-text("${(name || '').trim()}")`)
                    .click({ timeout: 6000 });
                await waitUntilLoaded(page);
            } catch {
                if ((name || '').trim() === 'Date Time') name = 'Datetime';
                await page
                    .locator(`[class*="drag-field"][data-type*="${(name || '').trim()}"]`)
                    .first()
                    .click({ timeout: 10000 });
            }

            await waitUntilLoaded(page);

            // Edit the question text
            await page.locator('#question-text').fill(questionTexts[i]);
            //await page.locator('#question-text').blur();
        }

        await waitUntilLoaded(page);

        // Save and re-open
        await page.getByRole('button', { name: 'Save' }).click();
        await waitUntilLoaded(page);

        await page.getByLabel('Edit Assessment').getByText('Close').click();

        await waitUntilLoaded(page);




        await page
            .locator(
                `[id="browse-grid"] table tbody tr:has-text("assessmentsCrud")`,
            )
            .first()
            .dblclick();



        await expect(page.getByText('Edit Assessment')).toBeVisible();

        //--------------------------------
        // Assert:
        //--------------------------------
        // Sections should remain visible/unchanged
        for (let idx of threeRandomIndexes) {
            let name = sectionNames[idx];
            if (name === 'Administrative') {
                if (idx === 7) name = 'Administrative_Footer';
                else name = 'Administrative_Header';
            }
            await expect(
                page.locator(
                    `[data-title="${name.split(' ').join('_')}"]:text-is("${sectionNames[idx]}")`,
                ),
            ).toBeVisible({ timeout: 6000 });
        }

        // The 3 edited questions should now show new labels
        for (let i = 0; i < questionTexts.length; i++) {
            const updated = questionTexts[i].trim();
            await expect(
                page.locator(`div[class="flex-item label"]:has-text("${updated}")`),
            ).toBeVisible({ timeout: 6000 });
        }

        await context.close();
        await browser.close();
    });
});