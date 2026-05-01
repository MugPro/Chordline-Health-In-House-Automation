/*

// File: tests/CreateAndEditCarePlanGoal.test.js
// Purpose: Create a new Care Plan Goal with a random description and a default tag,
//          then verify the goal and tag appear in the Goals grid.

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test.describe('Care Plan Template - Create Goal', () => {
    test('Create a new goal and verify it appears with the correct tag', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const desc = `QAW desc${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`;
        const updatedDesc = `${desc} - updated`; // (defined per data; not used in this test)
        const defaultTag = `QAW tag`;
        const loginID = `CreatePlanGoal`;

        // Log in
        const { page, context, browser } = await logIn({ loginID });

        //--------------------------------
        // Act:
        //--------------------------------
        // Tools > Assessments
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();

        //await waitUntilLoaded(page);

        // Care Plan Template > Goals
        await page.getByText('Care Plan Template').click();

        await waitUntilLoaded(page);

        await page.getByText('Goals').click();

        await waitUntilLoaded(page);

        // New
        await page.getByRole('button', { name: ' \u00A0New' }).click();

        await waitUntilLoaded(page);

        // Fill description textarea
        await page.locator('textarea').first().fill(desc);

        await waitUntilLoaded(page);




        // Expand combobox and choose "Immediate Need"
        await page.getByRole('button', { name: 'expand combobox' }).first().click();

        await waitUntilLoaded(page);


        await page.getByText('Immediate Need').click();






// Small guard in case the widget shows an "Error" dialog after selection
        const errorDialog = page.getByText('Error').first();
        if (await errorDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
            await page.getByRole('button', { name: 'Okay' }).click();

            // Expand combobox and choose "Immediate Need"
            await page.getByRole('button', { name: 'expand combobox' }).first().click();

            await waitUntilLoaded(page);


            await page.getByText('Immediate Need').click();
        }





        await waitUntilLoaded(page);

        // Tags input
        await page.locator('[aria-autocomplete="list"]').first().click();
        await waitUntilLoaded(page);
        await page.keyboard.type(defaultTag);
        await waitUntilLoaded(page);
        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        // Save and Close
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);


        //await page.getByText('Goals').click();

       // await waitUntilLoaded(page);

        // Search in Goals tab panel for our newly created goal
        await page
            .getByRole('tabpanel', { name: 'Goals' })
            .getByPlaceholder('Search...')
            .fill(desc);

       // await waitUntilLoaded(page);

        await page
            .getByRole('tabpanel', { name: 'Goals' })
            .locator('#admin-search-button')
            .click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert:
        //--------------------------------
        // Verify the new goal row (by description) is visible
        await expect(page.getByRole('gridcell', { name: desc })).toBeVisible();

        // Verify the tag cell is visible
        await expect(page.getByRole('gridcell', { name: defaultTag })).toBeVisible();

        // Cleanup resources
        await context.close();
        await browser.close();
    });
});

 */


















import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test.describe('Care Plan Template - Create Goal', () => {
    test('Create a new goal and verify it appears with the correct tag', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const desc = `QAW desc${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`;
        const updatedDesc = `${desc} - updated`; // (defined per data; not used in this test)
        const defaultTag = `QAW tag`;
        const loginID = `CreatePlanGoal`;

        // Log in
        //const { page, context, browser } = await logIn({ loginID });


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });

        //--------------------------------
        // Act:
        //--------------------------------
        // Tools > Assessments
        await page.getByText('Tools').click();
        await page.locator('#menu-tools').getByText('Assessments').click();

        //await waitUntilLoaded(page);

        // Care Plan Template > Goals
        await page.getByText('Care Plan Template').click();

        await waitUntilLoaded(page);

        await page.getByText('Goals').click();


        // New
        await page.getByRole('button', { name: ' \u00A0New' }).click();

        await waitUntilLoaded(page);

        // Fill description textarea
        await page.locator('textarea').first().fill(desc);

        await waitUntilLoaded(page);

        // Expand combobox and choose "Immediate Need"
        await page.getByRole('button', { name: 'expand combobox' }).first().click();

        await page.getByText('Immediate Need').click();







        await waitUntilLoaded(page);

        // Tags input
        await page.locator('[aria-autocomplete="list"]').first().click();
        await page.keyboard.type(defaultTag);
        await waitUntilLoaded(page);
        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        // Save and Close
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);


        //await page.getByText('Goals').click();

        // await waitUntilLoaded(page);

        // Search in Goals tab panel for our newly created goal
        await page
            .getByRole('tabpanel', { name: 'Goals' })
            .getByPlaceholder('Search...')
            .fill(desc);

        // await waitUntilLoaded(page);

        await page
            .getByRole('tabpanel', { name: 'Goals' })
            .locator('#admin-search-button')
            .click();
        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert:
        //--------------------------------
        // Verify the new goal row (by description) is visible
        await expect(page.getByRole('gridcell', { name: desc })).toBeVisible();

        // Verify the tag cell is visible
        await expect(page.getByRole('gridcell', { name: defaultTag })).toBeVisible();

        // Cleanup resources
        await context.close();
        await browser.close();
    });
});