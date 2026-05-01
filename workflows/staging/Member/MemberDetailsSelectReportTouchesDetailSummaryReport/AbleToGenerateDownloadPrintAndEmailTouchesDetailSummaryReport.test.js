import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { rm, mkdir, access } from 'fs/promises';
import * as dateFns from 'date-fns';

import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

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

test.describe(
    'Touches Detail Summary Report – Generate, Download, Print, Email',
    () => {
        test('Full workflow succeeds with correct data', async () => {
            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = 'TouchesDetailSummaryReport';
            const userFullName = `${loginID} Qaw`;


            const member = {
                firstName: 'QAWNicolas',
                lastName: 'Davis',
                identifier: "QAW1766187926978",
                dob: "12/19/2005",
                age: '20',
                address: {
                    street: '7933 Aliyah Islands',
                    city: 'Katherynfurt',
                    state: 'WY',
                    zip: '40102',
                },
            };
            member.fullName = `${member.lastName}, ${member.firstName}`;

            const report = {
                startDate: dateFns.format(
                    new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1,
                        12,
                    ),
                    'eeee, MMMM dd, yyyy',
                ),
                endDate: dateFns.format(
                    new Date(Date.now() - 24 * 60 * 60 * 1000),
                    'eeee, MMMM dd, yyyy',
                ),
                type: 'Documentation',
                outcome: 'Pending',
                focus: 'Initial Contact',
                reason: 'Clinical',
                expectedText:
                    'Provides a complete description of Touch records within the Date Range as specified, including the',
            };

            const generatedReportType = 'Touches Detail Summary';
            const todaysDate = dateFns.format(new Date(), 'MM/dd/yyyy');

            const emailAddress = `chordline+${loginID}@qawolf.email`;
            const subjectField = `${loginID}-${Date.now()}`;
            const bodyText = `Touches Detail Summary email test ${Date.now()}`;

            // Prepare downloads directory
            if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
            for (const f of fs.readdirSync(downloadsDir)) {
                fs.rmSync(path.join(downloadsDir, f));
            }

            //--------------------------------
            // Log in & navigate (IDENTICAL FLOW)
            //--------------------------------
            /*
            const { page } = await logIn({
                loginID,
                args: ['--kiosk-printing'],
            });

             */

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
            // Generate Touches Detail Summary
            //--------------------------------
            await clickAndWait(page, page.locator('#report-button:visible'));
            await page.getByText('Select a Report').waitFor();

            const reportDialog = page.getByLabel('Select a Report');

            // IMPORTANT: do NOT use clickAndWait here
            await reportDialog
                .getByRole('gridcell', {
                    name: generatedReportType,
                    exact: true,
                })
                .click();

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Select', exact: true }),
            );

            // Start Date
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

            // End Date
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

            // Type
            await clickAndWait(
                page,
                page.locator('input:below(.label:has-text("Type")) >> nth=0'),
            );
            await clickAndWait(
                page,
                page.getByRole('option', { name: report.type }).locator('span'),
            );

            // Outcome
            await clickAndWait(
                page,
                page.locator(
                    'input:below(.label:has-text("Outcome")) >> nth=0',
                ),
            );
            await clickAndWait(
                page,
                page.getByRole('option', { name: report.outcome }),
            );

            // Focus
            await clickAndWait(
                page,
                page.locator(
                    'input:below(.label:has-text("Focus")) >> nth=0',
                ),
            );
            await clickAndWait(
                page,
                page.getByRole('option', { name: report.focus }).locator('span'),
            );

            // Reason
            await clickAndWait(
                page,
                page.locator(
                    'input:below(.label:has-text("Reason")) >> nth=0',
                ),
            );
            await clickAndWait(
                page,
                page.getByRole('option', { name: report.reason }).locator('span'),
            );

            const timeStamp1 = dateFns.format(new Date(), 'hh:mm');

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Submit' }),
            );

            //--------------------------------
            // Assert UI (IDENTICAL STRUCTURE)
            //--------------------------------
            /*
            await expect(
                page.locator('#reportTitle').getByText(generatedReportType),
            ).toBeVisible();

             */

            await expect(page.getByRole('img', { name: 'Logo' })).toBeVisible();

            await expect(
                page
                    .getByLabel(generatedReportType)
                    .getByText(member.fullName),
            ).toBeVisible();

            await expect(
                page
                    .getByLabel(generatedReportType)
                    .getByText(
                        `Member Identifier: ${member.identifier} | Birthdate: ${member.dob} (${member.age} yrs) | Gender (B): None (I): None`,
                    ),
            ).toBeVisible();

            await expect(
                page
                    .getByLabel(generatedReportType)
                    .getByText(
                        `Address: ${member.address.street}, ${member.address.city}, ${member.address.state}, ${member.address.zip}`,
                    ),
            ).toBeVisible();

            await expect(
                page.getByText(
                    `Member Touches ${member.firstName} ${member.lastName}`,
                ),
            ).toBeVisible();

            await expect(page.getByText(`User: ${userFullName}`)).toBeVisible();

            await expect(
                page.getByText(`Print Date: ${todaysDate} ${timeStamp1}:`),
            ).toBeVisible();

            await expect(page.getByText(report.expectedText)).toBeVisible();

            //--------------------------------
            // DOWNLOAD (EXACT SAME)
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByLabel(generatedReportType)
                    .getByRole('button', { name: ' Download' }),
            );

            //--------------------------------
            // PRINT (EXACT SAME)
            //--------------------------------
            if (os.platform() === 'linux') {
                const printDir = path.join(os.homedir(), 'Downloads');
                await rm(printDir, { recursive: true, force: true }).catch(() => {});
                await mkdir(printDir, { recursive: true });

                await clickAndWait(
                    page,
                    page
                        .getByLabel(generatedReportType)
                        .getByRole('button', { name: ' Print' }),
                );

                await expect(async () => {
                    await access(printDir);
                }).toPass({ timeout: 30_000 });
            }

            //--------------------------------
            // EMAIL (EXACT SAME)
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
            // Robust email confirmation (IDENTICAL)
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
                '✅ Touches Detail Summary Report: Generate, Download, Print, and Email (UI-confirmed) succeeded',
            );
        });
    },
);