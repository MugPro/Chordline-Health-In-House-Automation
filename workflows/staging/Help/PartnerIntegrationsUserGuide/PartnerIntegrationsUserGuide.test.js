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
test('Partner Integrations User Guide downloads and is valid', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpPartnerKntegrationsUserGuide';
    const linkToUse = 'Partner Integrations User Guide';
    const docHeader = ['Partner', 'Integrations', 'Guide'];

    const { page } = await helpers.logIn({ loginID, url: process.env.DEFAULT_URL });

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
    // Optional: Assert PDF contents using viewer (only if accessible)
    //--------------------------------
    // If your internal viewer is accessible, you can uncomment this section

    /*
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const pdfPage = await context.newPage();

    await pdfPage.goto('http://pdf-viewer.psc.qaw.internal/');
    pdfPage.once('filechooser', async (chooser) => {
      await chooser.setFiles(filePath);
    });
    await pdfPage.getByRole('button', { name: 'Tools' }).click();
    await pdfPage.getByRole('button', { name: 'Open' }).click();

    for (const header of docHeader) {
      await expect(
        pdfPage.getByLabel('Page ⁨1⁩').getByText(header, { exact: true })
      ).toBeVisible();
    }

    const pageIndicator = await pdfPage.getByText('of ⁨').first().innerText();
    const pageCount = Number(pageIndicator.split('⁨')[1]);
    expect(pageCount).toBeGreaterThan(1);

    await browser.close();

     */

});
