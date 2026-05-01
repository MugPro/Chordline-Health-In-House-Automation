
import { test, expect } from '@playwright/test';

// 🔧 Update this path to match your helpers location
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';

// Node FS utilities for cleanup and assertions on the downloaded file
import { rm, mkdir, stat } from 'fs/promises';
import path from 'path';
import {env} from "../../../../environments/staging.env.js";

/**
 * This test:
 * 1) Logs in
 * 2) Cleans up the temp download directory
 * 3) Navigates to Tools > Forms
 * 4) Initiates a Download for the target form
 * 5) Opens the form in a popup window
 * 6) Asserts expected content in the popup
 * 7) (Optional) Verifies the downloaded file exists and has size > 0
 */

test('Able to download a form', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'FormDL';
    const formName = 'General Form';
    const downloadDir = `${process.env.HOME}/team-storage/tmp`;
    const downloadPath = path.join(downloadDir, 'formDownload');

    // Log in
    //const { page } = await logIn({ loginID, slowMo: 10 });


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url, slowMo: 10 });



    //--------------------------------
    // Cleanup (downloads)
    //--------------------------------
    await rm(downloadDir, { recursive: true, force: true }).catch(() => {});
    await mkdir(downloadDir, { recursive: true });

    //--------------------------------
    // Act
    //--------------------------------

    // Navigate to Tools > Forms
    await page.getByText('Tools').click();
    await page.getByText('Forms').click();
    await waitUntilLoaded(page);

    // Verify modal/dialog is visible
    await expect(page.getByText('Manage Forms')).toBeVisible();

    // Select the form row so actions are enabled
    await page.getByRole('gridcell', { name: formName }).first().click();

    //--------------------------------
    // Trigger Download + Capture Popup
    //--------------------------------

    const [popup /*, download */] = await Promise.all([
        page.waitForEvent('popup'),
        // Optional: also capture the download event if needed
        // page.waitForEvent('download'),
        page
            .locator(`table tbody tr:has-text("${formName}") [title="Download"]`)
            .click(),
    ]);

    //--------------------------------
    // Assert (popup content)
    //--------------------------------

    await popup.waitForLoadState('domcontentloaded');

    await expect(popup.locator('body')).toContainText('Home');
    await expect(popup.locator('body')).toContainText('General Form');
    await expect(
        popup.locator('#administrative_header-anchor')
    ).toContainText('Administrative');

    //--------------------------------
    // Optional: Assert the downloaded file itself
    //--------------------------------
    /*
    await download.saveAs(downloadPath);
    const fileStats = await stat(downloadPath);
    expect(fileStats.size).toBeGreaterThan(0);
    */
});