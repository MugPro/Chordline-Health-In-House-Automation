import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Update BH Referral Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `BHOutpatientAutomationRule`;
    const ruleName = `BH Referral Rule ${Math.floor(1000 + Math.random() * 9000)}`;
    const ruleNameEdited = `${ruleName} - edit`;
    const updatedBirthGender = `Female`;
    const password = process.env.DEFAULT_PASS_OCT_2025;

    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
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

    await page.locator('#aaru_rule_name').fill(ruleName);

    // Set Birth Gender directly
    const genderInputCreate = page.locator('input[name="aaru_birth_gender_id_input"]');
    await genderInputCreate.click({ force: true });
    await genderInputCreate.fill(updatedBirthGender);
    await genderInputCreate.press('Tab'); // trigger blur/change event
    await expect.poll(() => genderInputCreate.inputValue(), { timeout: 10000 }).toBe(updatedBirthGender);

    // Fill Units
    const unitsInput = page.locator('[aria-valuemax="9999"]').first();
    await unitsInput.click();
    await unitsInput.fill('100');
    await unitsInput.press('Tab');
    await expect(unitsInput).toHaveValue('100');

    // Save the new rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Search and Edit the Rule
    //--------------------------------
    const dialog = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const searchInput = dialog.getByPlaceholder('Search...');
    await searchInput.fill(ruleName);
    await dialog.locator('#admin-search-button').click();
    await searchInput.evaluate(input => input.blur());

    // Wait for the row to appear
    const row = dialog.locator('td', { hasText: ruleName }).first().locator('xpath=ancestor::tr');
    await expect(row).toBeVisible({ timeout: 20000 });

    // Hover to reveal Edit button
    await row.hover();
    const editButton = row.locator('button[title="Edit"]');
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click({ force: true });

    //--------------------------------
    // Update the Rule
    //--------------------------------
    await page.locator('#aaru_rule_name').fill(ruleNameEdited);

    // Verify Birth Gender is still "Female"
    const genderInputEdit = page.locator('input[name="aaru_birth_gender_id_input"]');
    await expect.poll(() => genderInputEdit.inputValue(), { timeout: 10000 }).toBe(updatedBirthGender);










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
    await expect(dialog1).toBeVisible({ timeout: 15000 });

    const searchInput1 = dialog.getByPlaceholder('Search...');
    await searchInput1.fill(ruleName);
    await dialog1.locator('#admin-search-button').click();
    await searchInput1.evaluate(input => input.blur()); // remove focus to allow grid to update

    // Wait for the row to appear
    const row2 = dialog1.locator('td', { hasText: ruleName }).first().locator('xpath=ancestor::tr');
    await expect(row).toBeVisible({ timeout: 20000 });

    // Hover over the row to reveal the Edit button
    await row2.hover();
    const editButton3 = row.locator('button[title="Edit"]');
    await expect(editButton3).toBeVisible({ timeout: 10000 });
    await editButton3.click({ force: true });




// Verify Birth Gender value
    const birthGenderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    //await expect(birthGenderInput).toHaveValue('Female', { timeout: 10000 });
    await expect(birthGenderInput).toHaveValue(updatedBirthGender, { timeout: 10000 });

});
