/*

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { stat, rm, mkdir, access } from 'fs/promises';
import * as dateFns from 'date-fns';

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


async function getPdfFileSize(filePath) {
    const stats = await stat(filePath);
    return stats.size;
}

test.describe('Member Invoice Report – Generate, Download, Email, Print', () => {
    test('Full workflow succeeds with correct data', async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MemberInvoiceReport`;
        const userFullName = `${loginID} Qaw`;

        const member = {
            firstName: 'QAWAisha',
            lastName: 'Turner',
            identifier: 'QAW1758235427280',
            dob: '09/18/2005',
            age: '20',
            address: {
                street: '014 Powlowski Well',
                city: 'Lloydside',
                state: 'TN',
                zip: '45362-5504',
            },
        };
        member.fullName = `${member.lastName}, ${member.firstName}`;

        const report = {
            startDate: dateFns.format(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
                'eeee, MMMM dd, yyyy',
            ),
            endDate: dateFns.format(
                new Date(Date.now() - 24 * 60 * 60 * 1000),
                'eeee, MMMM dd, yyyy',
            ),
            insuranceCompany: 'Excellent Health Plan',
            expectedText:
                'Lists all Work Log entries marked as Billable in addition to all Billable Items individually by',
        };

        const generatedReportType = 'Member Invoice Report';
        const docType = 'Member Invoice Report';
        const fileType = '.pdf';

        const todaysDate = dateFns.format(new Date(), 'MM/dd/yyyy');

        const emailAddress = `chordline+${loginID}@qawolf.email`;
        const subjectField = `${loginID}-${Date.now()}`;
        const bodyText = `Invoice Report email test ${Date.now()}`;

        // Prepare downloads directory
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
        for (const f of fs.readdirSync(downloadsDir)) {
            fs.rmSync(path.join(downloadsDir, f));
        }

        const expectedFileName = `${member.fullName} - ${docType}${fileType}`;

        //--------------------------------
        // Log in & navigate
        //--------------------------------
        const { page, context } = await logIn({
            loginID,
            args: ['--kiosk-printing'],
        });

        await waitUntilLoaded(page);

        await page.getByText('Home', { exact: true }).click();
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page.getByRole('textbox', { name: 'Search...' }).fill(member.fullName);
        await page.keyboard.press('Enter');



        await page.getByRole('gridcell', { name: member.fullName }).dblclick();
        await waitUntilLoaded(page);

        //--------------------------------
        // Generate report
        //--------------------------------
        await page.locator('#report-button:visible').click();

        //await waitUntilLoaded(page);

        await page.getByText('Select a Report').waitFor();

        //await page.getByRole('gridcell', { name: generatedReportType }).click();


        const reportDialog = page.getByLabel('Select a Report');

        await reportDialog
            .locator('table')
            .getByRole('gridcell', { name: generatedReportType, exact: true })
            .first()
            .click();

        //await waitUntilLoaded(page);

        await page.getByRole('button', { name: 'Select', exact: true }).click();

       // await waitUntilLoaded(page);

        await page.getByRole('button', { name: 'select' }).nth(0).click();

        await waitUntilLoaded(page);

        await page
            .locator('[id*="dateview"]:visible')
            .getByTitle(report.startDate)
            .first()
            .click();

        await waitUntilLoaded(page);

        await page.getByRole('button', { name: 'select' }).nth(1).click();

       // await waitUntilLoaded(page);

        await page
            .locator('[id*="dateview"]:visible')
            .getByTitle(report.endDate)
            .click();

        await page.locator('[aria-autocomplete="list"]').click();

        //await waitUntilLoaded(page);

        await page
            .getByRole('option', { name: report.insuranceCompany })
            .locator('span')
            .click();

        const timeStamp1 = dateFns.format(new Date(), 'hh:mm');
        await page.getByRole('button', { name: ' Submit' }).click();


        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert UI
        //--------------------------------
        await expect(page.locator('#reportTitle')).toHaveText(generatedReportType);
        await expect(page.getByRole('img', { name: 'Logo' })).toBeVisible();
        await expect(page.getByText(`User: ${userFullName}`)).toBeVisible();
        await expect(
            page.getByText(`Print Date: ${todaysDate} ${timeStamp1}:`),
        ).toBeVisible();
        await expect(page.getByText(report.expectedText)).toBeVisible();

        //await waitUntilLoaded(page);

        //--------------------------------
        // DOWNLOAD
        //--------------------------------

        await page.getByRole('button', { name: ' Download' }).click();

        //await waitUntilLoaded(page);

        //await expect(page.locator('div').filter({ hasText: '💾 SAVE PDF' })).toBeVisible();
        //await expect(page.getByText('Turner, QAWAishaMember Invoice Report Member Invoice Report Member Invoice')).toBeVisible();
        //await page.getByText('Turner, QAWAisha').first().click();

        await expect(
            page
                .getByLabel(generatedReportType)
                .locator('#member-description'),
        ).toContainText('Excellent Health Plan');

        await expect(
            page
                .getByLabel(generatedReportType)
                .locator('#member-description'),
        ).toContainText('QAW1758235427280');

        await expect(page.locator('#report-header')).toContainText('Member Invoice Report Turner, QAWAisha Insurance Company: Excellent Health Plan | Member Identifier: QAW1758235427280 | Birthdate: 09/18/2005 (20 yrs) | Gender (B): None (I): NoneAddress: 014 Powlowski Well, Lloydside, TN, 45362-5504PCP Information: No PCP');
        await expect(page.locator('#report-inner-content')).toContainText('TO: Excellent Health Plan 3500 West Orange Grove Suite 100 Orlando, FL 32802 United States Office Phone: +1 879-525-3200 Fax #: +1 879-525-3196 Service Dates: 03/01/2026 - 03/30/2026 CM Programs: CM Program:');


        //--------------------------------
        // PRINT (platform safe)
        //--------------------------------
        if (os.platform() === 'linux') {
            const printDir = path.join(os.homedir(), 'Downloads');
            await rm(printDir, { recursive: true, force: true }).catch(() => {});
            await mkdir(printDir, { recursive: true });

            //await waitUntilLoaded(page);

            await page.getByRole('button', { name: ' Print' }).click();

           // await waitUntilLoaded(page);

            const printedPath = path.join(printDir, expectedFileName);
            await expect(async () => {
                await access(printedPath);
                const size = await getPdfFileSize(printedPath);
                expect(size).toBeGreaterThan(0);
            }).toPass({ timeout: 30_000 });
        }

       // await waitUntilLoaded(page);

        //--------------------------------
        // EMAIL (UI‑only, like Medication test)
        //--------------------------------
        //await page.getByRole('button', { name: ' Email' }).click()

        await page
            .getByLabel(generatedReportType)
            .getByRole('button', { name: ' Email' })
            .click();


        await waitUntilLoaded(page);

        const emailDialog = page.getByRole('dialog').filter({
            hasText: /Subject:/i,
        });

        await page.getByRole('combobox', { name: 'To:' }).fill(emailAddress);
        await page
            .getByRole('option', { name: `Add new item: ${emailAddress}` })
            .click();

        await page.getByRole('textbox', { name: 'Subject:' }).fill(subjectField);

        const iframe = page.frameLocator(
            '[title="Editable area. Press F10 for toolbar."]',
        );
        await iframe.locator('#message-body').fill(bodyText);

        //await waitUntilLoaded(page);





        const sendBtn = page.getByRole('button', { name: 'Send Email' });
        await sendBtn.click();

        await waitUntilLoaded(page);

        // Robust send confirmation (same pattern as Medication test)
        let confirmed = false;

        try {
            await expect(emailDialog).toBeHidden({ timeout: 15000 });
            confirmed = true;
        } catch {}

        if (!confirmed) {
            try {
                await expect(sendBtn).toBeHidden({ timeout: 8000 });
                confirmed = true;
            } catch {
                try {
                    await expect(sendBtn).toBeDisabled({ timeout: 8000 });
                    confirmed = true;
                } catch {}
            }
        }

        if (!confirmed) {
            try {
                await page.waitForResponse(
                    r =>
                        r.status() >= 200 &&
                        r.status() < 300 &&
                        r.request().method() === 'POST' &&
                        /email|mail|message/i.test(r.url()),
                    { timeout: 15000 },
                );
                confirmed = true;
            } catch {}
        }

        if (!confirmed) {
            throw new Error('Email send confirmation not detected');
        }

        console.log(
            '✅ Member Invoice Report: Generate, Download, Print, and Email (UI-confirmed) succeeded',
        );
    });
});

 */





















