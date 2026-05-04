import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {waitUntilLoaded} from "../../../../helpers/Node20Helpers.js";











test('CreateALetter', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    /*
    const loginID = `AdvancedSearch`;
    const password = process.env.DEFAULT_PASS_OCT_2025;

     */
    const moduleValue = "Member Detail";
    const baseLetterName = `QA Wolf letter`; // base name for cleanup



    const updateTemplate = 'HRA Education Pages';

    //const url = process.env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Sign in
    const { page, browser } = await helpers.logIn3({
        loginID,
        slowMo: 700,
        password,
        url: env.DEFAULT_URL_2,
    });

    await waitUntilLoaded(page);


    //--------------------------------
    // Generate a unique letter name
    //--------------------------------
    const letterName = `${baseLetterName} ${Date.now()}`; // guaranteed unique

    //--------------------------------
    // Act: create the letter
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Reports & Letters`).click();
    await page.getByRole(`treeitem`, { name: `Letters` }).locator(`span`).first().click();
    await page.getByRole(`button`, { name: `  New` }).click();

    // Fill Letter Name FIRST
    const letterInput = page.getByRole(`textbox`, { name: `Letter Name:` });
    await letterInput.click();
    await letterInput.fill(letterName);

    // Select Template
    await page.getByRole(`button`, { name: `expand combobox` }).click();
    await page.getByRole(`option`, { name: `CM Welcome Letter`, exact: true }).locator('span').click();

    // Select Screen Type
    await page.getByLabel(`New Letter`).getByText(`Select a screen type...`).click();
    await page.getByRole(`option`, { name: moduleValue }).locator('span').click();



    // Click `Save`
    await page.getByRole(`button`, { name: `Save` }).click();

    await waitUntilLoaded(page);

    // Close "New Letter" dialog using footer Close button
    await page
        .getByRole('dialog', { name: 'New Letter' })
        .getByText('Close', { exact: true })
        .click();

// Close "Manage Reports & Letters"


    /*
    await page
        .getByRole('dialog', { name: 'Manage Reports & Letters' })
        .getByText('Close', { exact: true })
        .click();

     */


    await waitUntilLoaded(page);
    await page.getByText('Close', { exact: true }).click();







    await page.getByText(`Tools`).click();
    await page.getByText(`Reports & Letters`).click();
    await page.getByRole(`treeitem`, { name: `Letters` }).locator(`span`).first().click();





    // Wait for Manage Reports & Letters dialog
    const manageDialog = page.getByRole('dialog', {
        name: 'Manage Reports & Letters',
    });

    await expect(manageDialog).toBeVisible();

// Wait for grid to be ready (search input exists)
    const searchInput = manageDialog.getByPlaceholder('Search...');
    await expect(searchInput).toBeVisible();




    await searchInput.fill(letterName);
    await page.locator('#admin-search-button').click();





    await expect(
        page.getByRole('gridcell', { name: letterName })
    ).toBeVisible();

    await expect(
        page.getByRole('gridcell', { name: moduleValue })
    ).toBeVisible();



















    const letterRow2 = page.locator('[role="gridcell"]').filter({ hasText: letterName }).first();
    await expect(letterRow2).toBeVisible();

    //--------------------------------
    // Act: Update the letter template
    //--------------------------------
    await letterRow2.click();
    await page.getByRole('button', { name: '' }).click(); // Edit button

    // Open Template dropdown and select new template
    await page.locator('[class="left outerfielddiv"]:has-text("Template") input ~ span').click();
    await page.getByRole('button', { name: 'expand combobox' }).click();
    await page.getByText(updateTemplate).click();

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();

    await waitUntilLoaded(page);









// --- Wait for Save to complete and close modal ---
    const closeEditModal = page.getByLabel('Edit Letter').getByText('Close', { exact: true });

    await closeEditModal.click();





    await waitUntilLoaded(page);





    //--------------------------------
    // Assert: verify updates
    //--------------------------------
    // Re-open letter to verify
    await searchInput.fill(letterName);
    await page.locator('#admin-search-button').click();
    const updatedLetterRow = page.locator('[role="gridcell"]').filter({ hasText: letterName }).first();
    await updatedLetterRow.click();
    await page.getByRole('button', { name: '' }).click(); // Edit again

    await waitUntilLoaded(page);

    // Template updated
    await expect(page.locator('input[name="letterTemplate_input"]')).toHaveValue(updateTemplate);

    // Screen Type unchanged
    await expect(
        page.locator(`span [class*="k-input-inner"] [class*="k-input-value-text"]:text("${moduleValue}")`)
    ).toBeVisible();





    await page.getByRole('dialog', { name: 'Edit Letter' }).getByLabel('Close').click();
    await waitUntilLoaded(page);
    await page.getByText('Close', { exact: true }).click();













    // Navigate
    await page.getByText('Tools').click();
    await page.getByText('Reports & Letters').click();
    await page
        .getByRole('treeitem', { name: 'Letters' })
        .locator('span')
        .first()
        .click();

    const manageDialog2 = page.getByRole('dialog', {
        name: 'Manage Reports & Letters',
    });

    await expect(manageDialog2).toBeVisible();

    const searchInput2 = manageDialog2.getByPlaceholder('Search...');
    await searchInput2.fill(baseLetterName);
    await page.locator('#admin-search-button').click();





    const letterCells = page
        .locator('[role="gridcell"]')
        .filter({ hasText: baseLetterName });

    while (await letterCells.count() > 0) {
        await letterCells.first().click();

        await page.getByRole('button', { name: '' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();

        //await waitUntilLoaded(page);

        // re-run search if required by your UI
        await searchInput.fill(baseLetterName);
        await page.locator('#admin-search-button').click();
        //await waitUntilLoaded(page);
    }







    // Assert deletion
    await searchInput.fill(baseLetterName);
    await page.locator('#admin-search-button').click();

    await expect(
        page.locator('[role="gridcell"]').filter({ hasText: baseLetterName })
    ).toHaveCount(0);
});

