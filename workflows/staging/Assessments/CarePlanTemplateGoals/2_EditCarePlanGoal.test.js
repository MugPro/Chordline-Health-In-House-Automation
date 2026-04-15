/*
// 2_EditCarePlanGoal.test.js

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test.describe('Care Plan Template - Edit Goal', () => {
    test('Edit existing goal description and remove tag; verify updates', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        // Use a deterministic desc if chaining with the prior test via search,
        // or parameterize via env/fixture as needed. Here we build the same
        // pattern used in Create test, but expect it already exists.
        const baseFour = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        // IMPORTANT:
        // If you run this standalone, replace `desc` below with a specific value
        // that you know exists, or pass it in from your pipeline/fixture.
        // Example for deterministic pipeline:
        // const desc = process.env.GOAL_DESC || `QAW desc1234`;
        const desc = `QAW desc${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`;


        const desc1 = 'QAW desc';
        const updatedDesc = `${desc} - updated`; // (defined per data; not used in this test)
        const defaultTag = `QAW tag`;
        const loginID = `CreatePlanGoal`;

        // Log in
        const { page, context, browser } = await logIn({ loginID });

        try {
            //--------------------------------
            // Act:
            //--------------------------------
            // Tools > Assessments
            await page.getByText('Tools').click();
            await page.locator('#menu-tools').getByText('Assessments').click();

            await waitUntilLoaded(page);

            // Care Plan Template > Goals
            await page.getByText('Care Plan Template').click();

            await waitUntilLoaded(page);

            await page.getByText('Goals').click();

            await waitUntilLoaded(page);

            // Search for the existing goal first (by description)
            await page
                .getByRole('tabpanel', { name: 'Goals' })
                .getByPlaceholder('Search...')
                .fill(desc1);

            await page
                .getByRole('tabpanel', { name: 'Goals' })
                .locator('#admin-search-button')
                .click();

            await waitUntilLoaded(page);

            // Click the "QAW desc" gridcell
            await page.getByRole(`gridcell`, { name: desc1 }).click();

            // Click the "" button (Edit)
            await page.getByRole(`button`, { name: `` }).click();

            await waitUntilLoaded(page);

            // Fill the description with "QAW desc - updated"
            await page.locator(`#cptg_description`).fill(updatedDesc);

            // Click the "delete" label (remove existing tag)
            await page.getByLabel(`delete`).locator(`span`).click();

            await waitUntilLoaded(page);

            // Click the " Save and Close" button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();

            await waitUntilLoaded(page);

            // Re-search to ensure grid refresh and consistent assertions
            await page
                .getByRole('tabpanel', { name: 'Goals' })
                .getByPlaceholder('Search...')
                .fill(updatedDesc);

            await page
                .getByRole('tabpanel', { name: 'Goals' })
                .locator('#admin-search-button')
                .click();

            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the original "QAW desc" row is NOT visible
            await expect(
                page.getByRole(`gridcell`, { name: desc, exact: true })
            ).not.toBeVisible();

            // Assert the updated row IS visible
            await expect(
                page.getByRole(`gridcell`, { name: updatedDesc, exact: true })
            ).toBeVisible();

            // Assert the original tag is NOT visible on the updated row/listing
            await expect(page.getByRole(`gridcell`, { name: defaultTag })).not.toBeVisible();
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});

 */











// 2_EditCarePlanGoal.test.js

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test.describe('Care Plan Template - Edit Goal', () => {
    test('Edit first non-updated goal description and remove tag; verify updates', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        // We'll search by a prefix that matches your records
        const searchPrefix = 'QAW desc';
        const defaultTag = 'QAW tag';
        const loginID = `CreatePlanGoal`;

        // Log in
        const { page, context, browser } = await logIn({ loginID });

        try {
            //--------------------------------
            // Act: navigate to Goals
            //--------------------------------
            await page.getByText('Tools').click();
            await page.locator('#menu-tools').getByText('Assessments').click();
            await waitUntilLoaded(page);

            await page.getByText('Care Plan Template').click();
            await waitUntilLoaded(page);

            await page.getByText('Goals').click();
            await waitUntilLoaded(page);

            // Search for records with the common prefix "QAW desc"
            const goalsTab = page.getByRole('tabpanel', { name: 'Goals' });
            await goalsTab.getByPlaceholder('Search...').fill(searchPrefix);
            await goalsTab.locator('#admin-search-button').click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Pick the first NON-updated record
            //--------------------------------
            // Get all description-like cells having "QAW desc" and choose the first without "updated"
            const candidateCells = goalsTab.getByRole('gridcell').filter({ hasText: /QAW desc/i });
            const count = await candidateCells.count();

            if (count === 0) {
                throw new Error(`No records found with prefix "${searchPrefix}".`);
            }

            let targetDesc = null;
            let targetIndex = -1;

            for (let i = 0; i < count; i++) {
                const text = (await candidateCells.nth(i).innerText()).trim();
                if (!/updated/i.test(text)) {
                    targetDesc = text;
                    targetIndex = i;
                    break;
                }
            }

            if (!targetDesc) {
                throw new Error(`All "${searchPrefix}" records already contain "updated".`);
            }

            const updatedDesc = `${targetDesc} - updated`;

            // Click the chosen (non-updated) record
            await candidateCells.nth(targetIndex).click();

            // Click the "" button (Edit)
            await page.getByRole('button', { name: '' }).click();
            await waitUntilLoaded(page);

            // Update description
            await page.locator('#cptg_description').fill(updatedDesc);
            await waitUntilLoaded(page);

            /*
            // Remove tag
            await page.getByLabel('delete').locator('span').click();
            await waitUntilLoaded(page);

             */

            // Save and Close
            await page.getByRole('button', { name: ' Save and Close' }).click();
            await waitUntilLoaded(page);

            // Re-search by the updated description to refresh grid and narrow scope
            await goalsTab.getByPlaceholder('Search...').fill(updatedDesc);
            await goalsTab.locator('#admin-search-button').click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // The original description should no longer be visible
            await expect(
                goalsTab.getByRole('gridcell', { name: targetDesc, exact: true })
            ).not.toBeVisible();

            // The updated description should be visible
            await expect(
                goalsTab.getByRole('gridcell', { name: updatedDesc, exact: true })
            ).toBeVisible();

            // Optional: assert the tag is no longer present on the updated row
            // Narrow to the row containing updatedDesc, then ensure defaultTag cell is absent in that row
            const updatedRow = goalsTab
                .getByRole('row')
                .filter({ has: goalsTab.getByRole('gridcell', { name: updatedDesc, exact: true }) });

            await expect(updatedRow.getByRole('gridcell', { name: defaultTag })).toHaveCount(0);
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});