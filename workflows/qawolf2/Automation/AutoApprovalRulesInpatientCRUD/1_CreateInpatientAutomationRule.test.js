import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Create Inpatient Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `LetterCRUD`;
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
    const automationName = `QA Wolf Rule name ${randomFourDigit}`;
    const birthGender = `Female`;
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const url = env.DEFAULT_URL_2;

    const { page } = await helpers.logIn({
        loginID,
        password,
        url,
    });

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


    /*
    // Set Birth Gender
    const genderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    await genderInput.click({ force: true });
    await genderInput.fill(birthGender);
    await genderInput.press('Tab'); // trigger blur/change
    await expect.poll(() => genderInput.inputValue(), { timeout: 10000 }).toBe(birthGender);

    // Fill Units
    const unitsInput = page.locator('[aria-valuemax="9999"]').first();
    await unitsInput.click();
    await unitsInput.fill('100');
    await unitsInput.press('Tab');
    await expect(unitsInput).toHaveValue('100');
*/










    // Fill Gender directly
    const genderInputCreate = page.locator('input[name="aaru_birth_gender_id_input"]');
    await genderInputCreate.click({ force: true });
    await genderInputCreate.fill('Female');
    await genderInputCreate.press('Tab'); // trigger change/blur



    // Fill Units
    const unitsInput = page.locator('[aria-valuemax="9999"]').first();
    await unitsInput.click();
    await unitsInput.fill('100');
    await unitsInput.press('Tab');
    await expect(unitsInput).toHaveValue('100');



    // Save new rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert the Rule
    //--------------------------------
    const dialog = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const searchInput = dialog.getByPlaceholder('Search...');
    await searchInput.fill(automationName);
    await dialog.locator('#admin-search-button').click();
    await searchInput.evaluate(input => input.blur()); // remove focus to allow grid to update

    // Wait for the row to appear
    const row = dialog.locator('td', { hasText: automationName }).first().locator('xpath=ancestor::tr');
    await expect(row).toBeVisible({ timeout: 20000 });

    // Assert the Rule Name
    await expect(page.getByRole('gridcell', { name: automationName })).toBeVisible();

    // Assert the Authorization Type is correct
    await expect(page.getByRole('gridcell', { name: 'IP' })).toBeVisible();
});



