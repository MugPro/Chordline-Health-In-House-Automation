/*

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';



test('Log Out as an Internal User', async () => {


    // Arrange
    //--------------------------------
    const loginID = 'LogInIntUser';
    const password = env.DEFAULT_PASS_OCT_2025;

    //--------------------------------
    // Act
    //--------------------------------
    const {page} = await helpers.launchWithoutLogin({
        url: env.DEFAULT_URL,
    });

    await page.getByRole('textbox', {name: 'Enter your Login ID'}).fill(loginID);
    await page.getByRole('textbox', {name: 'Enter your Password'}).fill(password);
    await page.getByRole('button', {name: 'SIGN IN'}).click();

    // Handle forced password reset (if shown)
    try {
        await page.getByText('Change Your Password', {exact: true}).waitFor({timeout: 5000});
        await page.getByRole('textbox', {name: 'Enter your New Password', exact: true}).fill(password);
        await page.getByRole('textbox', {name: 'Re-Enter your New Password'}).fill(password);
        await page.getByText('Reset password').click();
    } catch {
        // Password reset screen not shown — continue
    }


    // Logout
    await page.getByRole(`button`, {name: `  Logout`}).click();

//--------------------------------
// Assert:
//--------------------------------
// Assert we are taken back to the login portal
    await expect(
        page.getByRole(`textbox`, {name: `Enter your Login ID`}),
    ).toBeVisible();
    await expect(page).toHaveURL(/login/);

// Close the page
    await page.close();

});


 */




/*
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';

test('Log Out as an Internal User', async () => {
    // Arrange
    const loginID = 'LogInIntUser';
    const password = env.DEFAULT_PASS_OCT_2025;

    // Act
    const { page } = await helpers.launchWithoutLogin({
        url: env.DEFAULT_URL,
    });

    await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    // Handle forced password reset (if shown)
    const changePasswordHeader = page.getByText('Change Your Password', { exact: true });

    if (await changePasswordHeader.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page
            .getByRole('textbox', { name: 'Enter your New Password', exact: true })
            .fill(password);

        await page
            .getByRole('textbox', { name: 'Re-Enter your New Password' })
            .fill(password);

        await page.getByRole('button', { name: /reset password/i }).click();
    }

    // Assert logged in (sync point)
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();

    // Logout
    await logoutButton.click();

    // Assert logged out
    await expect(
        page.getByRole('textbox', { name: 'Enter your Login ID' })
    ).toBeVisible();

    await expect(page).toHaveURL(/login/);

    await page.close();
});


 */




/*
// workflows/staging/Auth/LoginAndLogoutInternalUser/LogOut.test.js

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';

test('Log Out as an Internal User', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'LogInIntUser';
    const password = env.DEFAULT_PASS_OCT_2025;

    // Launch page without login
    const { page } = await helpers.launchWithoutLogin({
        url: env.DEFAULT_URL,
    });

    // Fill login form
    await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    // Handle forced password reset (if shown)
    try {
        await page.getByText('Change Your Password', { exact: true }).waitFor({ timeout: 5000 });
        await page.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
        await page.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);
        await page.getByText('Reset password').click();
    } catch {
        // Password reset screen not shown — continue
    }

    //--------------------------------
    // Logout
    //--------------------------------
    // Optional: adjust viewport for consistency
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for post-login navigation to finish
    await page.waitForURL(/screen\.jsp/, { timeout: 15000 });

    // Locate Logout button safely (ignore icon + spacing)
    const logoutButton = page
        .getByRole('button')
        .filter({ hasText: 'Logout' });

    await expect(logoutButton).toBeVisible();

    // Click logout
    await logoutButton.click();

    //--------------------------------
    // Assert logged out
    //--------------------------------
    await expect(page.getByRole('textbox', { name: 'Enter your Login ID' })).toBeVisible();
    await expect(page).toHaveURL(/login/);

    // Cleanup
    await page.close();
});


 */


import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';

test('Log Out as an Internal User', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'LogInIntUser';
    const password = env.DEFAULT_PASS_OCT_2025;

    //--------------------------------
    // Act: Launch browser & login
    //--------------------------------
    const { page } = await helpers.launchWithoutLogin({ url: env.DEFAULT_URL });

    // Fill login form
    await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    // Handle forced password reset if shown
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
    // Wait for dashboard elements to appear
    //--------------------------------
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.waitFor({ timeout: 10000 }); // wait until logout button is visible

    const homeLink = page.getByText('Home', { exact: false });
    await homeLink.waitFor({ timeout: 10000 }); // wait until Home link is visible

    //--------------------------------
    // Assert dashboard is loaded
    //--------------------------------
    await expect(homeLink).toBeVisible();
    await expect(logoutButton).toBeVisible();

    //--------------------------------
    // Act: Click logout
    //--------------------------------
    await logoutButton.click();

    //--------------------------------
    // Assert returned to login page
    //--------------------------------
    const loginTextbox = page.getByRole('textbox', { name: 'Enter your Login ID' });
    await expect(loginTextbox).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/login/);

    //--------------------------------
    // Cleanup
    //--------------------------------
    await page.close();
});




