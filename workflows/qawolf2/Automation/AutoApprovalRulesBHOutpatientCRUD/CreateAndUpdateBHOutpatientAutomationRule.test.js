import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
//import { env } from '../../../../environments/qawolf2.env.js';
import {logIn} from "../../../../helpers/Node20Helpers.js";

let page;

test('Create BH Outpatient Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `BHOutpatientAutomationRule`;
    const loginID = `ValidResponse`;
    const ruleName = `BH Outpatient Rule ${Math.floor(1000 + Math.random() * 9000)}`;

    const ruleNameEdited = `${ruleName} - edit`;

    //const password = process.env.DEFAULT_PASS_OCT_2025;


    /*

    const password = process.env.DEFAULT_PASS_OCT_2025;

    // Login
    const { page } = await helpers.logIn({
        loginID,
        slowMo: 700,
        password,
        url: env.DEFAULT_URL_2,
    });

     */



   // ({ page } = await logIn({ loginID, password, slowMo: 700, url: env.DEFAULT_URL_2 }));

    ({ page } = await logIn({
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
        slowMo: 700,
        url: process.env.DEFAULT_URL_2
    }));


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
    await page.locator('#record-div-scroll').click();
    await page.getByText('Max Requested Units:').click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('button', { name: 'Increase value' }).click();
    await page.locator('#aaru_requested_units').fill('100');
    await page.locator('#aaru_requested_units').press('Enter');



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

    // Check that the Authorization Type is correct
    await expect(page.getByRole('gridcell', { name: 'OP-BH' })).toBeVisible();






















    // Wait for the row to appear
    const row = dialog.locator('td', { hasText: ruleName }).first().locator('xpath=ancestor::tr');
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
    await page.locator('#aaru_rule_name').fill(ruleNameEdited);





    // Update Birth Gender directly
    await page.locator('span').filter({ hasText: '2 ...' }).getByLabel('expand combobox').click();
    await page.getByText('Male', { exact: true }).click();












    // Save edited rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: ruleNameEdited })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'OP-BH' })).toBeVisible();








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
    await expect(birthGenderInput).toHaveValue('Male');

});

