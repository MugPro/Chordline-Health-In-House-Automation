
import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test.describe('Care Plan Template - Create and Edit Outcomes', () => {
    test('Create a new outcomes and edit it verifying description, tag, and Active state', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `CarePlanOutCo`;
        const desc = `QAWOutc-${Date.now()}`;
        const tag = `QAW tag`;


        //CREATE A NEW OUTCOME:

        // Log in
        //const { page, context, browser } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });

        try {
            //--------------------------------
            // Act:
            //--------------------------------
            // Click "Tools" dropdown
            await page.locator('span').filter({ hasText: 'Tools' }).first().click();

            // Click "Assessments"
            await page.locator('#menu-tools').getByText('Assessments').click();

            // Click "Care Plan Template"
            await page.getByText('Care Plan Template').click();

            await waitUntilLoaded(page);

            // Click the "Outcomes" tab
            await page.getByText('Outcomes').click();

            // Click the "+ New" button
            // NOTE: \u00A0 is a non-breaking space rendered from &nbsp;
            await page.getByRole('button', { name: ' \u00A0New' }).click();

            // Wait for loading
            await waitUntilLoaded(page);

            // Verify "New Outcome" popup is visible
            await expect(page.getByText('New Outcome')).toBeVisible();





            // Fill in tag
            await page.getByRole(`combobox`).nth(2).fill(tag);

// Click "Add new tag:{tag}"
            await page
                .getByRole(`option`, { name: `Add new tag: ${tag}` })
                .locator(`span`)
                .click();

// Fill in the description box
            await page.locator(`#cpto_description`).fill(desc);






            await waitUntilLoaded(page);






            // Click the "Type" input
            await page.getByRole(`button`, { name: `expand combobox` }).click();

// Grab all the Types
            const types = await page
                .locator(`[role="region"] li:visible`)
                .allInnerTexts();
            console.log(types)
// Grab a random idx
            const idx = Math.floor(Math.random() * types.length);

// Pick on type randomly
            const type = types[idx];

            await waitUntilLoaded(page);

// Select option {type}
            await page.locator(`[role="region"] li :text-is("${type}"):visible`).click()





            await waitUntilLoaded(page);



            // Save and Close
            await page.getByRole('button', { name: ' Save and Close' }).click();

            // Wait for loading
            await waitUntilLoaded(page);

            // Search for our outcome in the Outcomes tab
            const outcomesTab = page.getByRole('tabpanel', { name: 'Outcomes' });
            await outcomesTab.getByPlaceholder('Search...').fill(desc);

            // Press Enter to search
            await page.keyboard.press('Enter');

            // Wait for loading
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert we see our Outcome with the correct description
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTO"] table tbody tr:has-text("${desc}")`,
                ),
            ).toBeVisible();

// Assert the tags
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTO"] table tbody tr:has-text("${desc}"):has-text("${tag}")`,
                ),
            ).toBeVisible();

// Assert the Outcome is active
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTO"] table tbody tr:has-text("${desc}") td >> nth=2 >> input`,
                ),
            ).toBeChecked();








            //await waitUntilLoaded(page);







            //EDIT CREATED OUTCOME:


            //--------------------------------
// Arrange:
//--------------------------------
            const tagEdit = "QAW Tag Edit";
            const descEdit = `QAWOutcEdit-${Date.now()}`;

//--------------------------------
// Act:
//--------------------------------


            try {
                // Hover over the outcome row
                await page
                    .locator(
                        `[data-browse-code="toolsBrowse_CPTO"] table tbody tr:has-text("${desc}")`,
                    )
                    .hover();

                // Click the pencil icon to be taken to the the "Edit Outcome" pop up
                await page
                    .locator(`[aria-labelledby="browse-tabs-tab-4"] [title="Edit"]`)
                    .click();

                await waitUntilLoaded(page);

                // Verify we are taken to the "Edit outcome" page
                await expect(page.getByText(`Edit Outcome #`)).toBeVisible(
                );
            } catch {
                // Hover over the outcome row
                await page
                    .locator(
                        `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}")`,
                    )
                    .hover();

                // Click the pencil icon to be taken to the "Edit outcome" pop up
                await page
                    .locator(`[aria-labelledby="browse-tabs-tab-3"] [title="Edit"]`)
                    .click();

                //await waitUntilLoaded(page);

                // Verify we are taken to the "Edit outcome" page
                await expect(page.getByText(`Edit Outcome #`)).toBeVisible();
            }

            await waitUntilLoaded(page);

// Click the "x" on the tag to delete it
            await page.getByTitle('clear', { exact: true }).nth(4).click();

            await waitUntilLoaded(page);

// Fill in tag {tagEdit}
            await page.getByRole(`combobox`).nth(2).fill(tagEdit);

            await waitUntilLoaded(page);

// Click "Add new tag:{tagEdit}"
            await page
                .getByRole(`option`, { name: `Add new tag: ${tagEdit}` })
                .locator(`span`)
                .click();

            await waitUntilLoaded(page);

// Uncheck the "Active" checkbox
            await page.getByLabel('', { exact: true }).uncheck();

            await waitUntilLoaded(page);

// Fill in the description with {descEdit}
            await page.locator('#cpto_description').fill(descEdit);

            await waitUntilLoaded(page);

// Click the "Save and Close" button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();

// Wait for loading
            await waitUntilLoaded(page);

// Fill in the new outcome description in the search bar
            await page
                .getByRole(`tabpanel`, { name: `Outcomes` })
                .getByPlaceholder(`Search...`)
                .fill(descEdit);

// Press "Enter" to search
            await page.keyboard.press("Enter");


// Wait for loading
            await waitUntilLoaded(page);

//--------------------------------
// Assert:
//--------------------------------
// Assert we see our Outcome with the correct description edit
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTO"] table tbody tr:has-text("${descEdit}")`,
                ),
            ).toBeVisible();

// Assert the tags {tagEdit}
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTO"] table tbody tr:has-text("${descEdit}"):has-text("${tagEdit}")`,
                ),
            ).toBeVisible();

// Assert the Outcome is not active
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTO"] table tbody tr:has-text("${descEdit}") td >> nth=2 >> input`,
                ),
            ).not.toBeChecked();






        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});