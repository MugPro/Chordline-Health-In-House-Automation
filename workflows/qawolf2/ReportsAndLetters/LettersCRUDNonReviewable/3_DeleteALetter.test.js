import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';





/*



test('DeleteALetter', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `LetterCRUD`;
    const moduleValue = "Member Detail";
    const letterName = `QA Wolf letter`; // change if you want dynamic name
    const url = process.env.DEFAULT_URL_2;

    // Sign in
    const { page, context, browser } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    // Navigate to Reports & Letters
    await page.getByText('Tools').click();
    await page.getByText('Reports & Letters').click();
    await page.getByRole('treeitem', { name: 'Letters' }).locator('span').first().click();

    //--------------------------------
    // Act:
    //--------------------------------
    // Check if the letter exists first
    const letterLocator = page.getByRole('gridcell', { name: letterName });
    if (await letterLocator.count() > 0) {
        // Click the letter
        await letterLocator.click();

        // Click the delete button
        await page.getByRole('button', { name: '' }).click();

        // Confirm deletion
        await page.getByRole('button', { name: 'Yes' }).click();

        console.log(`Letter "${letterName}" deleted successfully`);
    } else {
        console.log(`Letter "${letterName}" not found — skipping deletion`);
    }

    //--------------------------------
    // Assert:
    //--------------------------------
    // Ensure letter is no longer visible
    await expect(letterLocator).not.toBeVisible({ timeout: 5000 });

    //--------------------------------
    // Cleanup
    //--------------------------------
    await context.close();
    await browser.close();
});

 */


test('DeleteALetter', async () => {
    const loginID = 'LetterCRUD';
    const baseLetterName = 'QA Wolf letter';
    const url = process.env.DEFAULT_URL_2;

    const { page } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    // Navigate
    await page.getByText('Tools').click();
    await page.getByText('Reports & Letters').click();
    await page
        .getByRole('treeitem', { name: 'Letters' })
        .locator('span')
        .first()
        .click();

    const manageDialog = page.getByRole('dialog', {
        name: 'Manage Reports & Letters',
    });

    await expect(manageDialog).toBeVisible({ timeout: 10000 });

    const searchInput = manageDialog.getByPlaceholder('Search...');
    await searchInput.fill(baseLetterName);
    await page.locator('#admin-search-button').click();

    // ✅ partial match locator
    const letterRow = page
        .locator('[role="gridcell"]')
        .filter({ hasText: baseLetterName })
        .first();

    // If nothing to delete → exit cleanly
    if (await letterRow.count() === 0) {
        console.log('No matching letter found — skipping delete');
        return;
    }

    // Delete
    await letterRow.click();
    await page.getByRole('button', { name: '' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    // Assert deletion
    await searchInput.fill(baseLetterName);
    await page.locator('#admin-search-button').click();

    await expect(
        page.locator('[role="gridcell"]').filter({ hasText: baseLetterName })
    ).toHaveCount(0);
});
