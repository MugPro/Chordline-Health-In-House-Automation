import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';


/*



test('CreateALetter', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `LetterCRUD`;
    const moduleValue = "Member Detail";
    //const letterName = `QA Wolf letter name ${Date.now()}`;
    const letterName = `QA Wolf letter name to delete`;
    const updateTemplate = `HRA Education Pages`;
    const url = process.env.DEFAULT_URL_2;

    // Sign in
    const { page, context, browser } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    // Safe cleanup: only attempt if letter exists
    try {
        const letterLocator = page.getByRole('gridcell', { name: letterName });
        if (await letterLocator.count() > 0) {
            await helpers.cleanupLetter(page, { letterName });
        } else {
            console.log(`Letter "${letterName}" not found — skipping cleanup`);
        }
    } catch (error) {
        console.log(`Cleanup failed but continuing test: ${error}`);
    }

    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Reports & Letters` button
    await page.getByText(`Reports & Letters`).click();

    // Click `Letters` tab
    await page
        .getByRole(`treeitem`, { name: `Letters` })
        .locator(`span`)
        .first()
        .click();

    // Click `New` button
    await page.getByRole(`button`, { name: `  New` }).click();

    // Fill in letter name
    const letterInput = page.getByRole(`textbox`, { name: `Letter Name:` });
    await letterInput.click();
    await letterInput.fill(letterName);

    // Click Template combobox
    await page.getByRole(`button`, { name: `expand combobox` }).click();

    // Select template
    await page
        .getByRole(`option`, { name: `CM Welcome Letter`, exact: true })
        .locator(`span`)
        .click();

    // Click `Screen type` combobox
    await page
        .getByLabel(`New Letter`)
        .getByText(`Select a screen type...`)
        .click();

    // Select module
    await page
        .getByRole(`option`, { name: moduleValue })
        .locator(`span`)
        .click();

    // Click `Save`
    await page.getByRole(`button`, { name: `Save` }).click();

    // Close modal
    await page.getByLabel(`New Letter`).getByText(`Close`, { exact: true }).click();
    await page.getByLabel(`New Letter`).getByText(`Close`, { exact: true }).click();



    // Close browser context
    await context.close();
    await browser.close();
});




 */












/*

test('CreateALetter', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `LetterCRUD`;
    const moduleValue = "Member Detail";
    const baseLetterName = `QA Wolf letter`; // base name for cleanup
    const url = process.env.DEFAULT_URL_2;

    // Sign in
    const { page, context, browser } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Pre-cleanup: delete the base letter if it exists
    //--------------------------------
    try {
        await helpers.cleanupLetter(page, { letterName: baseLetterName });
    } catch (error) {
        console.log(`Cleanup failed or letter not found — continuing test: ${error}`);
    }

    //--------------------------------
    // Generate a unique letter name for this test run
    //--------------------------------
    const letterName = `${baseLetterName} ${Date.now()}`; // guaranteed unique

    //--------------------------------
    // Act: create the letter
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Reports & Letters`).click();
    await page.getByRole(`treeitem`, { name: `Letters` }).locator(`span`).first().click();
    await page.getByRole(`button`, { name: `  New` }).click();

    // Fill Letter Name
    const letterInput = page.getByRole(`textbox`, { name: `Letter Name:` });
    await letterInput.fill(letterName);

    // Select Template
    await page.getByRole(`button`, { name: `expand combobox` }).click();
    await page.getByRole(`option`, { name: `CM Welcome Letter`, exact: true }).locator('span').click();

    // Select Screen Type
    await page.getByLabel(`New Letter`).getByText(`Select a screen type...`).click();
    await page.getByRole(`option`, { name: moduleValue }).locator('span').click();

    // Save
    await page.getByRole(`button`, { name: `Save` }).click();

    // Close modal safely
    const closeButton = page.locator('button[aria-label="Close"]').first();
    await closeButton.waitFor({ state: 'visible', timeout: 5000 });
    await closeButton.click();

    //--------------------------------
    // Assert: check that the letter exists
    //--------------------------------
    await page.getByRole(`dialog`, { name: `Manage Reports & Letters` })
        .getByPlaceholder(`Search...`)
        .fill(letterName);
    await page.locator(`#admin-search-button`).click();

    await expect(page.getByRole(`gridcell`, { name: letterName })).toBeVisible();
    await expect(page.getByRole(`gridcell`, { name: moduleValue })).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await context.close();
    await browser.close();
});


 */












test('CreateALetter', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `LetterCRUD`;
    const moduleValue = "Member Detail";
    const baseLetterName = `QA Wolf letter`; // base name for cleanup
    const url = process.env.DEFAULT_URL_2;

    // Sign in
    const { page, context, browser } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Pre-cleanup: delete any letter with the base name
    //--------------------------------
    try {
        await helpers.cleanupLetter(page, { letterName: baseLetterName });
    } catch (error) {
        console.log(`Cleanup failed or letter not found — continuing test: ${error}`);
    }

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

    // Close modal
    await page.getByLabel(`New Letter`).getByText(`Close`, { exact: true }).click();
    await page.getByLabel(`New Letter`).getByText(`Close`, { exact: true }).click();









    // Close New Letter modal (X button)
    const closeButton = page.locator(
        'button.k-window-titlebar-action[aria-label="Close"]'
    ).first();

    await closeButton.waitFor({ state: 'visible', timeout: 10000 });
    await closeButton.click();





    await page.getByText(`Tools`).click();
    await page.getByText(`Reports & Letters`).click();
    await page.getByRole(`treeitem`, { name: `Letters` }).locator(`span`).first().click();





    // Wait for Manage Reports & Letters dialog
    const manageDialog = page.getByRole('dialog', {
        name: 'Manage Reports & Letters',
    });

    await expect(manageDialog).toBeVisible({ timeout: 10000 });

// Wait for grid to be ready (search input exists)
    const searchInput = manageDialog.getByPlaceholder('Search...');
    await expect(searchInput).toBeVisible({ timeout: 10000 });




    await searchInput.fill(letterName);
    await page.locator('#admin-search-button').click();





    await expect(
        page.getByRole('gridcell', { name: letterName })
    ).toBeVisible();

    await expect(
        page.getByRole('gridcell', { name: moduleValue })
    ).toBeVisible();

// ✅ test ends naturally here


    //await context.close();
    //await browser.close();
});

