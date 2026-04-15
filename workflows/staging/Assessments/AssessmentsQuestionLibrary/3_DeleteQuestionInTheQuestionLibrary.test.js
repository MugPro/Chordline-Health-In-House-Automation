// File: tests/3_DeleteQuestionInTheQuestionLibrary.test.js
// Purpose: Delete the edited question from the Question Library that was created/edited in prior tests.
//          If an edited question cannot be found, the test will skip with a clear message.
//
// Assumptions:
// - This test follows after `2_EditQuestionInTheQuestionLibrary.test.js`.
// - The edited question text starts with `QAWolf-` (e.g., stored as `questionTextEdit` in the prior test).
// - Tag used is `QAW` unless overridden by env var.
//
// Optional environment variables to pass data across tests:
//   QA_QUESTION_TEXT_EDIT   -> the edited question text (e.g., "QAWolf-...") to specifically target
//   QA_TAG                  -> tag applied to the question (defaults to "QAW")
//
// Utilities:
// - Uses Node20Helpers.logIn() and waitUntilLoaded() for auth/navigation and loader waits.

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test.describe('Question Library - Delete Question', () => {
    test('Delete the edited QAWolf question from the library', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const tag = process.env.QA_TAG || 'QAW';
        let questionTextEdit = process.env.QA_QUESTION_TEXT_EDIT || '';

        // Log in with the Question Library user
        const { page, context, browser } = await logIn({ loginID: 'QuestionLib' });

        // Navigate to Tools > Assessments > Question Library
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();
        await page.getByText('Question Library').click();

        // If the Edit Question dialog happens to be open (carried over from a prior test run in the same session),
        // close it before proceeding to deletion steps.
        try {
            await page.getByLabel('Edit Question').getByText('Close').click({ timeout: 1500 });
        } catch {
            // It's okay if it's not open
        }

        // Identify the edited question row:
        // If the exact edited text was not provided, search for a QAWolf-* row with the tag and use the first match.
        const search = page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...');
        await search.click();
        await search.press('Control+A');
        await search.press('Delete');

        if (questionTextEdit) {
            await search.fill(questionTextEdit);
        } else {
            await search.fill('QAWolf-');
        }
        await page.keyboard.press('Enter');
        await waitUntilLoaded(page);

        // Build a locator for the target row, preferring the exact edited text if known.
        const targetRow = questionTextEdit
            ? page.locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag}")`,
            ).first()
            : page.locator(
                `table tbody tr:has-text("QAWolf-"):has-text("${tag}")`,
            ).first();

        // If nothing is found, skip the test with a clear message.
        if (await targetRow.count() === 0) {
            test.skip(
                true,
                'No edited QAWolf-* question found to delete. Ensure 2_EditQuestionInTheQuestionLibrary.test.js ran successfully.',
            );
            await context.close();
            await browser.close();
            return;
        }

        // If we didn't have the exact edited text, attempt to extract it from the row for precise targeting.
        if (!questionTextEdit) {
            const rowText = (await targetRow.innerText()).trim();
            const match = rowText.match(/QAWolf-[^\n\r\t]+/);
            questionTextEdit = match ? match[0].trim() : 'QAWolf-';
        }

        //--------------------------------
        // Act:
        //--------------------------------
        // Click the question row
        await page
            .locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag}")`,
            )
            .first()
            .click();

        // Click the trashcan icon in that row
        await page
            .locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag}") [title="Delete"]`,
            )
            .first()
            .click();

        // Confirm deletion on the Warning popup
        await page.getByRole('button', { name: 'Yes' }).click();
        await waitUntilLoaded(page);

        // Re-search by the edited text to verify it's gone
        await search.click();
        await search.press('Control+A');
        await search.press('Delete');
        await search.fill(questionTextEdit);
        await page.keyboard.press('Enter');
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert:
        //--------------------------------
        await expect(
            page.locator(
                `table tbody tr:has-text("${questionTextEdit}"):has-text("${tag}")`,
            ),
        ).not.toBeVisible();

        // Close resources
        await context.close();
        await browser.close();
    });
});
