// File: tests/2_EditQuestionInTheQuestionLibrary.test.js
// Purpose: Edit an existing Question in the Question Library that was created in
//          `1_CreateQuestionInAssessmentAndAddItToQuestionLlibrary.test.js`.
//          Updates the question text, saves, verifies it no longer appears with the
//          old text and does appear with the new text, and confirms the section panel contents.
//
// Notes about dependencies:
// - This test assumes the previous test created a question with:
//     * questionText starting with "QAWolf-"
//     * tag "QAW"
//     * a specific section that was chosen at creation time
// - If you share state across tests, you can pass the original values via env vars:
//     QA_QUESTION_TEXT, QA_SECTION_NAMES_JSON (array JSON), QA_SECTION_IDX, QA_TAG
//   Otherwise, this script will search for `QAWolf-` in the Question Library and use
//   the first match it finds as `questionText`, and default `tag = 'QAW'`.
//
// Dependencies:
// - Uses the modern faker API: `faker.word.words(2)` (NOT faker.random).

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';

test.describe('Question Library - Edit Question', () => {
    test('Edit a QAWolf-* question, save, and verify changes', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        // New edited text for the question
        const questionTextEdit = `QAWolf-${faker.word.words(2)}`;

        // Attempt to hydrate prior values from environment (optional)
        let questionText = process.env.QA_QUESTION_TEXT || '';
        let tag = process.env.QA_TAG || 'QAW';

        // Log in as QuestionLib user
        const { page, context, browser } = await logIn({ loginID: 'QuestionLib' });

        // Navigate to Tools > Assessments -> Question Library
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();
        await page.getByText('Question Library').click();

        // If we didn't get a questionText from env/shared context, search for the latest QAWolf- entry
        if (!questionText) {
            const search = page
                .getByRole('dialog', { name: 'Manage Assessments' })
                .getByPlaceholder('Search...');
            await search.click();
            await search.press('Control+A');
            await search.press('Delete');
            await search.fill('QAWolf-');
            await page.keyboard.press('Enter');
            await waitUntilLoaded(page);

            // Ensure at least one result exists to edit
            const firstRow = page.locator(`table tbody tr:has-text("QAWolf-")`).first();
            await expect(firstRow).toBeVisible({ timeout: 5000 });

            // Extract the exact question text from the row content (best-effort parse):
            // If your table has a dedicated "Question" column, update the nth() index accordingly.
            // As a fallback, use the first "QAWolf-..." occurrence in the row text.
            const rowText = (await firstRow.innerText()).trim();
            const match = rowText.match(/QAWolf-[^\n\r\t]+/);
            questionText = match ? match[0].trim() : 'QAWolf-';
        }

        //--------------------------------
        // Act:
        //--------------------------------
        // Click the row for the target question
        await page.locator(`table tbody tr:has-text("${questionText}")`).first().click();

        // Click the pencil icon to edit
        await page
            .locator(`table tbody tr:has-text("${questionText}") [title="Edit"]`)
            .first()
            .click();

        // Verify the "Edit Question" screen pops up
        await expect(page.getByText('Edit Question')).toBeVisible();

        // We need to verify the section is visible on the left panel along with the question.
        // If you have the exact section (sectionNames[idx]) from the previous test, you can pass it as:
        //   process.env.QA_SECTION_NAMES_JSON (stringified array) and process.env.QA_SECTION_IDX
        // Otherwise, we will attempt to locate by either raw name or underscored name
        // based on what the panel renders.

        let sectionNames = [];
        let idx = -1;

        try {
            if (process.env.QA_SECTION_NAMES_JSON) {
                sectionNames = JSON.parse(process.env.QA_SECTION_NAMES_JSON);
            }
            if (process.env.QA_SECTION_IDX) {
                idx = parseInt(process.env.QA_SECTION_IDX, 10);
            }
        } catch {
            // ignore parse errors; we will use fallback checks below
        }

        if (Array.isArray(sectionNames) && idx >= 0 && idx < sectionNames.length) {
            // Verify the section we selected is visible with the question text in left panel
            try {
                await expect(
                    page.locator(`[data-title="${sectionNames[idx]}"]`),
                ).toBeVisible({ timeout: 3000 });
            } catch {
                await expect(
                    page.locator(`[data-title="${sectionNames[idx].split(' ').join('_')}"]`),
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
            page.locator(`[class="flex-item label"]:has-text("${questionText}")`),
        ).toBeVisible();

        // Edit the "Question Text" field
        await page.locator('#question-text').fill(questionTextEdit);
        await page.locator('#question-text').blur();

        // Click the "Save" button
        await page.getByRole('button', { name: 'Save' }).click();
        await waitUntilLoaded(page);

        // Click the "Close" button on Edit dialog
        await page.getByLabel('Edit Question').getByText('Close').click();

        // Search for the original question text
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill(questionText);
        await page.keyboard.press('Enter');
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert (old no longer present):
        //--------------------------------
        // Assert we do NOT see the question with the previous text + tag (+ optional section)
        // If we have sectionNames[idx], include it; otherwise assert by old text + tag only.
        if (Array.isArray(sectionNames) && idx >= 0 && idx < sectionNames.length) {
            await expect(
                page.locator(
                    `table tbody tr:has-text("${questionText}"):has-text("${tag}"):has-text("${sectionNames[idx]}")`,
                ),
            ).not.toBeVisible();
        } else {
            await expect(
                page.locator(
                    `table tbody tr:has-text("${questionText}"):has-text("${tag}")`,
                ),
            ).not.toBeVisible();
        }

        // Search for the edited question text
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill(questionTextEdit);
        await page.keyboard.press('Enter');
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert (new is present):
        //--------------------------------
        await expect(
            page.locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag}")`,
            ),
        ).toBeVisible();

        // Click the edited question row
        await page
            .locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag}")`,
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
        if (Array.isArray(sectionNames) && idx >= 0 && idx < sectionNames.length) {
            try {
                await expect(
                    page.locator(`[data-title="${sectionNames[idx]}"]`),
                ).toBeVisible({ timeout: 3000 });
            } catch {
                await expect(
                    page.locator(
                        `[data-title="${sectionNames[idx].split(' ').join('_')}"]`,
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

        // (Optional) Close the edit dialog at the end
        await page.getByLabel('Edit Question').getByText('Close').click();

        // Close resources
        await context.close();
        await browser.close();
    });
});