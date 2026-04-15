// File: tests/1_CreateQuestionInAssessmentAndAddItToQuestionLlibrary.test.js
// Purpose: Create a new question inside a new Assessment and add it to the Question Library,
//          then verify it appears in the Library with the correct section and tag.

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded, reportCleanupFailed } from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';

/**
 * Lightweight fallback reporter if your helpers do not export reportCleanupFailed().
 * Replace with your telemetry/reporting as needed.
 */


test.describe('Assessments - Create Question and Add It to Question Library', () => {
    test('Create a question in an assessment, add to library, and verify', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = 'QuestionLib';
        // Use the modern faker API (faker.random.words is deprecated)
        const questionText = `QAWolf-${faker.word.words(2)}`;
        const tag = 'QAW';

        // Log in
        const { page, context, browser } = await logIn({ loginID });

        // Navigate to "Tools" > "Assessments"
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();

        // Click the "Question Library" tab
        await page.getByText('Question Library').click();

        //--------------------------------
        // Cleanup:
        //--------------------------------
        // Search for any existing QAWolf-* questions and delete them
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill('QAWolf-');
        await page.keyboard.press('Enter');

        try {
            // If there are no results, this should pass quickly
            await expect(
                page.locator(
                    `[id="browse-grid"] table tbody tr:has-text("QAWolf-") [title="Delete"]`,
                ),
            ).toHaveCount(0, { timeout: 3000 });
        } catch {
            // Otherwise, delete all that match
            let count = await page
                .locator(
                    `[id="browse-grid"] table tbody tr:has-text("QAWolf-") [title="Delete"]`,
                )
                .count();

            for (let i = 0; i < count; i++) {
                // Click the first row that matches
                await page
                    .locator(`[id="browse-grid"] table tbody tr:has-text("QAWolf-")`)
                    .first()
                    .click();

                // Click the trashcan icon
                await page
                    .locator(
                        `[id="browse-grid"] table tbody tr:has-text("QAWolf-") [title="Delete"]`,
                    )
                    .first()
                    .click();

                // Confirm deletion and wait for loader
                await page.getByRole('button', { name: 'Yes' }).click();
                await waitUntilLoaded(page);
            }
        }

        //--------------------------------
        // Act:
        //--------------------------------
        // Click "Assessments" tab
        await page
            .getByLabel('Manage Assessments')
            .getByText('Assessments', { exact: true })
            .click();

        // Click the "+ New" button
        await page.getByRole('button', { name: ' \u00A0New' }).click();
        await waitUntilLoaded(page);

        // Expand the Section dropdown
        await page.locator('span').filter({ hasText: 'Sections' }).first().click();

        // Grab sections and select one at random
        const sectionLocators = await page
            .locator(`#manage-rules-sections ul li`)
            .all();
        const sectionNames = await page
            .locator(`#manage-rules-sections ul li span[class="k-menu-link-text"]`)
            .allInnerTexts();
        const idx = Math.floor(Math.random() * sectionNames.length);

        // Format the section name for the checkbox locator
        let formattedSectionName = sectionNames[idx].toLowerCase().split(' ').join('_');
        if (formattedSectionName === 'administrative') {
            if (idx === 7) formattedSectionName = 'administrative_footer';
            else formattedSectionName = 'administrative_header';
        }

        // Check the section checkbox
        await page
            .locator(`input[id*="${formattedSectionName}"]`)
            .check({ force: true, timeout: 3000 });

        // Click the "+ Question" button that appears
        await page.getByRole('button', { name: ' Question' }).click();

        // Click the "Add a new question" dropdown to expand options
        await page
            .locator('#new-question-tool-tip-div_tb_active')
            .getByText('Question Library')
            .first()
            .click();

        // Grab the names of the dropdown options
        const questionDropDownNames = await page
            .locator(`[data-role="popup"]:visible ul li`)
            .allInnerTexts();

        // Pick a random question type (or first one if desired)
        const idx2 = Math.floor(Math.random() * questionDropDownNames.length);
        const questionName = questionDropDownNames[idx2];

        // Select the question option
        await page
            .locator(
                `[id="fieldTypes_listbox"]:visible li div:text-is("${questionName}")`,
            )
            .click();

        // Click the "Add" button
        await page.getByRole('button', { name: 'Add', exact: true }).click();

        // If Question Library chosen, pick a specific question
        if (questionName.trim() === 'Question Library') {
            await page.getByRole('gridcell', { name: 'Completed Date' }).first().click();
            await page.getByRole('button', { name: 'Select', exact: true }).click();
        }

        // Fill in the question text
        await page.locator('#question-text').fill(questionText);

        // If Lookup chosen, configure the lookup
        if (questionName.trim() === 'Lookup') {
            await page
                .locator(`input[name="fieldQuestionLookupTable_input"]`)
                .fill('Activity Type');
            await page.getByRole('option', { name: 'Activity Type' }).click();
        }

        // Click the "Add to Question Library" button
        await page.getByRole('button', { name: 'Add to Question Library' }).click();

        // Fill in the tag input
        await page
            .getByRole('tooltip', { name: 'Add this Question to the' })
            .getByRole('combobox')
            .fill(tag);

        // Click "Add new tag"
        await page
            .getByRole('option', { name: `Add new tag: ${tag}` })
            .locator('span')
            .click();

        // Click the "Add" button
        await page.getByRole('button', { name: 'Add', exact: true }).click();

        //--------------------------------
        // Assert:
        //--------------------------------
        // Assert the "Success" message
        await expect(page.getByText('Success')).toBeVisible();
        await expect(
            page.getByText('The question was added to the question library'),
        ).toBeVisible();

        // Click the "Okay" button
        await page.getByRole('button', { name: 'Okay' }).click();

        // Close the "New Assessment" page
        await page.getByLabel('New Assessment').getByText('Close').click();

        // Confirm Warning pop-up
        await page.getByRole('button', { name: 'Yes' }).click();

        await waitUntilLoaded(page);

        // Return to "Question Library" tab
        await page.getByText('Question Library').click();

        // Search for our question by the question text
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill(questionText);
        await page.keyboard.press('Enter');

        // Assert the row with question text, tag, and correct section is visible
        await expect(
            page.locator(
                `table tbody tr:has-text("${questionText}"):has-text("${tag}"):has-text("${sectionNames[idx]}")`,
            ),
        ).toBeVisible();

        // Cleanup: close resources
        await context.close();
        await browser.close();
    });
});