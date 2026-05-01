// CreateUpdateAndDeleteForm.test.js

/*await page.getByRole('gridcell', { name: 'Have you been diagnosed with' }).click();
  await page.getByRole('button', { name: 'Select', exact: true }).click();
*/

import { test, expect } from '@playwright/test';

// 🔧 Match your helpers location (as in your last passing test)
import {
    logIn,
    waitUntilLoaded,
    reportCleanupFailed, logIn3,
} from '../../../../helpers/Node20Helpers.js';

// Random data generator
import { faker } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

/**
 * This test:
 * 1) Logs in
 * 2) Navigates to Tools > Forms
 * 3) Cleans up any existing FormCrud* forms
 * 4) Creates a new form with 3 random sections and 3 questions
 * 5) Verifies sections and questions in Edit Form
 * 6) Edits the question texts
 * 7) Verifies edits
 * 8) Deletes the form and verifies it is removed
 */

test('Create, update, and delete a Form', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `FormsCrud`;
    const formName = `FormCrud${Date.now()}`;

    const randomIdxsHelper = (min, max, count = 3) => {
        const range = [];
        for (let i = min; i <= max; i++) range.push(i);

        // Shuffle (Fisher–Yates)
        for (let i = range.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [range[i], range[j]] = [range[j], range[i]];
        }
        return range.slice(0, count);
    };

    // Log in
   // const { page } = await logIn({ loginID });


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });




    // Navigate to Tools > Forms
    await page.getByText(`Tools`).click();
    await page.getByText(`Forms`, { exact: true }).click();
    await waitUntilLoaded(page);

    // Verify the "Manage Forms" is visible
    await expect(page.getByText(`Manage Forms`)).toBeVisible();

    //--------------------------------
    // Cleanup:
    //--------------------------------
    // Search for existing "FormCrud" items
    await page
        .getByRole(`dialog`, { name: `Manage Forms` })
        .getByPlaceholder(`Search...`)
        .fill(`FormCrud`);
    await page.keyboard.press('Enter');
    await waitUntilLoaded(page);

    try {
        // If there are results, delete them
        try {
            // Verify the count is 0 (if no results, this passes)
            await expect(
                page.locator(
                    `[id="browse-grid"] table tbody tr:has-text("FormCrud") [title="Delete"]`
                )
            ).toHaveCount(0, { timeout: 3000 });
        } catch {
            // Otherwise, delete all
            let count = await page
                .locator(
                    `[id="browse-grid"] table tbody tr:has-text("FormCrud") [title="Delete"]`
                )
                .count();

            for (let i = 0; i < count; i++) {
                // Click the first form row
                await page
                    .locator(`[id="browse-grid"] table tbody tr:has-text("FormCrud")`)
                    .first()
                    .click();

                // Click trashcan icon
                await page
                    .locator(
                        `[id="browse-grid"] table tbody tr:has-text("FormCrud") [title="Delete"]`
                    )
                    .first()
                    .click();

                // Confirm Yes
                await page.getByRole(`button`, { name: `Yes` }).click();
                await waitUntilLoaded(page);
            }
        }
    } catch (e) {
        await reportCleanupFailed({
            dedupKey: 'formsCRUD',
            errorMsg: e.message,
        });
    }

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+ New" button
    // Using a more resilient selector to handle potential &nbsp; rendering
    await page.getByRole(`button`, { name: /New/i }).click();
    await waitUntilLoaded(page);

    // Verify the "New Form" page pops up
    await expect(page.getByText(`New Form`)).toBeVisible();

    // Fill in the form name
    await page.locator(`#form_name`).fill(formName);
    await page.locator(`#form_name`).blur();

    // Click the Sections dropdown
    await page.getByText(`Sections`).click();

    // Grab the section locators and names
    const sectionLocators = await page
        .locator(`[id="manage-rules-sections"] ul li`)
        .all();

    const sectionNames = await page
        .locator(`[id="manage-rules-sections"] ul li span[class="k-menu-link-text"]`)
        .allInnerTexts();

    const threeRandomIndexes = randomIdxsHelper(0, sectionLocators.length - 1);

    // Check the selected sections
    for (let idx of threeRandomIndexes) {
        await sectionLocators[idx]
            .locator(`input[type="checkbox"]`)
            .check({ force: true });
    }

    await waitUntilLoaded(page);

    // Click the first "+ Question" button
    await page
        .locator(`button:visible:has-text("Question")`)
        .first()
        .click({ force: true });

    //await waitUntilLoaded(page);

    // Click the "Add a new question" dropdown
    await page.getByText(`Question Library`, { exact: true }).nth(2).click();

    //await waitUntilLoaded(page);

    // Grab the locators and names of the drop down options
    const questionDropDownNames = await page
        .locator(`[data-role="popup"]:visible ul li`)
        .allInnerTexts();

    const threeRandomIndexes2 = randomIdxsHelper(
        0,
        questionDropDownNames.length - 1
    );

    await waitUntilLoaded(page);

    // Close the drop down
    await page
        .locator(`#new-question-tool-tip-div_tb_active`)
        .getByTitle(`Close`)
        .click();

    await waitUntilLoaded(page);

    // Click the + Question for each section and add a question
    let idx2 = 0;
    for (let idx of threeRandomIndexes2) {
        // Click the question button and increment idx2
        await page
            .locator(`button:visible:has-text("Question")`)
            .nth(idx2)
            .click({ force: true });
        await waitUntilLoaded(page);
        idx2++;

        //await waitUntilLoaded(page);

        // Click the Question drop down
        await page.locator(`[aria-controls="fieldTypes_listbox"]`).click();

       // await waitUntilLoaded(page);

        // Grab the name and click that option
        let name = questionDropDownNames[idx];
        await page
            .locator(`[id="fieldTypes_listbox"]:visible li div:text-is("${name}")`)
            .click();

        //await waitUntilLoaded(page);

        // Click add button
        await page.getByRole(`button`, { name: `Add`, exact: true }).click();

        await waitUntilLoaded(page);

        // Special cases
        if (name.trim() === 'Question Library') {
            await page.getByRole('gridcell', { name: 'Have you been diagnosed with' }).click();

            await waitUntilLoaded(page);
            await page.getByRole(`button`, { name: `Select`, exact: true }).click();
        }



        await waitUntilLoaded(page);

        if (name.trim() === 'Lookup') {
            await page
                .locator(`input[name="fieldQuestionLookupTable_input"]`)
                .fill('Activity Type');
            await waitUntilLoaded(page);
            await page.getByRole(`option`, { name: `Activity Type` }).click();
        }

        await waitUntilLoaded(page);
    }

    // Click the "Save" button
    await page.getByRole(`button`, { name: `Save` }).click();
    await waitUntilLoaded(page);

    // Click the close button
    await page.getByLabel(`New Form`).getByText(`Close`).click();
    await waitUntilLoaded(page);

    // Search for the form
    await page
        .getByRole(`dialog`, { name: `Manage Forms` })
        .getByPlaceholder(`Search...`)
        .fill(formName);
    await page.keyboard.press('Enter');
    await waitUntilLoaded(page);

    // Double click the form to open up the edit page
    await page.getByRole(`gridcell`, { name: formName }).dblclick();
    await waitUntilLoaded(page);

    // Expect "Edit Form" to be visible
    await expect(page.getByText(`Edit Form`)).toBeVisible();

    //--------------------------------
    // Assert: Creation (Sections & Questions)
    //--------------------------------
    // Assert the three sections are visible
    for (let idx of threeRandomIndexes) {
        let name = sectionNames[idx];
        if (name === 'Administrative') {
            if (idx === 7) name = 'Administrative_Footer';
            else name = 'Administrative_Header';
        }
        await expect(
            page.locator(
                `[data-title="${name.split(' ').join('_')}"]:text-is("${sectionNames[idx]}")`
            )
        ).toBeVisible({ timeout: 3000 });
    }

    // Assert the 3 questions are visible
    for (let idx of threeRandomIndexes2) {
        let name = questionDropDownNames[idx];
        await expect(
            page.locator(`div[class="flex-item label"]:has-text("${name.trim()}")`)
        ).toBeVisible({ timeout: 3000 });
    }

    //--------------------------------
    // Arrange: Prepare edits for question texts
    //--------------------------------
    const questionTexts = Array(3)
        .fill(``)
        .map(() => faker.lorem.words(2));

    //--------------------------------
    // Act: Update question texts
    //--------------------------------
    for (let i = 0; i < threeRandomIndexes2.length; i++) {
        // Grab the index and the name of the question
        let idx = threeRandomIndexes2[i];
        let name = questionDropDownNames[idx];

        // Click the question (fallback to drag-field if label not clickable)
        try {
            await page
                .locator(`div[class="flex-item label"]:has-text("${name.trim()}")`)
                .click({ timeout: 3000 });
        } catch {
            if (name.trim() === 'Date Time') name = 'Datetime';
            await page
                .locator(`[class*="drag-field"][data-type*="${name.trim()}"]`)
                .click({ timeout: 3000 });
        }

        await waitUntilLoaded(page);

        // Edit the question text
        await page.locator(`#question-text`).fill(questionTexts[i]);
        await page.locator(`#question-text`).blur();
    }

    await waitUntilLoaded(page);

    // Click the Save button
    await page.getByRole(`button`, { name: `Save` }).click();
    await waitUntilLoaded(page);

    // Click Close
    await page.getByLabel(`Edit Form`).getByText(`Close`).click();
    await waitUntilLoaded(page);

    // Double click the form to open up the edit page again
    await page.getByRole(`gridcell`, { name: formName }).dblclick();
    await waitUntilLoaded(page);

    // Expect "Edit Form" to be visible
    await expect(page.getByText(`Edit Form`)).toBeVisible();

    //--------------------------------
    // Assert: After Update
    //--------------------------------
    // Sections should still be visible
    for (let idx of threeRandomIndexes) {
        let name = sectionNames[idx];
        if (name === 'Administrative') {
            if (idx === 7) name = 'Administrative_Footer';
            else name = 'Administrative_Header';
        }
        await expect(
            page.locator(
                `[data-title="${name.split(' ').join('_')}"]:text-is("${sectionNames[idx]}")`
            )
        ).toBeVisible({ timeout: 3000 });
    }

    // Edited questions visible
    for (let i = 0; i < questionTexts.length; i++) {
        let name = questionTexts[i];
        await expect(
            page.locator(`div[class="flex-item label"]:has-text("${name.trim()}")`)
        ).toBeVisible({ timeout: 3000 });
    }

    //--------------------------------
    // Arrange: Close Edit page
    //--------------------------------
    await page.getByLabel(`Edit Form`).getByText(`Close`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Delete the form
    //--------------------------------
    // Click the trashcan icon on the table row for the form
    await page
        .locator(
            `[id="browse-grid"] table tbody tr:has-text("${formName}") [title="Delete"]`
        )
        .click();

    //await waitUntilLoaded(page);

    // Verify the warning message pops up
    await expect(page.getByText(`Warning`)).toBeVisible();
    await expect(
        page.getByText(`Are you sure you want to delete the '${formName}' form?`)
    ).toBeVisible();

    // Click the Yes button
    await page.getByRole(`button`, { name: `Yes` }).click();
    await waitUntilLoaded(page);

    // Search for the form name again
    await page
        .getByRole(`dialog`, { name: `Manage Forms` })
        .getByPlaceholder(`Search...`)
        .fill(formName);
    await page.keyboard.press('Enter');
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Deleted
    //--------------------------------
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${formName}") [title="Delete"]`
        )
    ).not.toBeVisible();

    // Close the page
    await page.close();
});