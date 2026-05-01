/*
import { test, expect, chromium } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import fs from 'fs/promises';

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
test('User Guide PDF downloads and contains expected content', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpUserGuide';
    const linkToUse = 'User Guide';
    const docHeader = ['User Guide'];

    const { page } = await helpers.logIn({
        loginID
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
    // Assert – PDF contents
    //--------------------------------
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const pdfPage = await context.newPage();

    await pdfPage.goto('http://pdf-viewer.psc.qaw.internal/');

    pdfPage.once('filechooser', async (chooser) => {
        await chooser.setFiles(filePath);
    });

    await pdfPage.getByRole('button', { name: 'Tools' }).click();
    await pdfPage.getByRole('button', { name: 'Open' }).click();

    // Validate header text on page 1
    for (const header of docHeader) {
        await expect(
            pdfPage.getByLabel('Page ⁨1⁩').getByText(header, { exact: true })
        ).toBeVisible();
    }

    // Validate PDF has more than 1 page
    const pageIndicator = await pdfPage.getByText('of ⁨').first().innerText();
    const pageCount = Number(pageIndicator.split('⁨')[1]);

    expect(pageCount).toBeGreaterThan(1);

    await browser.close();
});


 */





/*

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import fs from 'fs/promises';

//--------------------------------
// Helper: get file size
//--------------------------------
async function getPdfFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
}

//--------------------------------
// Test: User Guide PDF downloads
//--------------------------------
test('User Guide PDF downloads successfully', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpUserGuide';
    const linkToUse = 'User Guide';

    const { page } = await helpers.logIn({ loginID });

    //--------------------------------
    // Act – hover and download PDF
    //--------------------------------
    await page.getByText('Help', { exact: true }).hover();

    const [download] = await Promise.all([
        page.waitForEvent('download'), // wait for the download event
        page.getByRole('link', { name: linkToUse, exact: true }).click(),
    ]);

    //--------------------------------
    // Assert – download exists and has size
    //--------------------------------
    const filePath = await download.path();
    expect(filePath).not.toBeNull();

    const fileSize = await getPdfFileSize(filePath);
    expect(fileSize).toBeGreaterThan(0);

    expect(download.suggestedFilename()).toBe(`${linkToUse}.pdf`);
});





 */







import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import fs from 'fs/promises';
import {env} from "../../../../environments/staging.env.js";
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
test('User Guide PDF downloads and is a valid PDF', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpUserGuide';
    const linkToUse = 'User Guide';

    //const { page } = await helpers.logIn({ loginID });



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
    // Assert – PDF validity
    //--------------------------------
    const validPdf = await isValidPdf(filePath);
    expect(validPdf).toBe(true);
});




