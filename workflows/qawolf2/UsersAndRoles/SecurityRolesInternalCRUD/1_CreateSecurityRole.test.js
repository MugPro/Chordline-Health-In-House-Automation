/*import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    waitUntilLoaded,
    reportCleanupFailed,
    grabSecurityRoles,
    updateCheckBoxIdFromFlatTreeData,
} from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';

test('Security Roles - CRUD with random privileges selection', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------

    // NOTE: This workflow should be running on DEFAULT_URL but since it is currently bugged it was set up on DEFAULT_URL_2
    // Please update this when DEFAULT_URL is working again

    const loginID = `SecRoleIntCRUD`;
    const securityRoleName = `internalTestCRUD`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;

    // Sign in to the app
    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
    });

    // Navigate to "Tools" > "Users & Roles" > "Security Roles"
    await page.getByText(`Tools`).hover();
    await page.getByText(`Users & Roles`).click();
    await page.getByText(`Security Roles`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Cleanup (if roles already exist)
    //--------------------------------
    try {
        // Delete securityRoleName if exists
        const roleCell = page.getByRole(`gridcell`, {
            name: securityRoleName,
            exact: true,
        });

        if (await roleCell.isVisible().catch(() => false)) {
            await roleCell.click();

            await page
                .locator(
                    `tr:has(td:text-is("${securityRoleName}")) button[title="Delete"]`,
                )
                .click();

            await page.getByRole(`button`, { name: `Yes` }).click();
            await waitUntilLoaded(page);
        }

        // Delete securityRoleNameEdit if exists
        const roleEditCell = page.getByRole(`gridcell`, {
            name: securityRoleNameEdit,
            exact: true,
        });

        if (await roleEditCell.isVisible().catch(() => false)) {
            await roleEditCell.click();

            await page
                .locator(
                    `tr:has-text("${securityRoleNameEdit}") button[title="Delete"]`,
                )
                .click();

            await page.getByRole(`button`, { name: `Yes` }).click();
            await waitUntilLoaded(page);
        }
    } catch (e) {
        await reportCleanupFailed({
            errorMsg: e.message,
        });
    }

    //--------------------------------
    // Act:
    //--------------------------------

    // Click "+ New"
    await page.getByRole(`button`, { name: `  New` }).click();

    // Fill role name
    await page.locator(`#roleName`).fill(securityRoleName);

    // Expand all privileges
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    // Grab flattened tree
    let flatTreeData = await grabSecurityRoles(page);

    // Select 10 random roles
    const randomSelectRoles = faker.helpers.arrayElements(flatTreeData, 10);

    for (const role of randomSelectRoles) {
        console.log(`Checking role: ${role.title}`);
        await page.locator(`input[id="${role.checkboxId}"]`).check();
    }

    console.log('Selected roles:', randomSelectRoles);

    // Save and Close
    await page.getByRole(`button`, { name: `Save and Close` }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------

    // Assert new role is visible
    await expect(
        page.getByRole(`gridcell`, { name: securityRoleName }),
    ).toBeVisible();

    // Open the role
    await page
        .getByRole(`gridcell`, { name: securityRoleName })
        .dblclick();

    // Expand all again
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    // Re-grab updated tree
    flatTreeData = await grabSecurityRoles(page);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, randomSelectRoles);

    // Assert selected roles are still checked
    for (const role of randomSelectRoles) {
        await expect(
            page.locator(`input[id="${role.checkboxId}"]`),
        ).toBeChecked({ timeout: 3000 });
    }
});


 */




















import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    waitUntilLoaded,
    reportCleanupFailed,
    grabSecurityRoles,
    updateCheckBoxIdFromFlatTreeData, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';
import * as helpers from "../../../../helpers/Node20Helpers.js";
import {env} from "../../../../environments/qawolf2.env.js";

test('Security Roles - CRUD with random privileges selection', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------

    // NOTE: Should run on DEFAULT_URL once fixed
    //const loginID = `SecRoleIntCRUD`;
    //const loginID = `emailUsers`;
    const securityRoleName = `internalTestCRUD`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;



    //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });



    /*
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

     */

    // Navigate to Security Roles
    await page.getByText(`Tools`).hover();
    await page.getByText(`Users & Roles`).click();
    await page.getByText(`Security Roles`).click();
    await waitUntilLoaded(page);



    /*
    //--------------------------------
    // Cleanup
    //--------------------------------
    try {
        for (const roleName of [securityRoleName, securityRoleNameEdit]) {
            const roleCell = page.getByRole(`gridcell`, {
                name: roleName,
                exact: true,
            });

            if (await roleCell.isVisible().catch(() => false)) {
                await roleCell.click();

                await page
                    .locator(`tr:has(td:text-is("${roleName}")) button[title="Delete"]`)
                    .click();

                await page.getByRole(`button`, { name: `Yes` }).click();
                await waitUntilLoaded(page);
            }
        }
    } catch (e) {
        await reportCleanupFailed({
            errorMsg: e.message,
        });
    }

     */

    //--------------------------------
    // Act
    //--------------------------------


    // Click "+ New"
    await page.getByRole(`button`, { name: `  New` }).click();

// Wait for form to appear
    await expect(page.locator('#roleName')).toBeVisible();

// Expand all FIRST (this triggers Kendo re-render)
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

// NOW fill the role name AFTER re-render
    const roleNameInput = page.locator('#roleName');
    await roleNameInput.fill(securityRoleName);
    await expect(roleNameInput).toHaveValue(securityRoleName);






    // Grab tree
    let flatTreeData = await grabSecurityRoles(page);

    // Randomly select 10 privileges
    const randomSelectRoles = faker.helpers.arrayElements(flatTreeData, 10);

    for (const role of randomSelectRoles) {
        await page.locator(`input[id="${role.checkboxId}"]`).check();
    }

    // Save and Close (STABLE VERSION)
    await Promise.all([
        //page.waitForLoadState('networkidle'),
        page.getByRole(`button`, { name: `Save and Close` }).click(),
    ]);

    await waitUntilLoaded(page);

    // Wait explicitly for grid refresh
    await page.waitForSelector(
        `tr:has(td:text-is("${securityRoleName}"))`,
        { timeout: 15000 }
    );

    //--------------------------------
    // Assert
    //--------------------------------

    const newRoleCell = page.getByRole(`gridcell`, {
        name: securityRoleName,
        exact: true,
    });

    await expect(newRoleCell).toBeVisible({ timeout: 15000 });

    // Open role
    await newRoleCell.dblclick();

    // Expand again
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    // Re-grab tree and update checkbox IDs
    flatTreeData = await grabSecurityRoles(page);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, randomSelectRoles);

    // Assert selected privileges remain checked
    for (const role of randomSelectRoles) {
        await expect(
            page.locator(`input[id="${role.checkboxId}"]`)
        ).toBeChecked({ timeout: 5000 });
    }


    await browser.close();

});