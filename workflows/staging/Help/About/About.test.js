import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

test('Help → About modal works', async () => {
    // --------------------------------
    // Arrange
    // --------------------------------
    const loginID = 'HelpAbout';
    const linkToUse = 'About';

    //const { page } = await helpers.logIn({ loginID });


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });




    // --------------------------------
    // Act
    // --------------------------------
    await page.getByText('Help', { exact: true }).hover();
    await page.getByText(linkToUse, { exact: true }).click();

    // --------------------------------
    // Assert
    // --------------------------------
    await expect(page.locator('#modal-window_wnd_title:has-text("About")')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'About' }).locator('#logo')).toBeVisible();
    await expect(page.locator('#applicationDetailsText')).toBeVisible();
    expect(await page.locator('#applicationDetailsText').innerText()).not.toEqual('');
    await expect(page.locator('[title="Copy system information to clipboard"]')).toBeEnabled();
    await expect(page.getByText('Close', { exact: true })).toBeEnabled();

    // --------------------------------
    // NOTE: do not close page/browser yet, leave it open
    // --------------------------------
});