/*import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Update BH Outpatient Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `BHOutpatientAutomationRule`;
    const ruleName = `BH Outpatient Rule 1234`; // Replace with your actual created rule or pass dynamically
    const ruleNameEdited = `${ruleName} - edit`;
    const updatedBirthGender = `Male`;

    // Login
    const { page } = await helpers.logIn({
        loginID,
        url: env.DEFAULT_URL_2,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Act
    //--------------------------------
    // Navigate to Tools > Automation
    await page.getByText('Tools').click();
    await page.getByText('Automation').first().click();


    //await page.pause();


    // Wait for the automation grid to render
    const gridLocator = page.locator('#automation-grid'); // replace with actual grid ID
    await gridLocator.waitFor({ state: 'visible', timeout: 10000 });

    // Locate the existing rule row by text
    const ruleRow = gridLocator.locator(`tr:has-text("${ruleName}")`);
    await expect(ruleRow).toHaveCount(1, { timeout: 10000 });

    // Scroll into view and click the row
    await ruleRow.first().scrollIntoViewIfNeeded();
    await ruleRow.first().click();

    // Click the edit button
    const editButton = page.getByRole('button', { name: '' });
    await editButton.first().click();

    // Update the rule name
    const ruleNameInput = page.locator('#aaru_rule_name');
    await ruleNameInput.fill(ruleNameEdited);

    // Update the Birth Gender combobox
    try {
        const genderCombo = page.locator('span').filter({ hasText: /^2$/ }).getByLabel('expand combobox');
        await genderCombo.click();
        await page.getByRole('option', { name: updatedBirthGender, exact: true }).click();
    } catch {
        // Retry once if needed
        const genderCombo = page.locator('span').filter({ hasText: /^2$/ }).getByLabel('expand combobox');
        await genderCombo.click();
        await page.getByRole('option', { name: updatedBirthGender, exact: true }).click();
    }

    // Save and close
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    // Re-query the grid to ensure updated rule exists
    await gridLocator.waitFor({ state: 'visible', timeout: 10000 });
    const updatedRuleRow = gridLocator.locator(`tr:has-text("${ruleNameEdited}")`);
    await expect(updatedRuleRow).toHaveCount(1, { timeout: 10000 });

    // Assert Authorization Type is still correct
    await expect(page.getByRole('gridcell', { name: 'OP-BH' })).toBeVisible();

    // Verify Birth Gender value inside the edit dialog
    await updatedRuleRow.first().click();
    await editButton.first().click();
    const birthGenderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    await expect(birthGenderInput).toHaveValue(updatedBirthGender);
});



 */















/*
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Update BH Outpatient Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `BHOutpatientAutomationRule`;
    const ruleName = `BH Outpatient Rule ${Math.floor(1000 + Math.random() * 9000)}`;
    const ruleNameEdited = `${ruleName} - edit`;
    const updatedBirthGender = `Male`;
    const password = process.env.DEFAULT_PASS_OCT_2025;

    // Login and navigate to the Automation page
    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    // Navigate to Tools > Automation
    await page.getByText('Tools', { exact: true }).click();
    await page.getByText('Automation').first().click();

    // Create a new rule (so we have something to edit)
    await page.locator('#grid-toolbar-new-button-menu').click();
    await page.getByText('BH Outpatient', { exact: true }).click();
    await page.locator('#aaru_rule_name').fill(ruleName);
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Member * Member Must Be' })
        .getByLabel('expand combobox')
        .click();
    await page.getByRole('option', { name: 'Female' }).click();






    // Locate the input field
    const unitsInput = page.locator('[aria-valuemax="9999"]').first();

// Fill with 100, trigger input event, press Enter, and assert
    await unitsInput.fill('100');
    await unitsInput.evaluate((el) => el.dispatchEvent(new Event('input', { bubbles: true })));
    await page.keyboard.press('Enter');
    await expect(unitsInput).toHaveValue('100', { timeout: 10000 });







    await page.getByRole('button', { name: ' Save and Close' }).click();

    // Wait for Manage Automation dialog to appear
    const dialog = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog).toBeVisible({ timeout: 15000 });

    //--------------------------------
    // Act: Update the rule
    //--------------------------------
    // Search for the newly created rule in the dialog
    await dialog.getByPlaceholder('Search...').fill(ruleName);
    await dialog.locator('#admin-search-button').click();





    // Wait for the dialog itself first
    await expect(dialog).toBeVisible({ timeout: 15000 });

// Then wait for the table container or tbody inside the dialog to be visible
    const tableLocator = dialog.locator('#automation-grid tbody');
    await expect(tableLocator).toBeVisible({ timeout: 15000 });




    // Find the row with the rule name
    const row = tableLocator.locator('tr', { hasText: ruleName });
    await expect(row).toBeVisible();

    // Click the Edit button (pencil icon) inside that row's Actions column
    await row.getByRole('button', { name: '' }).click();

    // Fill the edited rule name
    await page.locator('#aaru_rule_name').fill(ruleNameEdited);

    // Update Birth Gender field to Male
    try {
        await page
            .locator('span')
            .filter({ hasText: /^2$/ })
            .getByLabel('expand combobox')
            .click();
        await page.getByRole('option', { name: updatedBirthGender, exact: true }).click();
    } catch {
        // Retry in case of failure
        await page
            .locator('span')
            .filter({ hasText: /^2$/ })
            .getByLabel('expand combobox')
            .click();
        await page.getByRole('option', { name: updatedBirthGender, exact: true }).click();
    }

    // Save and close the edited rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    // Verify the updated rule appears in the list
    await expect(page.getByRole('gridcell', { name: ruleNameEdited })).toBeVisible();

    // Verify Authorization Type column for updated rule is visible
    await expect(page.getByRole('gridcell', { name: 'OP-BH' })).toBeVisible();








    const updatedRow = dialog.locator('#automation-grid tbody tr', { hasText: ruleNameEdited })
    const editButton = updatedRow.getByRole('button', { name: '' });
    await expect(editButton).toBeVisible();
    await editButton.click();

    const editDialog = page.getByRole('dialog', { name: /Auto Approval Rule/i });
    await expect(editDialog).toBeVisible();

    await expect(page.locator('input[name="aaru_birth_gender_id_input"]')).toHaveValue(updatedBirthGender);



});



 */



















