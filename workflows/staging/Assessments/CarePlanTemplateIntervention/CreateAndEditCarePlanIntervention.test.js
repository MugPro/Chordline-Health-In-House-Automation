// CreateAndEditCarePlanIntervention.test.js

/*
import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test.describe('Care Plan Template - Create and Edit Intervention', () => {
    test('Create a new intervention and edit it verifying description, tag, and Active state', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = 'CarePlanInter';
        const desc = `QAWInterv-${Date.now()}`;
        const tag = 'QAWInt tag';

        // Log in
        const { page, context, browser } = await logIn({ loginID });

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

            // Click the "Interventions" tab
            await page.getByText('Interventions').click();

            // Click the "+ New" button
            // NOTE: \u00A0 is a non-breaking space rendered from &nbsp;
            await page.getByRole('button', { name: ' \u00A0New' }).click();

            // Wait for loading
            await waitUntilLoaded(page);

            // Verify "New Intervention" popup is visible
            await expect(page.getByText('New Intervention')).toBeVisible();

            // Fill in tag (3rd combobox on the dialog)
            await page.getByRole('combobox').nth(2).fill(tag);

            // Click "Add new tag: {tag}"
            await page.getByRole('option', { name: `Add new tag: ${tag}` }).locator('span').click();

            // Fill in description
            await page.locator('#cpti_description').fill(desc);

            await waitUntilLoaded(page);

            // Save and Close
            await page.getByRole('button', { name: ' Save and Close' }).click();

            // Wait for loading
            await waitUntilLoaded(page);

            // Search for our Intervention in the Interventions tab
            const interventionsTab = page.getByRole('tabpanel', { name: 'Interventions' });
            await interventionsTab.getByPlaceholder('Search...').fill(desc);

            // Press Enter to search
            await page.keyboard.press('Enter');

            // Wait for loading
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the row (by description) is visible
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}")`
                )
            ).toBeVisible();

            // Assert the tag shows on the same row
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}"):has-text("${tag}")`
                )
            ).toBeVisible();

            // Assert the Intervention is active (3rd column input is checked)
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}") td >> nth=2 >> input`
                )
            ).toBeChecked();
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});

 */























import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test.describe('Care Plan Template - Create and Edit Intervention', () => {
    test('Create a new intervention and edit it verifying description, tag, and Active state', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = 'CarePlanInter';
        const desc = `QAWInterv-${Date.now()}`;
        const tag = 'QAWInt tag';


        //CREATE A NEW INTERVENTION:

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

            // Click the "Interventions" tab
            await page.getByText('Interventions').click();

            // Click the "+ New" button
            // NOTE: \u00A0 is a non-breaking space rendered from &nbsp;
            await page.getByRole('button', { name: ' \u00A0New' }).click();

            // Wait for loading
            await waitUntilLoaded(page);

            // Verify "New Intervention" popup is visible
            await expect(page.getByText('New Intervention')).toBeVisible();

            // Fill in tag (3rd combobox on the dialog)
            await page.getByRole('combobox').nth(2).fill(tag);

            // Click "Add new tag: {tag}"
            await page.getByRole('option', { name: `Add new tag: ${tag}` }).locator('span').click();

            // Fill in description
            await page.locator('#cpti_description').fill(desc);

            await waitUntilLoaded(page);

            // Save and Close
            await page.getByRole('button', { name: ' Save and Close' }).click();

            // Wait for loading
            await waitUntilLoaded(page);

            // Search for our Intervention in the Interventions tab
            const interventionsTab = page.getByRole('tabpanel', { name: 'Interventions' });
            await interventionsTab.getByPlaceholder('Search...').fill(desc);

            // Press Enter to search
            await page.keyboard.press('Enter');

            // Wait for loading
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the row (by description) is visible
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}")`
                )
            ).toBeVisible();

            // Assert the tag shows on the same row
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}"):has-text("${tag}")`
                )
            ).toBeVisible();

            // Assert the Intervention is active (3rd column input is checked)
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}") td >> nth=2 >> input`
                )
            ).toBeChecked();









            //EDIT CREATED INTERVENTION:


            //--------------------------------
// Arrange:
//--------------------------------
            const tagEdit = "QAWInt tag Edit";
            const descEdit = `QAWIntervEdit-${Date.now()}`;

//--------------------------------
// Act:
//--------------------------------


            try {
                // Hover over the intervention row
                await page
                    .locator(
                        `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}")`,
                    )
                    .hover();

                // Click the pencil icon to be taken to the "Edit Intervention" pop up
                await page
                    .locator(`[aria-labelledby="browse-tabs-tab-3"] [title="Edit"]`)
                    .click();

                await waitUntilLoaded(page);

                // Verify we are taken to the "Edit Intervention" page
                await expect(page.getByText(`Edit Intervention #`)).toBeVisible(
                );
            } catch {
                // Hover over the intervention row
                await page
                    .locator(
                        `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${desc}")`,
                    )
                    .hover();

                // Click the pencil icon to be taken to the "Edit Intervention" pop up
                await page
                    .locator(`[aria-labelledby="browse-tabs-tab-3"] [title="Edit"]`)
                    .click();

                await waitUntilLoaded(page);

                // Verify we are taken to the "Edit Intervention" page
                await expect(page.getByText(`Edit Intervention #`)).toBeVisible();
            }

// Click the "x" on the tag to delete it
            await page
                .locator(
                    `[aria-label="cpti_tags_taglist listbox"] [role="option"] [aria-label="delete"]`,
                )
                .click();

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
            await page.locator(`[name="cpti_is_active"]`).uncheck();

// Fill in the description with {descEdit}
            await page.locator(`#cpti_description`).fill(descEdit);

            await waitUntilLoaded(page);

// Click the "Save and Close" button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();

// Wait for loading
            await waitUntilLoaded(page);

// Fill in the new intervention description in the search bar
            await page
                .getByRole(`tabpanel`, { name: `Interventions` })
                .getByPlaceholder(`Search...`)
                .fill(descEdit);

// Press "Enter" to search
            await page.keyboard.press("Enter");

// Wait for loading
            await waitUntilLoaded(page);

//--------------------------------
// Assert:
//--------------------------------
// Assert we see our Intervention with the correct description edit
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${descEdit}")`,
                ),
            ).toBeVisible();

// Assert the tags {tagEdit}
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${descEdit}"):has-text("${tagEdit}")`,
                ),
            ).toBeVisible();

// Assert the Intervention is not active
            await expect(
                page.locator(
                    `[data-browse-code="toolsBrowse_CPTI"] table tbody tr:has-text("${descEdit}") td >> nth=2 >> input`,
                ),
            ).not.toBeChecked();










        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});