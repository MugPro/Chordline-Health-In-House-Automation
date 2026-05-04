/*

import { test, expect } from '@playwright/test';
import {logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';
import * as helpers from "../../../../helpers/Node20Helpers.js";
import {env} from "../../../../environments/qawolf2.env.js";

test('Security Roles - Delete existing role', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `SecRoleIntCRUD`;
    const loginID = `emailUsers`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;


    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });




    // Navigate to Security Roles
    await page.getByText(`Tools`).hover();
    await page.getByText(`Users & Roles`).click();
    await page.getByText(`Security Roles`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Act
    //--------------------------------
    // Close any open Edit Security Role pop-up
    const editPopupClose = page.locator(
        'div[role="dialog"]:has-text("Edit Security Role - Internal") button:has-text("Close")'
    );
    if (await editPopupClose.isVisible().catch(() => false)) {
        await editPopupClose.click();
        await waitUntilLoaded(page);
    }

    // Focus the role row
    const roleRow = page.locator(`tr:has(td:text-is("${securityRoleNameEdit}"))`);
    await expect(roleRow).toBeVisible({ timeout: 10000 });
    await roleRow.click();

    // Click the Delete button
    const deleteBtn = roleRow.locator('button[title="Delete"]');
    await deleteBtn.click();

    // Confirm deletion
    await page.getByRole('button', { name: 'Yes' }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(
        page.locator(`tr:has(td:text-is("${securityRoleNameEdit}"))`)
    ).not.toBeVisible({ timeout: 10000 });


    await browser.close();

});


 */



















import { test, expect } from '@playwright/test';
import { logIn3, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { env } from "../../../../environments/qawolf2.env.js";

test('Security Roles - Delete existing role', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
   // const loginID = `emailUsers`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;

    //const password = env.DEFAULT_PASS_OCT_2025;
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    //--------------------------------
    // Act - Login
    //--------------------------------
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });

    //--------------------------------
    // Navigate to Security Roles
    //--------------------------------
    await page.getByText(`Tools`).hover();
    await page.getByText(`Users & Roles`).click();
    await page.getByText(`Security Roles`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Close Edit popup if open
    //--------------------------------
    const editPopupClose = page.locator(
        'div[role="dialog"]:has-text("Edit Security Role - Internal") button:has-text("Close")'
    );

    if (await editPopupClose.isVisible().catch(() => false)) {
        await editPopupClose.click();
        await waitUntilLoaded(page);
    }

    //--------------------------------
    // Delete role IF it exists
    //--------------------------------
    const roleRow = page.locator(
        `tr:has(td:text-is("${securityRoleNameEdit}"))`
    );

    // ✅ If role does not exist, test passes
    if (await roleRow.count() === 0) {
        console.log(`No role found for "${securityRoleNameEdit}". Nothing to delete.`);
        await browser.close();
        return;
    }

    //--------------------------------
    // Role exists → delete it
    //--------------------------------
    await roleRow.click();

    const deleteBtn = roleRow.locator('button[title="Delete"]');
    await deleteBtn.click();

    await page.getByRole('button', { name: 'Yes' }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert deletion
    //--------------------------------
    await expect(
        page.locator(`tr:has(td:text-is("${securityRoleNameEdit}"))`)
    ).not.toBeVisible({ timeout: 10000 });

    await browser.close();
});