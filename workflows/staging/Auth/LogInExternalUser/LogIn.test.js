import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';

test('Log In an External User', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'LogInExUser';
    const fullName = 'LogInExUser Qaw';
    const password = env.DEFAULT_PASS_OCT_2025;
    const url = `${env.DEFAULT_URL}providerportal`;

    //--------------------------------
    // Act
    //--------------------------------
    const { page } = await helpers.launchWithoutLogin({ url });

    // Fill in login form
    await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    // Handle forced password reset (if shown)
    try {
        const resetPrompt = page.getByText('Change Your Password', { exact: true });
        await resetPrompt.waitFor({ timeout: 5000 });
        await page.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
        await page.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);
        await page.getByText('Reset password').click();
    } catch {
        console.log('Change Your Password did not appear.');
    }

    //--------------------------------
    // Wait for dashboard elements
    //--------------------------------
    const homeLink = page.getByText('Home', { exact: false });
    await homeLink.waitFor({ timeout: 10000 });

    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.waitFor({ timeout: 10000 });

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(homeLink).toBeVisible();
    await expect(logoutButton).toBeVisible();

    // Change viewport for consistency
    await page.setViewportSize({ width: 1280, height: 720 });

    //--------------------------------
    // Cleanup
    //--------------------------------
    await logoutButton.click();

    // Verify we are back on provider portal login
    await expect(page.getByRole('textbox', { name: 'Enter your Login ID' })).toBeVisible();
    await expect(page).toHaveURL(/providerportal/);

    // Close the page
    await page.close();
});
