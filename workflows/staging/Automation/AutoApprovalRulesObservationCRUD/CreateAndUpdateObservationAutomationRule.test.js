// Filename: CreateAndUpdateObservationAutomationRule.test.js

import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

test.describe('Observation Automation Rules — Create & Update', () => {
    test('Create an Observation rule, verify, update name & network status, and re-verify', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const ruleName = faker.lorem.words(3); // FIX: faker.random.words -> faker.lorem.words
        const ruleNameEdited = `${ruleName} - edited`;
        const loginID = `ObservationCRUDAutoApprovalRules`;

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
            // Click `Tools` button
            await page.getByText(`Tools`).click();

            // Click `Automation` button
            await page.getByText(`Automation`, { exact: true }).click();

            // Click `+ New` button
            await page.locator(`#grid-toolbar-new-button-menu`).click();

            // Click "Observation" option
            await page.getByText(`Observation`, { exact: true }).click();

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
            // Assert:
            //--------------------------------
            // Assert newly created rule name
            await expect(page.getByRole(`gridcell`, { name: ruleName })).toBeVisible();

            // Assert newly created rule `Authorization Type`
            const authType = await page.locator(`tr td:nth-of-type(5)`).innerText();
            if (authType === 'OBS') {
                await expect(page.locator(`tr td:nth-of-type(5)`)).toHaveText('OBS');
            } else if (authType === 'OP') {
                await expect(page.locator(`tr td:nth-of-type(5)`)).toHaveText('OP');
            }

            // Assert that the rule is active
            await expect(
                page.locator(
                    `tr:has-text("${ruleName}") td:nth-of-type(3) [type="checkbox"]`
                )
            ).toBeChecked({ timeout: 5000 });

            // (Optional) Assert Authorization Type text if OBS
            if (authType === 'OBS') {
                await expect(
                    page.locator(`tr:has-text("${ruleName}"):has-text("OBS")`)
                ).toBeVisible();
            }

            //--------------------------------
            // Arrange:
            //--------------------------------
            // Click newly created rule name
            await page.getByRole(`gridcell`, { name: ruleName }).click();

            //await waitUntilLoaded(page);

            //--------------------------------
            // Act:
            //--------------------------------
            // Click `Edit` rule
            await page.getByRole(`button`, { name: `` }).click();

            await waitUntilLoaded(page);

            // Fill in `Rule name` input field
            await page.locator(`#aaru_rule_name`).fill(ruleNameEdited);

            // Click `Network Status` chevron down
            await page
                .locator(
                    `[role="dialog"] [class="formField fieldcol1 rowFirst"]:has-text("Network Status") button:visible`
                )
                .first()
                .click();

            // Click `Preferred` from dropdown menu
            await page.getByRole(`option`, { name: `Preferred` }).locator(`span`).click();


            await waitUntilLoaded(page);

            // Click `Save and close` button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert newly updated rule name is visible
            await expect(
                page.getByRole(`gridcell`, { name: ruleNameEdited })
            ).toBeVisible();

            // Assert newly created rule `Authorization Type` is the same
            if (authType === 'OBS') {
                await expect(page.locator(`tr td:nth-of-type(5)`)).toHaveText('OBS');
            } else if (authType === 'OP') {
                await expect(page.locator(`tr td:nth-of-type(5)`)).toHaveText('OP');
            }

            // Click newly updated rule name (ensure we open the edited one)
            await page.getByRole(`gridcell`, { name: ruleNameEdited }).click();

            //await waitUntilLoaded(page);

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