import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Create BH Outpatient Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `BHOutpatientAutomationRule`;
    const ruleName = `BH Outpatient Rule ${Math.floor(1000 + Math.random() * 9000)}`;

    const password = process.env.DEFAULT_PASS_OCT_2025;

    // Login
    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    //--------------------------------
    // Act
    //--------------------------------
    // Click the "Tools" menu
    await page.getByText('Tools', { exact: true }).click();

    // Click the "Automation" option
    await page.getByText('Automation').first().click();

    // Click "+ New" button
    await page.locator('#grid-toolbar-new-button-menu').click();

    // Click the "BH Outpatient" type
    await page.getByText('BH Outpatient', { exact: true }).click();

    // Fill in the "Rule name"
    await page.locator('#aaru_rule_name').fill(ruleName);

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



    // Click "Save and Close"
    await page.getByRole('button', { name: ' Save and Close' }).click();

    // Wait for the "Manage Automation" dialog
    const dialog = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog).toBeVisible();

    // Fill search box and click search
    await dialog.getByPlaceholder('Search...').fill(ruleName);
    await page.locator('#admin-search-button').click();

    //--------------------------------
    // Assert
    //--------------------------------
    // Check that the new rule appears in the grid
    await expect(page.getByRole('gridcell', { name: ruleName })).toBeVisible();

    // Check that the Authorization Type is correct
    await expect(page.getByRole('gridcell', { name: 'OP-BH' })).toBeVisible();
});
