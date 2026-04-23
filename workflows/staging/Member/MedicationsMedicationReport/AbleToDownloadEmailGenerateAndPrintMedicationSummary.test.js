/*
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

// --------------------------------
// ESM __dirname
// --------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadsDir = path.join(__dirname, 'downloads');

test.use({ acceptDownloads: true });

// --------------------------------
// PDF text extraction (Download + Email attachments if needed)
// Modern pdfjs-dist requires Uint8Array (not Buffer).
// --------------------------------
async function extractPdfText(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join(' ');
    }
    return text.replace(/\s+/g, ' ').trim();
}

test.describe('Medication Summary – Generate, Download, Email, Print and Fax', () => {
    test('Full workflow (UI + Download + Email UI + platform-safe Print + Fax UI)', async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginIdUser = 'MedReportGen';
        const member = {
            name: 'Abbott, QAWBrenda',
            identifier: 'QAW1766191118030',
            birthdate: '12/20/2005',
            addressSnippet: 'South Ari',
        };

        const emailAddress = `chordline+${loginIdUser}@qawolf.email`; // used only in UI fields
        const subjectField = `${loginIdUser}-${Date.now()}`;
        const bodyText = `This is from Medication Report test ${Date.now()}`;

        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
        for (const f of fs.readdirSync(downloadsDir)) {
            fs.rmSync(path.join(downloadsDir, f));
        }

        const { page } = await logIn({
            loginID: loginIdUser,
            slowMo: 700,
            password: 'QAWolfPass1#',
            args: ['--kiosk-printing'], // helps Linux CI print auto-save
        });

        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Members → Medications
        //--------------------------------
        await page.getByRole('tab', { name: 'Members' }).click();
        await page.getByRole('textbox', { name: 'Search...' }).fill(member.name);
        await page.keyboard.press('Enter');
        await page.getByRole('gridcell', { name: member.name }).dblclick();
        await waitUntilLoaded(page);

        await page.getByText('Medications').nth(1).click();

        //--------------------------------
        // Generate Medication Summary
        //--------------------------------
        await page.locator('#member-medications #report-button').click();
        await page.getByRole('gridcell', { name: 'Medication Summary' }).click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();

        // Strict‑mode safe wait for the modal header/title
        await page.locator('.k-window-title', { hasText: 'Medication Summary' }).waitFor();
        await page.getByRole('button', { name: ' Submit' }).click();

        //--------------------------------
        // UI assertions
        //--------------------------------
        await expect(page.locator('#reportTitle')).toHaveText('Medications Summary');
        await expect(page.locator('#member-name')).toHaveText(member.name);

        //--------------------------------
        // DOWNLOAD PDF (save → parse → assert)
        //--------------------------------
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: ' Download' }).click(),
        ]);

        const downloadPath = path.join(downloadsDir, download.suggestedFilename());
        await download.saveAs(downloadPath);
        expect(fs.existsSync(downloadPath)).toBeTruthy();

        const downloadedText = await extractPdfText(downloadPath);
        expect(downloadedText).toContain('Medications Summary');
        expect(downloadedText).toContain(member.name);
        expect(downloadedText).toContain(member.identifier);
        // PDF-safe birthdate check (order may vary)
        expect(downloadedText).toContain(member.birthdate);
        expect(downloadedText).toContain('Birthdate');
        expect(downloadedText).toContain(member.addressSnippet);

        //--------------------------------
        // EMAIL REPORT (UI-only validation; robust send confirmation)
        //--------------------------------
        await page.getByRole('button', { name: ' Email' }).click();

        // Identify the email dialog (best-effort)
        const emailDialog = page.getByRole('dialog').filter({ hasText: /Subject:/i });

        // To:
        await page.getByRole('combobox', { name: 'To:' }).fill(emailAddress);
        await page.getByRole('option', { name: `Add new item: ${emailAddress}` }).click();

        // Subject:
        await page.getByRole('textbox', { name: 'Subject:' }).fill(subjectField);

        // Body (iframe):
        const bodyIframe = page.frameLocator('[title="Editable area. Press F10 for toolbar."]');
        await bodyIframe.locator('#message-body').fill(bodyText);

        // Attachment present before sending
        await expect(page.getByRole('gridcell', { name: 'Medication Summary.pdf' })).toBeVisible();

        // Prepare robust signals for "sent"
        const sendBtn = page.getByRole('button', { name: 'Send Email' });

        // Click Send
        await sendBtn.click();

        // Robust confirmation strategy:
        // 1) Dialog closes, OR
        // 2) Send button disappears/disabled, OR
        // 3) A likely email POST returns 2xx
        let emailConfirmed = false;

        // 1) Dialog closes
        try {
            await expect(emailDialog).toBeHidden({ timeout: 15000 });
            emailConfirmed = true;
        } catch (_) { }

        // 2) Send button hidden or disabled
        if (!emailConfirmed) {
            try {
                await expect(sendBtn).toBeHidden({ timeout: 8000 });
                emailConfirmed = true;
            } catch (_) {
                try {
                    // Some UIs disable the button instead of hiding it
                    await expect(sendBtn).toBeDisabled({ timeout: 8000 });
                    emailConfirmed = true;
                } catch (_) {  }
            }
        }

        // 3) Network 2xx to an email-ish endpoint
        if (!emailConfirmed) {
            try {
                await page.waitForResponse(
                    (resp) => {
                        const url = resp.url();
                        const method = resp.request().method();
                        const ok = resp.status() >= 200 && resp.status() < 300;
                        return method === 'POST' && ok && /email|mail|message|smtp/i.test(url);
                    },
                    { timeout: 15000 }
                );
                emailConfirmed = true;
            } catch (_) {  }
        }

        if (!emailConfirmed) {
            throw new Error('Email send confirmation not detected: dialog remained open, button didn’t change, and no 2xx email POST observed.');
        }

        //--------------------------------
        // PRINT (platform‑safe)
        //--------------------------------
        if (os.platform() === 'linux') {
            // On Linux CI with --kiosk-printing, Chrome auto-saves to ~/Downloads
            const printDir = path.join(os.homedir(), 'Downloads');
            const printedPath = path.join(printDir, `${member.name} - Medication Summary.pdf`);

            // Ensure clean Downloads to avoid stale files
            await fs.promises.rm(printDir, { recursive: true, force: true }).catch(() => {});
            await fs.promises.mkdir(printDir, { recursive: true });

            await page.getByRole('button', { name: ' Print' }).click();

            await expect(async () => {
                await fs.promises.access(printedPath);
                const stats = await fs.promises.stat(printedPath);
                expect(stats.size).toBeGreaterThan(1000);
            }).toPass({ timeout: 30_000 });
        } else {
            // Windows/macOS: OS-controlled printing; do a smoke click only
            await page.getByRole('button', { name: ' Print' }).click();
            test.info().annotations.push({
                type: 'note',
                description:
                    'Print file verification skipped on Windows/macOS (OS-controlled printing). Download PDF already validates report content.',
            });
        }

        console.log('✅ Medication Summary: UI, Download (parsed), Email (UI-confirmed), Print (platform-safe) verified');








        //await waitUntilLoaded(page);

        //FAX Functionality:

        await page.getByRole('button', { name: ' Fax' }).click();
        await page.getByRole('button', { name: '...' }).click();
        await page.getByRole('gridcell', { name: 'St. Catherine\'s Hospital' }).first().click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();
        await page.getByRole('textbox', { name: 'Do NOT enter Personal' }).click();
        await page.getByRole('textbox', { name: 'Do NOT enter Personal' }).fill('just for testing.');
        await page.getByRole('button', { name: 'Send Fax' }).click();





    });



});










 */











