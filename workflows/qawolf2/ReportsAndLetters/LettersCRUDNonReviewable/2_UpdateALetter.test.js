import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('UpdateALetter', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'LetterCRUD';
    const moduleValue = 'Member Detail';
    const letterName = 'QA Wolf letter'; // the existing letter to update
    const updateTemplate = 'HRA Education Pages';
    const url = process.env.DEFAULT_URL_2;

    const { page, context, browser } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Navigate to Reports & Letters
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Reports & Letters').click();
    await page.getByRole('treeitem', { name: 'Letters' }).locator('span').first().click();

    const manageDialog = page.getByRole('dialog', { name: 'Manage Reports & Letters' });
    await expect(manageDialog).toBeVisible({ timeout: 10000 });

    //--------------------------------
    // Search for the existing letter
    //--------------------------------
    const searchInput = manageDialog.getByPlaceholder('Search...');
    await searchInput.fill(letterName);
    await page.locator('#admin-search-button').click();

    const letterRow = page.locator('[role="gridcell"]').filter({ hasText: letterName }).first();
    await expect(letterRow).toBeVisible({ timeout: 10000 });

    //--------------------------------
    // Act: Update the letter template
    //--------------------------------
    await letterRow.click();
    await page.getByRole('button', { name: '' }).click(); // Edit button

    // Open Template dropdown and select new template
    await page.locator('[class="left outerfielddiv"]:has-text("Template") input ~ span').click();
    await page.getByRole('button', { name: 'expand combobox' }).click();
    await page.getByText(updateTemplate).click();

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();









// --- Wait for Save to complete and close modal ---
    const closeEditModal = page.getByLabel('Edit Letter').getByText('Close', { exact: true });
    await closeEditModal.waitFor({ state: 'visible', timeout: 5000 });
    await closeEditModal.click();











    //--------------------------------
    // Assert: verify updates
    //--------------------------------
    // Re-open letter to verify
    await searchInput.fill(letterName);
    await page.locator('#admin-search-button').click();
    const updatedLetterRow = page.locator('[role="gridcell"]').filter({ hasText: letterName }).first();
    await updatedLetterRow.click();
    await page.getByRole('button', { name: '' }).click(); // Edit again

    // Template updated
    await expect(page.locator('input[name="letterTemplate_input"]')).toHaveValue(updateTemplate);

    // Screen Type unchanged
    await expect(
        page.locator(`span [class*="k-input-inner"] [class*="k-input-value-text"]:text("${moduleValue}")`)
    ).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await context.close();
    await browser.close();
});
