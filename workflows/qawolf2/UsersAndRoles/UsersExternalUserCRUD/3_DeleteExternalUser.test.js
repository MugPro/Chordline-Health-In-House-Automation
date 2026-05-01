/*

import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import * as helpers from "../../../../helpers/Node20Helpers.js";
import {env} from "../../../../environments/qawolf2.env.js";

test('3_DeleteExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `ExternalUserCrud`;
    const loginID = `emailUsers`;
   // const password = process.env.DEFAULT_PASS_OCT_2025;
    const group = `Users`;
    const tab = `External`;

    const logInId = `QA-ExUserC`;         // original login id
    const firstNameEdit = `ExUserC2-edit`; // edited first name from Edit test

    //--------------------------------
    // Login
    //--------------------------------

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;


    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });


    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page.getByRole('treeitem', { name: group }).locator('span').first().click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Switch to External tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const externalTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(externalTabPanel).toBeVisible({ timeout: 20000 });
    await waitUntilLoaded(page);

    //--------------------------------
    // Optional: search for user first (more stable)
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(firstNameEdit);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Act - Delete only if user exists
    //--------------------------------
    const userRow = page.getByRole('gridcell', { name: firstNameEdit, exact: true });

    if (await userRow.isVisible({ timeout: 2000 })) {
        // Click row to select it
        await userRow.click();

        // Wait for delete button inside selected row
        const deleteButton = page.locator('tr[aria-selected="true"] button.delete-button');
        await deleteButton.waitFor({ state: 'visible', timeout: 3000 });

        // Click delete
        await deleteButton.click();

        // Confirm popup
        await page.getByRole('button', { name: 'Yes' }).click();
        await waitUntilLoaded(page);

        console.log(`User "${firstNameEdit}" deleted successfully.`);
    } else {
        console.log(`User "${firstNameEdit}" not found. Nothing to delete.`);
    }

    //--------------------------------
    // Assert - user should NOT exist
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: logInId })).not.toBeVisible();
    await expect(page.getByRole('gridcell', { name: firstNameEdit })).not.toBeVisible();


    await browser.close();

});


 */



















import { test, expect } from '@playwright/test';
import { logIn3, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { env } from "../../../../environments/qawolf2.env.js";

test('3_DeleteExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `emailUsers`;
    const group = `Users`;
    const tab = `External`;

    const logInId = `QA-ExUserC`;          // original login id
    const firstNameEdit = `ExUserC2-edit`; // edited first name

    const password = env.DEFAULT_PASS_OCT_2025;
    const url = env.DEFAULT_URL_2;

    //--------------------------------
    // Login
    //--------------------------------
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });

    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page.getByRole('treeitem', { name: group }).locator('span').first().click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Switch to External tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const externalTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(externalTabPanel).toBeVisible({ timeout: 20000 });
    await waitUntilLoaded(page);

    //--------------------------------
    // Search for the user (stable lookup)
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(firstNameEdit);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Delete user IF it exists
    //--------------------------------
    const userCell = page.getByRole('gridcell', {
        name: firstNameEdit,
        exact: true
    });

    // ✅ If user does not exist, end test successfully
    if (await userCell.count() === 0) {
        console.log(`External user "${firstNameEdit}" not found. Nothing to delete.`);
        await browser.close();
        return; // ✅ TEST PASSES
    }

    //--------------------------------
    // User exists → delete it
    //--------------------------------
    await userCell.click();

    const deleteButton = page.locator(
        'tr[aria-selected="true"] button.delete-button'
    );
    await deleteButton.waitFor({ state: 'visible', timeout: 3000 });
    await deleteButton.click();

    await page.getByRole('button', { name: 'Yes' }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert user no longer exists
    //--------------------------------
    await expect(
        page.getByRole('gridcell', { name: logInId })
    ).not.toBeVisible({ timeout: 10000 });

    await expect(
        page.getByRole('gridcell', { name: firstNameEdit })
    ).not.toBeVisible({ timeout: 10000 });

    await browser.close();
});