// AbleToDownloadForm.test.js

import { test, expect } from '@playwright/test';

// 🔧 Update this path to match your helpers location (consistent with your suite)
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

// Node FS utilities for cleanup and assertions on the downloaded file
import { rm, mkdir, stat } from 'fs/promises';
import path from 'path';

/**
 * This test:
 * 1) Logs in
 * 2) Cleans up the temp download directory
 * 3) Navigates to Tools > Forms
 * 4) Initiates a Download for the target form
 * 5) Saves the file to team-storage tmp folder
 * 6) Verifies the file size is > 0
 */

test('Able to download a form', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `FormDL`;
    const formName = `General Form`;
    const downloadDir = `${process.env.HOME}/team-storage/tmp`;
    const downloadPath = path.join(downloadDir, 'formDownload');

    // Log in
    const { page } = await logIn({ loginID });

    //--------------------------------
    // Cleanup:
    //--------------------------------
    // Ensure the temp directory is clean
    await rm(downloadDir, { recursive: true, force: true }).catch(console.error);
    await mkdir(downloadDir, { recursive: true });

    //--------------------------------
    // Act:
    //--------------------------------
    // Navigate to Tools > Forms
    await page.getByText(`Tools`).click();
    await page.getByText(`Forms`).click();
    await waitUntilLoaded(page);

    // Verify the "Manage Forms" pop up is visible
    await expect(page.getByText(`Manage Forms`)).toBeVisible();

    // Click the form row (select it so the row actions are in the expected state)
    await page.getByRole(`gridcell`, { name: formName }).click();

    // Trigger the Download and capture the event
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page
            .locator(`table tbody tr:has-text("${formName}") [title="Download"]`)
            .click(),
    ]);

    // Save to our prepared path
    await download.saveAs(downloadPath);

    // Grab the stats of the saved file
    const fileStats = await stat(downloadPath);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert the file size is greater than 0
    expect(fileStats.size).toBeGreaterThan(0);

    // Close the page (optional)
    await page.close();
});