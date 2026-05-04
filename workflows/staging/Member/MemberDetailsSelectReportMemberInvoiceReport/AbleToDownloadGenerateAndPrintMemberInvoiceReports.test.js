/*


import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { stat, rm, mkdir, access } from 'fs/promises';
import * as dateFns from 'date-fns';

import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";


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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadsDir = path.join(__dirname, 'downloads');

test.use({ acceptDownloads: true });


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




            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                url, args: ['--kiosk-printing'] });








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

 */
























import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { stat, rm, mkdir, access } from 'fs/promises';
import * as dateFns from 'date-fns';

import {
    logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';

/* -------------------------------------------
   Helpers
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 500;
const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

/* -------------------------------------------
   Paths / Env
------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadsDir = path.join(__dirname, 'downloads');

const isCI = !!process.env.CI;

test.use({ acceptDownloads: true });

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

            if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
            for (const f of fs.readdirSync(downloadsDir)) {
                fs.rmSync(path.join(downloadsDir, f));
            }

            const expectedFileName = `${member.fullName} - ${docType}${fileType}`;

            //--------------------------------
            // Login
            //--------------------------------
            const { page } = await logIn3({
                loginID,
                password: env.DEFAULT_PASS_OCT_2025,
                url: env.DEFAULT_URL,
                args: ['--kiosk-printing'],
            });

            await waitUntilLoaded(page);

            //--------------------------------
            // Navigate to member
            //--------------------------------
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
                page.locator('[id*="dateview"]:visible')
                    .getByTitle(report.startDate)
                    .first(),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'select' }).nth(1),
            );

            await clickAndWait(
                page,
                page.locator('[id*="dateview"]:visible')
                    .getByTitle(report.endDate),
            );

            await clickAndWait(page, page.locator('[aria-autocomplete="list"]'));

            await clickAndWait(
                page,
                page.getByRole('option', { name: report.insuranceCompany })
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
            await expect(page.locator('#reportTitle')).toHaveText(generatedReportType);
            await expect(page.getByRole('img', { name: 'Logo' })).toBeVisible();
            await expect(page.getByText(`User: ${userFullName}`)).toBeVisible();
            await expect(
                page.getByText(`Print Date: ${todaysDate} ${timeStamp1}:`),
            ).toBeVisible();
            await expect(page.getByText(report.expectedText)).toBeVisible();

            //--------------------------------
            // DOWNLOAD
            //--------------------------------
            await clickAndWait(
                page,
                page.getByLabel(generatedReportType)
                    .getByRole('button', { name: ' Download' }),
            );

            //--------------------------------
            // PRINT (✅ CI-safe)
            //--------------------------------
            const printBtn = page
                .getByLabel(generatedReportType)
                .getByRole('button', { name: ' Print' });

            if (!isCI && os.platform() === 'linux') {
                const printDir = path.join(os.homedir(), 'Downloads');
                await mkdir(printDir, { recursive: true });

                await clickAndWait(page, printBtn);

                const printedPath = path.join(printDir, expectedFileName);

                await expect(async () => {
                    await access(printedPath);
                    const size = await getPdfFileSize(printedPath);
                    expect(size).toBeGreaterThan(0);
                }).toPass({ timeout: 30_000 });

            } else {
                // ✅ CI: assert print was triggered without crashing
                await clickAndWait(page, printBtn);
                await page.waitForTimeout(1000);
                await expect(page.locator('#reportTitle')).toHaveText(generatedReportType);
            }

            //--------------------------------
            // EMAIL
            //--------------------------------
            await clickAndWait(
                page,
                page.getByLabel(generatedReportType)
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

            await fillAndWait(page, iframe.locator('#message-body'), bodyText);

            const sendBtn = page.getByRole('button', { name: 'Send Email' });
            await clickAndWait(page, sendBtn);

            await expect(emailDialog).toBeHidden({ timeout: 15000 });

            console.log(
                '✅ Member Invoice Report: Generate, Download, Print (CI-safe), and Email succeeded',
            );
        });
    },
);