import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {waitUntilLoaded} from "../../../../helpers/Node20Helpers.js";

test('Create Inpatient Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `AdvancedSearch`;
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
    const automationName = `QA Wolf Rule name ${randomFourDigit}`;
    const birthGender = `Female`;


    const editedRuleName = `${automationName} - edited`;
    const birthGenderUpdated = `Female`;

/*
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const url = env.DEFAULT_URL_2;

 */

    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper


    const { page } = await helpers.logIn3({
        loginID,
        slowMo: 700,
        password,
        url,
    });

    await waitUntilLoaded(page);

    //--------------------------------
    // Navigate to Automation
    //--------------------------------
    await page.getByText('Tools', { exact: true }).click();
    await page.getByText('Automation').first().click();

    //--------------------------------
    // Create New Rule - Inpatient
    //--------------------------------
    await page.locator('#grid-toolbar-new-button-menu').click();
    await page.getByText('Inpatient', { exact: true }).click();

    // Fill in Rule Name
    await page.locator('#aaru_rule_name').fill(automationName);





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
    await searchInput.fill(automationName);
    await dialog.locator('#admin-search-button').click();
    await searchInput.evaluate(input => input.blur()); // remove focus to allow grid to update

    // Wait for the row to appear
    const row = dialog.locator('td', { hasText: automationName }).first().locator('xpath=ancestor::tr');
    await expect(row).toBeVisible();


    // Assert the Authorization Type is correct
    await expect(page.getByRole('gridcell', { name: 'IP' })).toBeVisible();











    // Wait for the row to appear
     await expect(row).toBeVisible();

    // Hover over the row to reveal the Edit button
    await row.hover();
    const editButton = row.locator('button[title="Edit"]');
    await expect(editButton).toBeVisible();
    await editButton.click({ force: true });

    //--------------------------------
    // Update the Rule
    //--------------------------------
    // Update rule name
    await page.locator('#aaru_rule_name').fill(editedRuleName);

    // Update Birth Gender to Male
    const genderInputEdit = page.locator('input[name="aaru_birth_gender_id_input"]');
    await genderInputEdit.click({ force: true });
    await genderInputEdit.fill(birthGenderUpdated);
    await genderInputEdit.press('Tab'); // trigger change/blur
    await expect.poll(() => genderInputEdit.inputValue(), ).toBe(birthGenderUpdated);

    // Save edited rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: editedRuleName })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'IP' })).toBeVisible();







    const row2 = dialog.locator('td', { hasText: editedRuleName }).first().locator('xpath=ancestor::tr');


    // Hover over the row to reveal the Edit button
    await row2.hover();
    const editButton3 = row.locator('button[title="Edit"]');
    await expect(editButton3).toBeVisible();
    await editButton3.click({ force: true });




// Verify Birth Gender value
    const birthGenderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    //await expect(birthGenderInput).toHaveValue('Female', { timeout: 10000 });
    await expect(birthGenderInput).toHaveValue(birthGenderUpdated, );



});



