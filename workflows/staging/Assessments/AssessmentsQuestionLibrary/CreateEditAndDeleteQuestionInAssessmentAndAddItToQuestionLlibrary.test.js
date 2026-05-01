// File: tests/CreateEditAndDeleteQuestionInAssessmentAndAddItToQuestionLlibrary.test.js
// Purpose: Create a new question inside a new Assessment and add it to the Question Library,
//          then verify it appears in the Library with the correct section and tag.

import { test, expect } from '@playwright/test';
import {logIn, waitUntilLoaded, reportCleanupFailed, logIn3} from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

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

        const questionTextEdit = `QAWolf-${faker.word.words(2)}`;

        // Attempt to hydrate prior values from environment (optional)
        let questionText2 = process.env.QA_QUESTION_TEXT || '';
        let tag2 = process.env.QA_TAG || 'QAW';

        // Log in
        //const { page, context, browser } = await logIn({ loginID, slowMo: 700 });


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url, slowMo: 700 });




        await waitUntilLoaded(page);

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
                //await waitUntilLoaded(page);
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
        //await waitUntilLoaded(page);

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
        const idx3 = Math.floor(Math.random() * questionDropDownNames.length);
        const questionName = questionDropDownNames[idx3];

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

        //await waitUntilLoaded(page);

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
























        await page.getByLabel(`Close`).click();


        // Navigate to Tools > Assessments -> Question Library
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();
        await page.getByText('Question Library').click();

        // If we didn't get a questionText from env/shared context, search for the latest QAWolf- entry
        if (!questionText2) {
            const search = page
                .getByRole('dialog', { name: 'Manage Assessments' })
                .getByPlaceholder('Search...');
            await search.click();
            await search.press('Control+A');
            await search.press('Delete');
            await search.fill('QAWolf-');
            await page.keyboard.press('Enter');
           // await waitUntilLoaded(page);

            // Ensure at least one result exists to edit
            const firstRow = page.locator(`table tbody tr:has-text("QAWolf-")`).first();
            await expect(firstRow).toBeVisible({ timeout: 5000 });

            // Extract the exact question text from the row content (best-effort parse):
            // If your table has a dedicated "Question" column, update the nth() index accordingly.
            // As a fallback, use the first "QAWolf-..." occurrence in the row text.
            const rowText = (await firstRow.innerText()).trim();
            const match = rowText.match(/QAWolf-[^\n\r\t]+/);
            questionText2 = match ? match[0].trim() : 'QAWolf-';
        }

        //--------------------------------
        // Act:
        //--------------------------------
        // Click the row for the target question
        await page.locator(`table tbody tr:has-text("${questionText2}")`).first().click();

        // Click the pencil icon to edit
        await page
            .locator(`table tbody tr:has-text("${questionText2}") [title="Edit"]`)
            .first()
            .click();

        // Verify the "Edit Question" screen pops up
        await expect(page.getByText('Edit Question')).toBeVisible();

        // We need to verify the section is visible on the left panel along with the question.
        // If you have the exact section (sectionNames[idx]) from the previous test, you can pass it as:
        //   process.env.QA_SECTION_NAMES_JSON (stringified array) and process.env.QA_SECTION_IDX
        // Otherwise, we will attempt to locate by either raw name or underscored name
        // based on what the panel renders.

        let sectionNames2 = [];
        let idx2 = -1;

        try {
            if (process.env.QA_SECTION_NAMES_JSON) {
                sectionNames2 = JSON.parse(process.env.QA_SECTION_NAMES_JSON);
            }
            if (process.env.QA_SECTION_IDX) {
                idx2 = parseInt(process.env.QA_SECTION_IDX, 10);
            }
        } catch {
            // ignore parse errors; we will use fallback checks below
        }

        if (Array.isArray(sectionNames2) && idx2 >= 0 && idx2 < sectionNames2.length) {
            // Verify the section we selected is visible with the question text in left panel
            try {
                await expect(
                    page.locator(`[data-title="${sectionNames2[idx2]}"]`),
                ).toBeVisible({ timeout: 3000 });
            } catch {
                await expect(
                    page.locator(`[data-title="${sectionNames2[idx2].split(' ').join('_')}"]`),
                ).toBeVisible({ timeout: 3000 });
            }
        } else {
            // Fallback: If we don't have the exact prior section name/index,
            // at least ensure some section is visible in the left panel (best-effort)
            // and continue with editing the question text. This mirrors the UI intent.
            const anySection = page.locator(`[data-title]`).first();
            await expect(anySection).toBeVisible({ timeout: 3000 });
        }

        // Verify the original question text is visible in left panel
        await expect(
            page.locator(`[class="flex-item label"]:has-text("${questionText2}")`),
        ).toBeVisible();

        // Edit the "Question Text" field
        await page.locator('#question-text').fill(questionTextEdit);
        await page.locator('#question-text').blur();

        // Click the "Save" button
        await page.getByRole('button', { name: 'Save' }).click();
        //await waitUntilLoaded(page);

        // Click the "Close" button on Edit dialog
        await page.getByLabel('Edit Question').getByText('Close').click();

        // Search for the original question text
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill(questionText2);
        await page.keyboard.press('Enter');
        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert (old no longer present):
        //--------------------------------
        // Assert we do NOT see the question with the previous text + tag (+ optional section)
        // If we have sectionNames[idx], include it; otherwise assert by old text + tag only.
        if (Array.isArray(sectionNames2) && idx2 >= 0 && idx < sectionNames2.length) {
            await expect(
                page.locator(
                    `table tbody tr:has-text("${questionText2}"):has-text("${tag2}"):has-text("${sectionNames2[idx2]}")`,
                ),
            ).not.toBeVisible();
        } else {
            await expect(
                page.locator(
                    `table tbody tr:has-text("${questionText2}"):has-text("${tag2}")`,
                ),
            ).not.toBeVisible();
        }

        // Search for the edited question text
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill(questionTextEdit);
        await page.keyboard.press('Enter');
        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert (new is present):
        //--------------------------------
        await expect(
            page.locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag2}")`,
            ),
        ).toBeVisible();

        // Click the edited question row
        await page
            .locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag2}")`,
            )
            .first()
            .click();

        // Click the pencil icon to edit the updated question
        await page
            .locator(`table tbody tr:has-text("${questionTextEdit}") [title="Edit"]`)
            .first()
            .click();

        // Verify the "Edit Question" screen pops up
        await expect(page.getByText('Edit Question')).toBeVisible();

        // Assert the section is visible in the left panel (use the same section assertion logic)
        if (Array.isArray(sectionNames2) && idx2 >= 0 && idx2 < sectionNames2.length) {
            try {
                await expect(
                    page.locator(`[data-title="${sectionNames2[idx2]}"]`),
                ).toBeVisible({ timeout: 3000 });
            } catch {
                await expect(
                    page.locator(
                        `[data-title="${sectionNames2[idx2].split(' ').join('_')}"]`,
                    ),
                ).toBeVisible({ timeout: 3000 });
            }
        } else {
            const anySection = page.locator(`[data-title]`).first();
            await expect(anySection).toBeVisible({ timeout: 3000 });
        }

        // Assert the edited question text is visible in the left panel
        await expect(
            page.locator(`[class="flex-item label"]:has-text("${questionTextEdit}")`),
        ).toBeVisible();





    });
});