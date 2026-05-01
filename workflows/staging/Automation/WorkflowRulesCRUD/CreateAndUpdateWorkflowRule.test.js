// Filename: CreateAndUpdateWorkflowRule.test.js

import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

test.describe('Workflow Rules — Create & Update', () => {
    test('Create a Workflow Rule, verify, update name & triggers, and re-verify', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const ruleName = faker.lorem.words(3); // FIX: faker.random.words -> faker.lorem.words
        const ruleNameEdited = `${ruleName} - edited`;
        const loginID = `WorkflowRules`;

        // Sign in to the app
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
            // Click the "Tools" text
            await page.getByText(`Tools`).click();

            // Click the "Automation" text
            await page.getByText(`Automation`, { exact: true }).click();

            // Wait page load
            await waitUntilLoaded(page);

            // Click the "Workflow Rules" text
            await page.getByText(`Workflow Rules`).last().click();

            // Click the " New" button (NBSP between icon and New)
            await page.getByRole(`button`, { name: ` \u00A0New` }).click();

            // Wait page load
            await waitUntilLoaded(page);

            // Fill the "Rule Name:" textbox with
            await page.getByRole(`textbox`, { name: `Rule Name:` }).fill(ruleName);

            // Click `Screen type` input field
            await page.locator(`[aria-controls="recordSaveTableCode_listbox"]`).click();

            // Click the "Assessment" option
            await page.getByRole(`option`, { name: `Assessment` }).click();

            // Click the "expand combobox" button
            await page.getByRole(`button`, { name: `expand combobox` }).click();

            // Click the "(Any Assessment)" text
            await page.getByText(`(Any Assessment)`).click();

            // Wait page load
            await waitUntilLoaded(page);

            // Click the "New Records" checkbox
            await page.getByRole(`checkbox`, { name: `New Records` }).click();

            // Wait page load
            await waitUntilLoaded(page);

            // Click the "Save" button
            await page.getByRole(`button`, { name: `Save` }).click();
            await waitUntilLoaded(page);

            await expect(async () => {
                // Close the "New Workflow Rule" modal
                await page.locator(`#modal-window-rules #close`).click();

                // Wait page load
                await waitUntilLoaded(page);

                // Fill in search field with newly created rule name
                await page
                    .getByRole(`dialog`, { name: `Manage Automation` })
                    .getByPlaceholder(`Search...`)
                    .fill(ruleName);

                // Click `Search` button
                await page.locator(`#admin-search-button`).click({ timeout: 3500 });

                // Click newly created rule
                await page.getByRole(`gridcell`, { name: ruleName }).click({ timeout: 3500 });
            }).toPass({ timeout: 30 * 1000 });




            // Wait page load
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert (after create):
            //--------------------------------
            // Verify newly created rule is in search results
            await expect(page.getByRole(`gridcell`, { name: ruleName })).toBeVisible();


            // Click edited rule name
            await page.getByRole(`gridcell`, { name: ruleName }).click();

            // Click `Edit` button
            await page.getByRole(`button`, { name: `` }).click();

            // Wait page load
            await waitUntilLoaded(page);

            // Assert the "Screen Type" value is "Assessment" in the edit modal
            await expect(
                page.locator('span.k-input-inner .k-input-value-text', { hasText: 'Assessment' })
            ).toBeVisible();

            // Assert the "New Records" checkbox is checked
            await expect(page.getByRole('checkbox', { name: 'New Records' })).toBeChecked();

            //--------------------------------
            // Act (update):
            //--------------------------------
            // Fill in Rule Name with edited name
            await page.getByRole(`textbox`, { name: `Rule Name:` }).fill(ruleNameEdited);

            // Click `Updated Records` checkbox
            await page.getByRole(`checkbox`, { name: `Updated Records` }).click();

            // Uncheck the "New Records" checkbox
            await page.getByRole('checkbox', { name: 'New Records' }).uncheck();

            // Wait page load
            await waitUntilLoaded(page);

            // Click `Save` button
            await page.getByRole(`button`, { name: `Save` }).click();
            await waitUntilLoaded(page);

            // Click `Close` button on the edit modal
            await page.getByLabel(`Edit Workflow Rule`).getByText(`Close`).click();

            // Wait page load
            await waitUntilLoaded(page);

            // Fill in search input field
            await page
                .getByRole(`dialog`, { name: `Manage Automation` })
                .getByPlaceholder(`Search...`)
                .fill(ruleNameEdited);

            // Click `Search` button
            await page.locator(`#admin-search-button`).click();

            // Click edited rule name
            await page.getByRole(`gridcell`, { name: ruleNameEdited }).click();

            // Click `Edit` button
            await page.getByRole(`button`, { name: `` }).click();

            // Wait page load
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert (after update):
            //--------------------------------
            // Assert the rule name is edited
            await expect(page.getByRole('textbox', { name: 'Rule Name:' })).toHaveValue(ruleNameEdited);

            // Assert the "New Records" checkbox is unchecked
            await expect(page.getByRole('checkbox', { name: 'New Records' })).not.toBeChecked();

            // Assert the "Updated Records" checkbox is checked
            await expect(page.getByRole('checkbox', { name: 'Updated Records' })).toBeChecked();
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});
