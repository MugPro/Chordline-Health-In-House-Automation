import { test, expect } from '@playwright/test';
import {logIn, waitUntilLoaded, reportCleanupFailed, logIn3} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";

test('1_CreateServiceUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `ServiceUserCrud`;
   // const loginID = `emailUsers`;
    const group = `Users`;
    const tab = `Service`;
    const serviceName = `ServUserC`;
    const logInId = `QA-${serviceName}`;
    const accessJustification = `Service Account`;
    const securityRole = `Healthwise Service`;
    const memberRole = `All Member Access`;
    //const password = process.env.DEFAULT_PASS_JUNE_2025;
    const serviceNameEdit = `ServUserC-edit`;
    const accessJustificationEdit = `Provider`;
    const securityRoleEdit = `Fax Integration Service`;


   // const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

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
    await page.getByText(`Tools`).click();
    await page.getByText(`Users & Roles`).click();
    await page.getByRole(`treeitem`, { name: group }).locator(`span`).first().click();

    //--------------------------------
    // WAIT FOR USERS PAGE TO FULLY LOAD
    //--------------------------------
    //await waitUntilLoaded(page);



    await page
        .getByRole('tabpanel', { name: 'Internal' })
        .getByRole('grid')
        .waitFor({ state: 'visible', timeout: 20000 });




    //--------------------------------
    // Switch to External tab PROPERLY
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();

    await expect(
        page.getByRole('tabpanel', { name: tab })
    ).toBeVisible({ timeout: 20000 });

    //await waitUntilLoaded(page);

    const serviceTabPanel = page.getByRole('tabpanel', { name: tab });

/*
    //--------------------------------
    // Cleanup existing user (if exists)
    //--------------------------------
    try {
        await serviceTabPanel.getByPlaceholder('Search...').fill(serviceName);
        await serviceTabPanel.locator('#admin-search-button').click();
        await waitUntilLoaded(page);

        let attempts = 0;
        while (
            (await page.getByRole('gridcell', { name: serviceName }).first().isVisible()) &&
            attempts < 3
            ) {
            attempts++;
            await page.getByRole('gridcell', { name: serviceName }).first().click();
            await page
                .locator(`tr[aria-selected="true"]:has-text("${serviceName}") button[title="Delete"]`)
                .click();
            await page.getByRole('button', { name: 'Yes' }).click();
            await waitUntilLoaded(page);
        }
    } catch (e) {
        await reportCleanupFailed({ errorMsg: e.message });
    }

 */

    //--------------------------------
    // Act - Create Service User
    //--------------------------------
    await page.getByRole('button', { name: '  New' }).click();

    await page.locator('#user_first_name').fill(serviceName);
    await page.locator('#user_login_name').fill(logInId);
    await page.locator('#user_password').fill(password);
    await page.locator('#user_password_confirm').fill(password);
    await waitUntilLoaded(page);

    // Security Role
    await page.locator('input[name="user_security_role_id_input"]').fill(securityRole);
    await page.getByRole('option', { name: `​ ${securityRole}` }).click();


    // Member Role
    await page.locator('input[name="user_member_role_id_input"]').fill(memberRole);
    await page.getByRole('option', { name: `​ ${memberRole}` }).click();





    await page.locator('#user_password_confirm').fill(password);
    await waitUntilLoaded(page);






    await page.getByRole('button', { name: ' Save and Close' }).click();
    //await waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await serviceTabPanel.getByPlaceholder('Search...').fill(serviceName);
    await serviceTabPanel.locator('#admin-search-button').click();
    //await waitUntilLoaded(page);

    await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: serviceName, exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: accessJustification })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: securityRole })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();

    // Open the user row to verify details
    await page.getByRole('gridcell', { name: serviceName, exact: true }).dblclick();

    await expect(page.getByLabel('User - Service').getByText(serviceName, { exact: true })).toBeVisible();
    await expect(page.getByLabel('User - Service').getByText(logInId)).toBeVisible();
    await expect(page.getByLabel('User - Service').getByText(accessJustification)).toBeVisible();
    await expect(page.getByLabel('User - Service').getByText(securityRole)).toBeVisible();
    await expect(page.getByLabel('User - Service').getByText(memberRole)).toBeVisible();

    await browser.close();
});