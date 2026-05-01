/*

import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

test('3_DeleteExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `ServiceUserCrud`;
    const loginID = `emailUsers`;
    const group = `Users`;
    const tab = `Service`;
    const serviceName = `ServUserC`;
    const serviceNameEdit = `ServUserC-edit`;
    const logInId = `QA-${serviceName}`;
    const accessJustificationEdit = `Provider`;
    const securityRoleEdit = `Fax Integration Service`;
    const memberRole = `All Member Access`;


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;


    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 800
    });

    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page.getByRole('treeitem', { name: group }).locator('span').first().click();
   // await waitUntilLoaded(page);

    //--------------------------------
    // Switch to External tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const externalTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(externalTabPanel).toBeVisible({ timeout: 20000 });
    //await waitUntilLoaded(page);

    //--------------------------------
    // Optional: search for user first (more stable)
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(serviceNameEdit);
    await externalTabPanel.locator('#admin-search-button').click();
    //await waitUntilLoaded(page);

    //--------------------------------
    // Act - Delete only if user exists
    //--------------------------------
    const userRow = page.getByRole('gridcell', { name: serviceNameEdit, exact: true });

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
        //await waitUntilLoaded(page);

        console.log(`User "${serviceNameEdit}" deleted successfully.`);
    } else {
        console.log(`User "${serviceNameEdit}" not found. Nothing to delete.`);
    }

    //--------------------------------
    // Assert - user should NOT exist
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: logInId })).not.toBeVisible();
    await expect(page.getByRole('gridcell', { name: serviceNameEdit })).not.toBeVisible();


    await browser.close();

});


 */



















import { test, expect } from '@playwright/test';
import { logIn3 } from '../../../../helpers/Node20Helpers.js';
import { env } from "../../../../environments/qawolf2.env.js";

test('3_DeleteServiceUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `emailUsers`;
    const group = `Users`;
    const tab = `Service`;

    const serviceName = `ServUserC`;
    const serviceNameEdit = `ServUserC-edit`;
    const logInId = `QA-${serviceName}`;

    const password = env.DEFAULT_PASS_OCT_2025;
    const url = env.DEFAULT_URL_2;

    //--------------------------------
    // Login
    //--------------------------------
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 800
    });

    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page.getByRole('treeitem', { name: group }).locator('span').first().click();

    //--------------------------------
    // Switch to Service tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const serviceTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(serviceTabPanel).toBeVisible({ timeout: 20000 });

    //--------------------------------
    // Search for service user
    //--------------------------------
    await serviceTabPanel.getByPlaceholder('Search...').fill(serviceNameEdit);
    await serviceTabPanel.locator('#admin-search-button').click();

    //--------------------------------
    // Delete service user IF it exists
    //--------------------------------
    const userCell = page.getByRole('gridcell', {
        name: serviceNameEdit,
        exact: true
    });

    // ✅ If user does not exist, test passes
    if (await userCell.count() === 0) {
        console.log(`Service user "${serviceNameEdit}" not found. Nothing to delete.`);
        await browser.close();
        return;
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

    //--------------------------------
    // Assert user no longer exists
    //--------------------------------
    await expect(
        page.getByRole('gridcell', { name: logInId })
    ).not.toBeVisible({ timeout: 10000 });

    await expect(
        page.getByRole('gridcell', { name: serviceNameEdit })
    ).not.toBeVisible({ timeout: 10000 });

    await browser.close();
});