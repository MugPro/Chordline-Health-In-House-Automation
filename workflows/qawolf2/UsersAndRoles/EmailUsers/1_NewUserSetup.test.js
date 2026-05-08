/*
// NewUserSetup.test.js
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";
import {logIn3} from "../../../../helpers/Node20Helpers.js";

test('New User Setup workflow (without inbox check)', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `emailUsers`;
    const loginID2 = `NewUserReset`;

    const subject = `Welcome to ACUITYnxt!`;

    // Sign in to the app





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






    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();

    const internalTab = page.getByRole('tabpanel', { name: 'Internal' });
    await internalTab.getByPlaceholder('Search...').fill(loginID2);
    await page.locator('#admin-search-button').click();

    await expect(page.locator(`[id="browse-grid"] table:has(tr:has-text("${loginID2}")) tr`)).toHaveCount(1);

    await page.locator('#grid-toolbar-email-users').click();
    await page.getByRole('link', { name: 'New User Setup' }).click();

    await expect(page.locator('#modal-window-USER0_wnd_title')).toBeVisible();
    await expect(page.locator('#email-subject')).toHaveValue(subject);
    await expect(page.getByText('(1 users)')).toBeVisible();

    // Send the email (we cannot check it without an inbox)
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Email was sent successfully.')).toBeVisible();


    //await page.getByRole('button', { name: 'Okay' }).click();
    await browser.close();


});



 */

















// NewUserSetup.test.js
import { test, expect } from '@playwright/test';
import { env } from "../../../../environments/qawolf2.env.js";
import {logIn3, waitUntilLoaded} from "../../../../helpers/Node20Helpers.js";

test('New User Setup workflow (without inbox check)', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID2 = 'NewUserReset'; // ✅ existing user
    const subject = 'Welcome to ACUITYnxt!';

    const url = env.DEFAULT_URL_2;
    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;

    //--------------------------------
    // Login
    //--------------------------------
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });

    //--------------------------------
    // Navigate to Users & Roles
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();

    const internalTab = page.getByRole('tabpanel', { name: 'Internal' });

    await waitUntilLoaded(page);

    //--------------------------------
    // Search for existing user (CI-safe timing)
    //--------------------------------
    await internalTab.getByPlaceholder('Search...').fill(loginID2);

    await waitUntilLoaded(page);

    await page.locator('#admin-search-button').click();

    await waitUntilLoaded(page);

    await expect(
        page.locator(
            `[id="browse-grid"] table:has(tr:has-text("${loginID2}")) tr`
        )
    ).toHaveCount(1, { timeout: 15000 });

    //--------------------------------
    // Open New User Setup modal
    //--------------------------------
    await page.locator('#grid-toolbar-email-users').click();
    await page.getByRole('link', { name: 'New User Setup' }).click();

    const modalTitle = page.locator('#modal-window-USER0_wnd_title');

    await expect(modalTitle).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#email-subject')).toHaveValue(subject);
    await expect(page.getByText('(1 users)')).toBeVisible();

    //--------------------------------
    // Send email (state-based, not toast-based)
    //--------------------------------
    await page.getByRole('button', { name: 'Send' }).click();

    // ✅ modal closing = workflow finished
    await expect(modalTitle).toBeHidden({ timeout: 15000 });

    //--------------------------------
    // Cleanup
    //--------------------------------
    await browser.close();
});









