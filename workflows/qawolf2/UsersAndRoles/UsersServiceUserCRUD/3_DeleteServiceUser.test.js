import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

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

   // const password = process.env.DEFAULT_PASS_JUNE_2025;

    const password = process.env.DEFAULT_PASS_OCT_2025

    //--------------------------------
    // Login
    //--------------------------------
    const { browser, page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        slowMo: 800,
        password: process.env.DEFAULT_PASS_OCT_2025,
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
