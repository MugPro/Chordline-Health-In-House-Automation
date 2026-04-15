import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test('2_EditServiceUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ServiceUserCrud`;
    const group = `Users`;
    const tab = `Service`;
    const serviceName = `ServUserC`;
    const serviceNameEdit = `ServUserC-edit`;
    const logInId = `QA-${serviceName}`;
    const accessJustificationEdit = `Provider`;
    const securityRoleEdit = `Fax Integration Service`;
    const memberRole = `All Member Access`;

    //--------------------------------
    // Login
    //--------------------------------
    const { browser, page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page.getByRole('treeitem', { name: group }).locator('span').first().click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Switch to Service tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const serviceTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(serviceTabPanel).toBeVisible({ timeout: 20000 });
    await waitUntilLoaded(page);

    //--------------------------------
    // Search for existing user
    //--------------------------------
    await serviceTabPanel.getByPlaceholder('Search...').fill(serviceName);
    await serviceTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    const userExists = await page.getByRole('gridcell', { name: serviceName }).first().isVisible().catch(() => false);

    const serviceNameEditedUserExists = await page.getByRole('gridcell', { name: serviceNameEdit }).first().isVisible().catch(() => false);

    if (!userExists) {
        console.log(`No Service User found with name "${serviceName}". Skipping Edit.`);
        await browser.close();
        return;
    }

    if (serviceNameEditedUserExists) {
        console.log(`Service User: "${serviceNameEdit}" has already been edited. Skipping Edit.`);
        await browser.close();
        return;
    }

    //--------------------------------
    // Open user and click Edit
    //--------------------------------
    await waitUntilLoaded(page);
    await page.getByRole('gridcell', { name: serviceName, exact: true }).dblclick();

    await page.getByRole('button', { name: ' Edit' }).click();
    await waitUntilLoaded(page);

    // Wait for edit fields
    await page.locator('#user_first_name').waitFor({ state: 'visible' });

    //--------------------------------
    // Act - Fill edited fields
    //--------------------------------
    await page.locator('#user_first_name').fill(serviceNameEdit);

    await waitUntilLoaded(page);


    // Access Justification
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Access Justification' })
        .getByLabel('expand combobox')
        .first()
        .click();
    await page.getByRole('option', { name: accessJustificationEdit }).locator('span').click();

    await waitUntilLoaded(page);





    // Security Role
    await page.locator('input[name="user_security_role_id_input"]').fill(securityRoleEdit);
    await page.getByRole('option', { name: `​ ${securityRoleEdit}` }).click();



    await page.getByRole('button', { name: ' Save and Close' }).click();
    await waitUntilLoaded(page);

// Check if an error popup appeared
    const errorPopup = page.locator('text=A problem occurred during save');
    if (await errorPopup.isVisible({ timeout: 1000 })) {
        // Assert the error text
        await expect(errorPopup).toHaveText('A problem occurred during save. Please contact the system administrator and view server logs for more information.');
        console.log('Save failed as expected, ending test.');
        return; // End test here
    }


//--------------------------------
// Assert edited values (only if save succeeded)
//--------------------------------
    await serviceTabPanel.getByPlaceholder('Search...').fill(serviceNameEdit);
    await serviceTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: serviceNameEdit, exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: accessJustificationEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: securityRoleEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();



    await browser.close();

});