/*
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';


async function selectDropdownOption(page, comboLocator, optionText) {
    // Open dropdown
    await comboLocator.click({ force: true });

    // Wait for dropdown option to appear anywhere in DOM
    const option = page.locator(`text=${optionText}`).first();
    await option.waitFor({ state: 'visible', timeout: 10000 });

    // Click the option
    await option.click();
}

test('Update BH Outpatient Automation Rule', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `BHOutpatientAutomationRule`;
    const ruleName = `BH Outpatient Rule ${Math.floor(1000 + Math.random() * 9000)}`;
    const ruleNameEdited = `${ruleName} - edit`;
    const updatedBirthGender = `Male`;
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
    // Create New Rule
    //--------------------------------
    await page.locator('#grid-toolbar-new-button-menu').click();
    await page.getByText('BH Outpatient', { exact: true }).click();

    await page.locator('#aaru_rule_name').fill(ruleName);

    // Select Female
    const genderComboCreate = page
        .locator('#record-div div')
        .filter({ hasText: 'Member * Member Must Be' })
        .getByLabel('expand combobox');

    await selectDropdownOption(page, genderComboCreate, 'Female');

    // Fill Units
    const unitsInput = page.locator('[aria-valuemax="9999"]').first();








    await unitsInput.click();
    await unitsInput.press('Control+A'); // or 'Meta+A' on Mac
    await unitsInput.press('Delete');

    await unitsInput.type('100', { delay: 100 }); // simulate real typing
    await unitsInput.press('Tab'); // trigger blur/change event

    await expect(unitsInput).toHaveValue('100');










    // Save new rule
    await page.getByRole('button', { name: ' Save and Close' }).click();







    const dialog = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill search input
    const searchInput = dialog.getByPlaceholder('Search...');
    await searchInput.fill(ruleName);
    await dialog.locator('#admin-search-button').click();
    await searchInput.evaluate(input => input.blur());

    // Wait for the cell containing the rule to appear
    const cell = dialog.locator('td', { hasText: ruleName }).first();
    await expect(cell).toBeVisible({ timeout: 20000 });

    // Scroll into view (virtualized grid)
    await cell.scrollIntoViewIfNeeded();

    // Get the row
    const row = cell.locator('xpath=ancestor::tr');

    // Hover over row to reveal Edit button
    await row.hover();

    // Find the Edit button inside the row
    const editButton = row.locator('button[title="Edit"]');
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click({ force: true });




    // Update rule name
    await page.locator('#aaru_rule_name').fill(ruleNameEdited);

    // Update Birth Gender to Male
    const birthGenderComboEdit = page
        .locator('#record-div div')
        .filter({ hasText: 'Member * Member Must Be' })
        .getByLabel('expand combobox');

    await selectDropdownOption(page, birthGenderComboEdit, 'Male');












    // Save updated rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: ruleNameEdited })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'OP-BH' })).toBeVisible();

    // Re-open to verify gender
    const updatedRow = dialog.locator('#automation-grid tbody tr', { hasText: ruleNameEdited });
    await expect(updatedRow).toBeVisible();

    const editButton2 = updatedRow.getByRole('button', { name: '' });
    await editButton2.click();

    const editDialog = page.getByRole('dialog', { name: /Auto Approval Rule/i });
    await expect(editDialog).toBeVisible();

    const birthGenderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    await expect(birthGenderInput).toHaveValue(updatedBirthGender);
});



 */




















