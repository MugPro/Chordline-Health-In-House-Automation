import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, mkdir, rm } from 'fs/promises';

import {
        logIn, logIn3,
        waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* --------------------------------
   ESM __dirname
-------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadsDir = path.join(__dirname, 'downloads');

test.use({ acceptDownloads: true });

test(
    'Attach existing Medication Summary PDF and verify download integrity',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'DownloadAttachmentMember';

        const member = {
            name: 'Abbott, QAWBrenda',
        };

        const pdfFileName = 'med summary.pdf';
        const medicationPdfPath = path.join(downloadsDir, pdfFileName);

        // ✅ Fail fast if PDF is missing
        if (!fs.existsSync(medicationPdfPath)) {
            throw new Error(
                `Required PDF not found at: ${medicationPdfPath}`,
            );
        }

        // ✅ Basic integrity check (image-based PDF safe)
        const stats = fs.statSync(medicationPdfPath);
        expect(stats.size).toBeGreaterThan(1000);

        //const { page } = await logIn({ loginID });

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                    url });





        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Member → Attachments
        //--------------------------------
        await page.getByRole('tab', { name: 'Members' }).click();

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member.name);

        await page.locator('#lookup-search-button:visible').click();

        await page
            .getByRole('gridcell', { name: member.name })
            .dblclick();

        await waitUntilLoaded(page);

        await page
            .getByRole('menuitem', { name: 'Member Detail' })
            .locator('span')
            .nth(1)
            .click();

        await page
            .locator('#shortcuts')
            .getByText('Attachments')
            .click();

        //--------------------------------
        // Create Attachment
        //--------------------------------
        await page.getByRole('button', { name: ' Attachment' }).click();
        await expect(page.getByText('Attachment:')).toBeVisible();

        page.once('filechooser', async chooser => {
            await chooser.setFiles(medicationPdfPath);
        });

        await page.getByRole('button', { name: 'Select files...' }).click();

            await waitUntilLoaded(page);

        //--------------------------------
        // Attachment metadata
        //--------------------------------
        await page
            .locator('input[name="atch_reason_id__1_input"]')
            .fill('Consent Form');
        await page.getByRole('option', { name: 'Consent Form' }).click();

        await page
            .locator('input[name="atch_type_id__1_input"]')
            .fill('Compliance');
        await page.getByRole('option', { name: 'Compliance' }).click();

        await page
            .locator('#atch_description__1')
            .fill('Medication Summary');

        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert attachment row exists
        //--------------------------------

       // await expect(attachmentRow).toBeVisible();
        await expect(page.getByText(pdfFileName)).toBeVisible();

        //--------------------------------
        // Open attachment → Download
        //--------------------------------
        await page.getByText(pdfFileName).dblclick();
        await expect(page.getByText(`Attachment:`)).toBeVisible();

        const tmpDir = path.join(process.cwd(), 'tmp');
        await rm(tmpDir, { recursive: true, force: true });
        await mkdir(tmpDir);

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: ' Download' }).click(),
        ]);

        const downloadedAttachmentPath = path.join(
            tmpDir,
            'downloaded-attachment.pdf',
        );

        await download.saveAs(downloadedAttachmentPath);

        //--------------------------------
        // Assert: byte-for-byte equality
        //--------------------------------
        const [originalBuf, downloadedBuf] = await Promise.all([
            readFile(medicationPdfPath),
            readFile(downloadedAttachmentPath),
        ]);

        expect(originalBuf).toStrictEqual(downloadedBuf);

        //--------------------------------
        // Close attachment modal
        //--------------------------------
        await page.getByRole('button', { name: ' Close' }).click();

        console.log('✅ Medication Summary attached and verified via byte comparison');


















        //--------------------------------
// Delete attachment row
//--------------------------------
        const attachmentRow = page
            .locator('#attachments-child-grid table tbody tr')
            .filter({ hasText: pdfFileName });

// Row should exist
        await expect(attachmentRow).toBeVisible();

// Click once on the row
        await attachmentRow.click();

// Hover to reveal delete icon
        await attachmentRow.hover();

// Click trash icon
        await attachmentRow.locator('[title="Delete"]').click();

// Confirm delete
        await page.getByRole('button', { name: 'Yes' }).click();
        await waitUntilLoaded(page);

// Assert removed
        await expect(attachmentRow).not.toBeVisible();

        console.log('✅ Attachment successfully deleted');








    },


);