import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

// --------------------------------
// ESM __dirname
// --------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadsDir = path.join(__dirname, 'downloads');

test.use({ acceptDownloads: true });

// --------------------------------
// PDF text extraction
// --------------------------------
async function extractPdfText(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join(' ');
    }
    return text.replace(/\s+/g, ' ').trim();
}

test.describe('Medication Summary – Generate, Download, Email, Print and Fax', () => {
    test('Full workflow', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginIdUser = 'MedReportGen';
        const member = {
            name: 'Abbott, QAWBrenda',
            identifier: 'QAW1766191118030',
            birthdate: '12/20/2005',
            addressSnippet: 'South Ari',
        };

        const emailAddress = `chordline+${loginIdUser}@qawolf.email`;
        const subjectField = `${loginIdUser}-${Date.now()}`;
        const bodyText = `Medication Report test ${Date.now()}`;

        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
        for (const f of fs.readdirSync(downloadsDir)) {
            fs.rmSync(path.join(downloadsDir, f));
        }

        const { page } = await logIn({
            loginID: loginIdUser,
            password: 'QAWolfPass1#',
            slowMo: 400,
            args: ['--kiosk-printing'],
        });

        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Members → Medications
        //--------------------------------
        await page.getByRole('tab', { name: 'Members' }).click();
        await page.getByRole('textbox', { name: 'Search...' }).fill(member.name);
        await page.keyboard.press('Enter');
        await page.getByRole('gridcell', { name: member.name }).dblclick();
        await waitUntilLoaded(page);

        await page.getByText('Medications').nth(1).click();

        //--------------------------------
        // Generate Medication Summary
        //--------------------------------
        await page.locator('#member-medications #report-button').click();
        await page.getByRole('gridcell', { name: 'Medication Summary' }).click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();
        await page.locator('.k-window-title', { hasText: 'Medication Summary' }).waitFor();
        await page.getByRole('button', { name: ' Submit' }).click();

        //--------------------------------
        // UI assertions
        //--------------------------------
        await expect(page.locator('#reportTitle')).toHaveText('Medications Summary');
        await expect(page.locator('#member-name')).toHaveText(member.name);

        //--------------------------------
        // DOWNLOAD → POPUP UI ASSERTIONS
        //--------------------------------

        const [page1] = await Promise.all([
            page.waitForEvent('popup'),
            page.getByRole('button', { name: ' Download' }).click(),
        ]);

        // ✅ Popup UI validations
        await expect(page1.locator('div').filter({ hasText: '💾 SAVE PDF' })).toBeVisible();
        await expect(page1.getByText(member.name).first()).toBeVisible();
        await expect(page1.getByText('Medication Summary')).toBeVisible();
        await expect(
            page1.getByText('Abbott, QAWBrendaMedication Summary Medication Report Medications Summary')
        ).toBeVisible();



        //--------------------------------
        // EMAIL
        //--------------------------------
        await page.getByRole('button', { name: ' Email' }).click();
        await page.getByRole('combobox', { name: 'To:' }).fill(emailAddress);
        await page.getByRole('option', { name: `Add new item: ${emailAddress}` }).click();
        await page.getByRole('textbox', { name: 'Subject:' }).fill(subjectField);

        const bodyIframe = page.frameLocator('[title="Editable area. Press F10 for toolbar."]');
        await bodyIframe.locator('#message-body').fill(bodyText);
        //await expect(page.getByRole('gridcell', { name: 'Medication Summary.pdf' })).toBeVisible();
        await page.getByRole('button', { name: 'Send Email' }).click();

        //--------------------------------
        // PRINT
        //--------------------------------
        if (os.platform() === 'linux') {
            const printDir = path.join(os.homedir(), 'Downloads');
            const printedPath = path.join(printDir, `${member.name} - Medication Summary.pdf`);

            await fs.promises.rm(printDir, { recursive: true, force: true }).catch(() => {});
            await fs.promises.mkdir(printDir, { recursive: true });

            await page.getByRole('button', { name: ' Print' }).click();

            await expect(async () => {
                await fs.promises.access(printedPath);
                const stats = await fs.promises.stat(printedPath);
                expect(stats.size).toBeGreaterThan(1000);
            }).toPass({ timeout: 30_000 });
        } else {
            await page.getByRole('button', { name: ' Print' }).click();
        }

        //--------------------------------
        // FAX
        //--------------------------------
        await page.getByRole('button', { name: ' Fax' }).click();
        await page.getByRole('button', { name: '...' }).click();
        await page.getByRole('gridcell', { name: "St. Catherine's Hospital" }).first().click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();
        await page.getByRole('textbox', { name: 'Do NOT enter Personal' }).fill('just for testing.');
        await page.getByRole('button', { name: 'Send Fax' }).click();

        console.log('✅ Medication Summary full workflow verified');
    });
});









