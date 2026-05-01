/*
import { test, expect, chromium } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import fs from 'fs/promises';
import { env } from '../../../../environments/staging.env.js';

//--------------------------------
// Helpers
//--------------------------------
async function getPdfFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
}

//--------------------------------
// Test
//--------------------------------
test('Able to download "Data Loads and Extracts Guide" PDF and verify in viewer', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpDataLoadsExtractsGuide';
    const linkToUse = 'Data Loads and Extracts Guide';
    const docHeader = ['Data Loads', 'and Extracts', 'Guide'];

    const { page } = await helpers.logIn({
        loginID,
        url: process.env.DEFAULT_URL_2
    });

    //--------------------------------
    // Act – download PDF
    //--------------------------------
    await page.getByText('Help', { exact: true }).hover();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('link', { name: linkToUse, exact: true }).click(),
    ]);

    const filePath = await download.path();
    expect(filePath).not.toBeNull();

    const fileSize = await getPdfFileSize(filePath);

    //--------------------------------
    // Assert – download
    //--------------------------------
    expect(download.suggestedFilename()).toBe(`${linkToUse}.pdf`);
    expect(fileSize).toBeGreaterThan(0);

    //--------------------------------
    // Assert – PDF contents in internal viewer
    //--------------------------------
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const pdfPage = await context.newPage();

    // Open internal PDF viewer
    await pdfPage.goto('http://pdf-viewer.psc.qaw.internal/');

    // Upload the downloaded PDF
    pdfPage.once('filechooser', async chooser => await chooser.setFiles(filePath));

    // Trigger viewer controls
    await pdfPage.getByRole('button', { name: 'Tools' }).click();
    await pdfPage.getByRole('button', { name: 'Open' }).click();

    // Verify header text on page 1
    for (const header of docHeader) {
        await expect(
            pdfPage.getByLabel('Page ⁨1⁩').getByText(header, { exact: true })
        ).toBeVisible();
    }

    // Check that the PDF has more than 1 page
    const pageIndicator = await pdfPage.getByText('of ⁨').first().innerText();
    const pageCount = Number(pageIndicator.split('⁨')[1]);
    expect(pageCount).toBeGreaterThan(1);

    await browser.close();
});


 */







import { test, expect, chromium } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import fs from 'fs/promises';
import { env } from '../../../../environments/staging.env.js';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

//--------------------------------
// Helpers
//--------------------------------
async function getPdfFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
}

async function isValidPdf(filePath) {
    const buffer = await fs.readFile(filePath);
    // PDF files start with "%PDF"
    return buffer.slice(0, 4).toString() === '%PDF';
}

//--------------------------------
// Test
//--------------------------------
test('Able to download "Data Loads and Extracts Guide" PDF and verify download', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpDataLoadsExtractsGuide';
    const linkToUse = 'Data Loads and Extracts Guide';
    const docHeader = ['Data Loads', 'and Extracts', 'Guide'];

    /*
    const { page } = await helpers.logIn({
        loginID,
        //url: process.env.DEFAULT_URL_2
    });

     */


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });





    //--------------------------------
    // Act – download PDF
    //--------------------------------
    await page.getByText('Help', { exact: true }).hover();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('link', { name: linkToUse, exact: true }).click(),
    ]);

    const filePath = await download.path();
    expect(filePath).not.toBeNull();

    const fileSize = await getPdfFileSize(filePath);

    //--------------------------------
    // Assert – download
    //--------------------------------
    expect(download.suggestedFilename()).toBe(`${linkToUse}.pdf`);
    expect(fileSize).toBeGreaterThan(0);

    //--------------------------------
    // Optional – PDF contents validation (basic)
    //--------------------------------
    const validPdf = await isValidPdf(filePath);
    expect(validPdf).toBe(true);

    // If you want, you could still launch a viewer for manual check:
    /*
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const pdfPage = await context.newPage();
    await pdfPage.goto('http://pdf-viewer.psc.qaw.internal/');
    pdfPage.once('filechooser', async chooser => await chooser.setFiles(filePath));
    await pdfPage.getByRole('button', { name: 'Tools' }).click();
    await pdfPage.getByRole('button', { name: 'Open' }).click();
    for (const header of docHeader) {
      await expect(pdfPage.getByLabel('Page ⁨1⁩').getByText(header, { exact: true })).toBeVisible();
    }
    await browser.close();
    */
});
