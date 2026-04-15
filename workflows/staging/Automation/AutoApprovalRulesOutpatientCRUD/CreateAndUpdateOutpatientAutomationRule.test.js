// Filename: CreateAndUpdateOutpatientAutomationRule.test.js

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';

test.describe('Outpatient Automation Rules — Create & Update', () => {
    test('Create an Outpatient rule, verify, update name & network status, and re-verify', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const ruleName = faker.lorem.words(3); // FIX: faker.random.words -> faker.lorem.words
        const ruleNameEdited = `${ruleName} - edited`;
        const loginID = `OutpatientAutomation`;

        // Sign in to the app
        const { page, context, browser } = await logIn({ loginID });

        try {
            //--------------------------------
            // Act:
            //--------------------------------
            // Click `Tools` button
            await page.getByText(`Tools`).click();

            // Click `Automation` button
            await page.getByText(`Automation`, { exact: true }).click();

            // Click `+ New` button
            await page.locator(`#grid-toolbar-new-button-menu`).click();

            // Click `Outpatient` button
            await page.getByText(`Outpatient`, { exact: true }).click();

            await waitUntilLoaded(page);

            // Fill in `Rule Name` input field
            await page.locator(`#aaru_rule_name`).fill(ruleName);

            await waitUntilLoaded(page);

            // Click `Save and Close` button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
            await waitUntilLoaded(page);

            // Fill in `Search` input field
            await page
                .getByRole(`dialog`, { name: `Manage Automation` })
                .getByPlaceholder(`Search...`)
                .fill(ruleName);

            // Click `Search` button
            await page.locator(`#admin-search-button`).click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert (after create):
            //--------------------------------
            // Assert newly created rule name
            await expect(page.getByRole(`gridcell`, { name: ruleName })).toBeVisible();

            // Assert newly created rule `Authorization Type` is OP
            await expect(page.getByRole(`gridcell`, { name: `OP`, exact: true })).toBeVisible();

            //--------------------------------
            // Arrange:
            //--------------------------------
            // Click newly created rule name
            await page.getByRole(`gridcell`, { name: ruleName }).click();

            //--------------------------------
            // Act (edit):
            //--------------------------------
            // Click `Edit` rule
            await page.getByRole(`button`, { name: `` }).click();

            await waitUntilLoaded(page);

            // Fill in `Rule name` input field
            await page.locator(`#aaru_rule_name`).fill(ruleNameEdited);

            // Click `Network Status` chevron down (Requesting Provider section)
            await page
                .locator(`#record-div div`)
                .filter({ hasText: `Requesting Provider * Cards:` })
                .getByLabel(`expand combobox`)
                .click();

            // Click `Preferred` from dropdown menu
            await page.getByRole(`option`, { name: `Preferred` }).locator(`span`).click();


            await waitUntilLoaded(page);

            // Click `Save and close` button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert (after update):
            //--------------------------------
            // Assert newly updated rule name is visible
            await expect(page.getByRole(`gridcell`, { name: ruleNameEdited })).toBeVisible();

            // Assert rule `Authorization Type` remains OP
            await expect(page.getByRole(`gridcell`, { name: `OP` })).toBeVisible();

            // Open the updated row
            await page.getByRole(`gridcell`, { name: ruleNameEdited }).click();

            // Click `Edit` rule
            await page.getByRole(`button`, { name: `` }).click();

            await waitUntilLoaded(page);

            // Assert network status is correct
            await expect(
                page.locator(`[name="aaru_provider_1_network_status_id_input"]`)
            ).toHaveValue(`Preferred`);
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});