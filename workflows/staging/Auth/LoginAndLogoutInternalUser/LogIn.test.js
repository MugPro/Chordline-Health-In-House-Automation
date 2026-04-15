
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';

test('Log In an Internal User', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'LogInIntUser';
    const password = env.DEFAULT_PASS_OCT_2025;

    //--------------------------------
    // Act
    //--------------------------------
    const { page } = await helpers.launchWithoutLogin({
        url: env.DEFAULT_URL,
    });

    // Fill login form
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
        // Password reset screen not shown — continue
    }

    //--------------------------------
    // Wait for dashboard element instead of networkidle
    //--------------------------------
    const homeLink = page.getByText('Home', { exact: false });
    await homeLink.waitFor({ timeout: 10000 }); // wait until Home is visible

    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.waitFor({ timeout: 10000 }); // wait until logout button is visible

    //--------------------------------
    // Assert logged in
    //--------------------------------
    await expect(homeLink).toBeVisible();
    await expect(logoutButton).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await page.close();
});
