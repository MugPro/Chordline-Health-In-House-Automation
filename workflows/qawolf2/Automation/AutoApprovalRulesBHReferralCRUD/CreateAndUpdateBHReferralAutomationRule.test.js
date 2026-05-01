import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn, logIn3} from "../../../../helpers/Node20Helpers.js";

test('Create BH Referral Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `AdvancedSearch`;
    const ruleName = `BH Referral Rule ${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedBirthGender = `Female`;

    const ruleNameEdited = `${ruleName} - edit`;



    const loginID = 'AdvancedSearch';
    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 700,
    });


    //--------------------------------
    // Navigate to Automation
    //--------------------------------
    await page.getByText('Tools', { exact: true }).click();
    await page.getByText('Automation').first().click();

    //--------------------------------
    // Create New Rule - BH Referral
    //--------------------------------
    await page.locator('#grid-toolbar-new-button-menu').click();
    await page.getByText('BH Referral', { exact: true }).click();

    // Fill in Rule Name
    await page.locator('#aaru_rule_name').fill(ruleName);





    // Fill Gender directly
    const genderInputCreate = page.locator('input[name="aaru_birth_gender_id_input"]');
    await genderInputCreate.click({ force: true });
    await genderInputCreate.fill('Female');
    await genderInputCreate.press('Tab'); // trigger change/blur



    // Fill Units
    const unitsInput = page.locator('[aria-valuemax="9999"]').first();
    await unitsInput.click();
    await expect(page.getByText('Max Requested Units:')).toBeVisible();
    await page.getByRole('spinbutton').click();
    await page.getByRole('button', { name: 'Increase value' }).click();
    await page.locator('#aaru_requested_units').fill('100');
    await page.locator('#aaru_requested_units').press('Tab');









    // Save new rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert the Rule
    //--------------------------------
    const dialog = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog).toBeVisible();

    const searchInput = dialog.getByPlaceholder('Search...');
    await searchInput.fill(ruleName);
    await dialog.locator('#admin-search-button').click();
    await searchInput.evaluate(input => input.blur()); // remove focus to allow grid to update

    // Wait for the row to appear
    const row = dialog.locator('td', { hasText: ruleName }).first().locator('xpath=ancestor::tr');
    await expect(row).toBeVisible();


    // Assert the Authorization Type is correct
    await expect(page.getByRole('gridcell', { name: 'RF-BH' })).toBeVisible();























    // Wait for the row to appear
    await expect(row).toBeVisible();

    // Hover to reveal Edit button
    await row.hover();
    const editButton = row.locator('button[title="Edit"]');
    await expect(editButton).toBeVisible();
    await editButton.click({ force: true });

    //--------------------------------
    // Update the Rule
    //--------------------------------
    await page.locator('#aaru_rule_name').fill(ruleNameEdited);










// Save edited rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: ruleNameEdited })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'RF-BH' })).toBeVisible();








    //--------------------------------
    // Search and Edit the Rule
    //--------------------------------
    const dialog1 = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog1).toBeVisible();

    const searchInput1 = dialog.getByPlaceholder('Search...');
    await searchInput1.fill(ruleName);
    await dialog1.locator('#admin-search-button').click();
    await searchInput1.evaluate(input => input.blur()); // remove focus to allow grid to update

    // Wait for the row to appear
    const row2 = dialog1.locator('td', { hasText: ruleName }).first().locator('xpath=ancestor::tr');
    await expect(row).toBeVisible();

    // Hover over the row to reveal the Edit button
    await row2.hover();
    const editButton3 = row.locator('button[title="Edit"]');
    await expect(editButton3).toBeVisible();
    await editButton3.click({ force: true });




// Verify Birth Gender value
    const birthGenderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    //await expect(birthGenderInput).toHaveValue('Female', { timeout: 10000 });
    await expect(birthGenderInput).toHaveValue(updatedBirthGender);

});
