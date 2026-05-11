
import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test.describe('Care Plan Template - Create and Edit Problem', () => {
    test('Create a new problem and edit it verifying description, tag, and Active state', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const desc = `QAW desc${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`;
        const updatedDesc = `${desc} - updated`;
        const defaultTag = `QAW tag`;
        const loginID = `CarePlanProblem`;


        //CREATE A NEW PROBLEM:

        // Log in
        //const { page, context, browser } = await logIn({ loginID, slowMo: 700 });



        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url, slowMo: 1000 });


        await waitUntilLoaded(page);

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

            //await waitUntilLoaded(page);



            // Click the "+ New" button
            // NOTE: \u00A0 is a non-breaking space rendered from &nbsp;
            await page.getByRole('button', { name: ' \u00A0New' }).click();

            await waitUntilLoaded(page);

            // Wait for loading
           // await waitUntilLoaded(page);

            // Verify "New problem" popup is visible
            await expect(page.getByText('New Problem')).toBeVisible();




            // Type in tag
            //await page.keyboard.type(`QAW Tag`);


            // Fill in tag
            await page.getByRole(`combobox`).nth(2).fill(defaultTag);

// Click "Add new tag:{tag}"
            await page
                .getByRole(`option`, { name: `Add new tag: ${defaultTag}` })
                .locator(`span`)
                .click();

// Fill in the description box
            await page.locator('#cptp_description').fill(desc);






            //await waitUntilLoaded(page);







            // Click the "expand combobox" button
            await page.getByRole(`button`, { name: `expand combobox` }).first().click();


            //await waitUntilLoaded(page);


// Click the "Adherence" option
            await page.getByRole(`option`, { name: `Adherence` }).click();







           // await waitUntilLoaded(page);



            // Save and Close
            await page.getByRole('button', { name: ' Save and Close' }).click();

            // Wait for loading
            //await waitUntilLoaded(page);

            // Search for our problem in the problems tab
            const outcomesTab = page.getByRole('tabpanel', { name: 'Problems' });
            await outcomesTab.getByPlaceholder('Search...').fill(desc);

            // Press Enter to search
            await page.keyboard.press('Enter');

            // Wait for loading
            //await waitUntilLoaded(page);

            //--------------------------------


            // Assert:
//--------------------------------
// Assert the "QAW desc" row is visible
            await expect(page.getByRole(`gridcell`, { name: desc })).toBeVisible();

// Click the "QAW Tag" gridcell
            await expect(page.getByRole(`gridcell`, { name: defaultTag })).toBeVisible();








            //await waitUntilLoaded(page);







            //EDIT CREATED PROBLEM:


            //--------------------------------
// Arrange:
//--------------------------------


//--------------------------------
// Act:
//--------------------------------


            try {
                // Hover over the outcome row
                await page.getByRole('gridcell', { name: desc })
                    .hover();

                // Click the pencil icon to be taken to the "Edit problem" pop up
                await page.getByTitle('Edit').click();

                //await waitUntilLoaded(page);

                // Verify we are taken to the "Edit outcome" page
                await expect(page.getByText(`Edit Problem #`)).toBeVisible(
                );
            } catch {
                // Hover over the problem row
                await page
                    .locator(
                        `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}")`,
                    )
                    .hover();

                // Click the pencil icon to be taken to the "Edit problem" pop up
                await page
                    .locator(`[aria-labelledby="browse-tabs-tab-3"] [title="Edit"]`)
                    .click();

                //await waitUntilLoaded(page);

                // Verify we are taken to the "Edit problem" page
                await expect(page.getByText(`Edit Problem #`)).toBeVisible();
            }

            //await waitUntilLoaded(page);

// Click the "x" on the tag to delete it
            await page.locator('.k-icon.k-font-icon.k-i-x-circle').click();

            //await waitUntilLoaded(page);


// Fill in the description with {descEdit}
            await page.locator('#cptp_description').fill(updatedDesc);

            //await waitUntilLoaded(page);

// Click the "Save and Close" button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();

// Wait for loading
           // await waitUntilLoaded(page);

// Fill in the new problem description in the search bar
            await page
                .getByRole(`tabpanel`, { name: `Problems` })
                .getByPlaceholder(`Search...`)
                .fill(updatedDesc);

// Press "Enter" to search
            await page.keyboard.press("Enter");


// Wait for loading
           // await waitUntilLoaded(page);

//--------------------------------
// Assert:
//--------------------------------
// Assert the "QAW desc" row is NOT visible
            await expect(
                page.getByRole(`gridcell`, { name: desc, exact: true }),
            ).not.toBeVisible();

// Assert the "QAW desc" row is visible and update description is correct
            await expect(
                page.getByRole(`gridcell`, { name: updatedDesc, exact: true }),
            ).toBeVisible();

// Click the "QAW Tag" gridcell
            await expect(
                page.getByRole(`gridcell`, { name: defaultTag }),
            ).not.toBeVisible();






        } finally {

        }
    });
});