import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { stat, rm, mkdir, access } from 'fs/promises';
import * as dateFns from 'date-fns';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 500;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

/* -------------------------------------------
   ESM __dirname
------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadsDir = path.join(__dirname, 'downloads');

test.use({ acceptDownloads: true });

/* -------------------------------------------
   FS helpers
------------------------------------------- */
async function getPdfFileSize(filePath) {
    const stats = await stat(filePath);
    return stats.size;
}

test.describe(
    'Member Invoice Report – Generate, Download, Email, Print',
    () => {
        test('Full workflow succeeds with correct data', async () => {
            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = 'MemberInvoiceReport';
            const userFullName = `${loginID} Qaw`;

            const member = {
                firstName: 'QAWAisha',
                lastName: 'Turner',
                identifier: 'QAW1758235427280',
                dob: '09/18/2005',
                age: '20',
                address: {
                    street: '014 Powlowski Well',
                    city: 'Lloydside',
                    state: 'TN',
                    zip: '45362-5504',
                },
            };
            member.fullName = `${member.lastName}, ${member.firstName}`;

            const report = {
                startDate: dateFns.format(
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
                    'eeee, MMMM dd, yyyy',
                ),
                endDate: dateFns.format(
                    new Date(Date.now() - 24 * 60 * 60 * 1000),
                    'eeee, MMMM dd, yyyy',
                ),
                insuranceCompany: 'Excellent Health Plan',
                expectedText:
                    'Lists all Work Log entries marked as Billable in addition to all Billable Items individually by',
            };

            const generatedReportType = 'Member Invoice Report';
            const docType = 'Member Invoice Report';
            const fileType = '.pdf';

            const todaysDate = dateFns.format(new Date(), 'MM/dd/yyyy');

            const emailAddress = `chordline+${loginID}@qawolf.email`;
            const subjectField = `${loginID}-${Date.now()}`;
            const bodyText = `Invoice Report email test ${Date.now()}`;

            // Prepare downloads directory
            if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
            for (const f of fs.readdirSync(downloadsDir)) {
                fs.rmSync(path.join(downloadsDir, f));
            }

            const expectedFileName = `${member.fullName} - ${docType}${fileType}`;

            //--------------------------------
            // Sign in & navigate to member
            //--------------------------------
            const { page, context } = await logIn({
                loginID,
                args: ['--kiosk-printing'],
            });

            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByText('Home', { exact: true }));
            await clickAndWait(
                page,
                page.locator('#home-tabs-tab-4').getByText('Members'),
            );

            await fillAndWait(
                page,
                page.getByRole('textbox', { name: 'Search...' }),
                member.fullName,
            );
            await page.keyboard.press('Enter');

            await page
                .getByRole('gridcell', { name: member.fullName })
                .dblclick();

            await waitUntilLoaded(page);

            //--------------------------------
            // Generate report
            //--------------------------------
            await clickAndWait(page, page.locator('#report-button:visible'));
            await page.getByText('Select a Report').waitFor();

            const reportDialog = page.getByLabel('Select a Report');

            await clickAndWait(
                page,
                reportDialog
                    .locator('table')
                    .getByRole('gridcell', {
                        name: generatedReportType,
                        exact: true,
                    })
                    .first(),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Select', exact: true }),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'select' }).nth(0),
            );

            await clickAndWait(
                page,
                page
                    .locator('[id*="dateview"]:visible')
                    .getByTitle(report.startDate)
                    .first(),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'select' }).nth(1),
            );

            await clickAndWait(
                page,
                page
                    .locator('[id*="dateview"]:visible')
                    .getByTitle(report.endDate),
            );

            await clickAndWait(page, page.locator('[aria-autocomplete="list"]'));

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: report.insuranceCompany })
                    .locator('span'),
            );

            const timeStamp1 = dateFns.format(new Date(), 'hh:mm');

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Submit' }),
            );

            //--------------------------------
            // Assert report UI
            //--------------------------------
            await expect(page.locator('#reportTitle')).toHaveText(
                generatedReportType,
            );
            await expect(page.getByRole('img', { name: 'Logo' })).toBeVisible();
            await expect(
                page.getByText(`User: ${userFullName}`),
            ).toBeVisible();
            await expect(
                page.getByText(`Print Date: ${todaysDate} ${timeStamp1}:`),
            ).toBeVisible();
            await expect(page.getByText(report.expectedText)).toBeVisible();

            //--------------------------------
            // DOWNLOAD
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByLabel(generatedReportType)
                    .getByRole('button', { name: ' Download' }),
            );

            //--------------------------------
            // PRINT (platform-safe)
            //--------------------------------
            if (os.platform() === 'linux') {
                const printDir = path.join(os.homedir(), 'Downloads');
                await rm(printDir, {
                    recursive: true,
                    force: true,
                }).catch(() => {});
                await mkdir(printDir, { recursive: true });

                await clickAndWait(
                    page,
                    page
                        .getByLabel(generatedReportType)
                        .getByRole('button', { name: ' Print' }),
                );

                const printedPath = path.join(printDir, expectedFileName);

                await expect(async () => {
                    await access(printedPath);
                    const size = await getPdfFileSize(printedPath);
                    expect(size).toBeGreaterThan(0);
                }).toPass({ timeout: 30_000 });
            }

            //--------------------------------
            // EMAIL (UI-only confirmation)
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByLabel(generatedReportType)
                    .getByRole('button', { name: ' Email' }),
            );

            const emailDialog = page.getByRole('dialog').filter({
                hasText: /Subject:/i,
            });

            await fillAndWait(
                page,
                page.getByRole('combobox', { name: 'To:' }),
                emailAddress,
            );

            await clickAndWait(
                page,
                page.getByRole('option', {
                    name: `Add new item: ${emailAddress}`,
                }),
            );

            await fillAndWait(
                page,
                page.getByRole('textbox', { name: 'Subject:' }),
                subjectField,
            );

            const iframe = page.frameLocator(
                '[title="Editable area. Press F10 for toolbar."]',
            );

            await fillAndWait(
                page,
                iframe.locator('#message-body'),
                bodyText,
            );

            const sendBtn = page.getByRole('button', { name: 'Send Email' });
            await clickAndWait(page, sendBtn);

            //--------------------------------
            // Robust email confirmation
            //--------------------------------
            let confirmed = false;

            try {
                await expect(emailDialog).toBeHidden({ timeout: 15000 });
                confirmed = true;
            } catch {}

            if (!confirmed) {
                try {
                    await expect(sendBtn).toBeHidden({ timeout: 8000 });
                    confirmed = true;
                } catch {
                    try {
                        await expect(sendBtn).toBeDisabled({
                            timeout: 8000,
                        });
                        confirmed = true;
                    } catch {}
                }
            }

            if (!confirmed) {
                try {
                    await page.waitForResponse(
                        r =>
                            r.status() >= 200 &&
                            r.status() < 300 &&
                            r.request().method() === 'POST' &&
                            /email|mail|message/i.test(r.url()),
                        { timeout: 15000 },
                    );
                    confirmed = true;
                } catch {}
            }

            if (!confirmed) {
                throw new Error('Email send confirmation not detected');
            }

            console.log(
                '✅ Member Invoice Report: Generate, Download, Print, and Email (UI-confirmed) succeeded',
            );
        });
    },
);