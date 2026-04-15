import { test, expect } from '@playwright/test';
import { waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';

test('Security Roles - Delete existing role', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `SecRoleIntCRUD`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;

    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
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

    await page.close();
});
