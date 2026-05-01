import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';
import fs from 'node:fs/promises';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

// Utility: get file size
async function getPdfFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
}

test('Help → Administration Guide PDF downloads', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpAdministrationGuide';
    const linkToUse = 'Administration Guide';



    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });





    // Sign in using Wolf2 URL
    /*
    const { page } = await helpers.logIn({
        loginID,
    });

     */

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText('Help', { exact: true }).hover();

    // Wait for PDF download
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('link', { name: linkToUse, exact: true }).click()
    ]);

    const filePath = await download.path();
    const fileSize = await getPdfFileSize(filePath);

    //--------------------------------
    // Assert
    //--------------------------------

    // File downloaded
    expect(download.suggestedFilename()).toBe(`${linkToUse}.pdf`);

    // File is not empty
    expect(fileSize).toBeGreaterThan(0);

    // ----------------------------------------
    // ❗ INTERNAL PDF VIEWER SKIPPED (OPTION A)
    // ----------------------------------------
    console.log('Internal PDF viewer step skipped because host is unreachable.');

});