import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Update BH Outpatient Automation Rule', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `BHOutpatientAutomationRule`;
    const ruleName = `BH Outpatient Rule ${Math.floor(1000 + Math.random() * 9000)}`;
    const ruleNameEdited = `${ruleName} - edit`;
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
    // Create New Rule
    //--------------------------------
    await page.locator('#grid-toolbar-new-button-menu').click();
    await page.getByText('BH Outpatient', { exact: true }).click();

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
    await unitsInput.fill('100');
    await unitsInput.press('Tab');
    await expect(unitsInput).toHaveValue('100');

    // Save new rule
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Search and Edit the Rule
    //--------------------------------
    const dialog = page.getByRole('dialog', { name: 'Manage Automation' });
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const searchInput = dialog.getByPlaceholder('Search...');
    await searchInput.fill(ruleName);
    await dialog.locator('#admin-search-button').click();
    await searchInput.evaluate(input => input.blur()); // remove focus to allow grid to update

    // Wait for the row to appear
    const row = dialog.locator('td', { hasText: ruleName }).first().locator('xpath=ancestor::tr');
    await expect(row).toBeVisible({ timeout: 20000 });

    // Hover over the row to reveal the Edit button
    await row.hover();
    const editButton = row.locator('button[title="Edit"]');
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click({ force: true });

    //--------------------------------
    // Update the Rule
    //--------------------------------
    // Update rule name
    await page.locator('#aaru_rule_name').fill(ruleNameEdited);

    /*
    // Update Birth Gender directly
    const genderInputEdit = page.locator('input[name="aaru_birth_gender_id_input"]');
    await genderInputEdit.click({ force: true });
    await genderInputEdit.fill('Male');
    await genderInputEdit.press('Tab'); // trigger change/blur
    await expect(genderInputEdit).toHaveValue('Male');
*/





    // Update Birth Gender directly
    const genderInputEdit = page.locator('input[name="aaru_birth_gender_id_input"]');
    await genderInputEdit.click({ force: true });
    await genderInputEdit.fill('Male');
    await genderInputEdit.press('Tab'); // trigger blur/change




    // ✅ Wait until the input value is actually "Male"
    await expect.poll(() => genderInputEdit.inputValue(), { timeout: 10000 }).toBe('Male');


// Then assert
    await expect(genderInputEdit).toHaveValue('Male');






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






    // Re-open to verify Birth Gender
    /*const updatedRow = dialog.locator('#automation-grid tbody tr', { hasText: ruleNameEdited });
    await expect(updatedRow).toBeVisible();

    const editButton2 = updatedRow.getByRole('button', { name: '' });
    await editButton2.click();

    const editDialog = page.getByRole('dialog', { name: /Auto Approval Rule/i });
    await expect(editDialog).toBeVisible();

    const birthGenderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    await expect(birthGenderInput).toHaveValue('Male');*/




/*
    // Locate the row containing the edited rule
    const updatedRow = dialog.locator('#automation-grid tbody tr', { hasText: ruleNameEdited });
    await expect(updatedRow).toBeVisible({ timeout: 20000 });
*/

/*
    // Wait for the table body to exist (even if empty at first)
    const tableBody = dialog.locator('#automation-grid tbody');
    await expect(tableBody).toBeAttached({ timeout: 20000 });

// Find the row containing the edited rule
    const updatedRow = tableBody.locator('tr', { hasText: ruleNameEdited });

// Scroll into view to force rendering in virtualized grid
    await updatedRow.scrollIntoViewIfNeeded({ timeout: 10000 });

// Hover to reveal Edit button
    await updatedRow.hover();









    const editButton2 = updatedRow.locator('button[title="Edit"]');
    await editButton2.scrollIntoViewIfNeeded();  // ensure it's fully visible
    await expect(editButton2).toBeVisible({ timeout: 10000 });
    await editButton2.click({ force: true });







// Wait for the edit dialog
    const editDialog = page.getByRole('dialog', { name: /Auto Approval Rule/i });
    await expect(editDialog).toBeVisible({ timeout: 10000 });

 */

// Verify Birth Gender value
    const birthGenderInput = page.locator('input[name="aaru_birth_gender_id_input"]');
    await expect(birthGenderInput).toHaveValue('Male', { timeout: 10000 });

});
