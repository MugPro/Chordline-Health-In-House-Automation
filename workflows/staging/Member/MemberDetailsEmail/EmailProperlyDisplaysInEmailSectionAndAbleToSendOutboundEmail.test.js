
/*
import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanUpEmailForMember,
    cleanUpEmailForMember2, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";



const pause = (page, ms = 1500) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = 1500) => {
    await locator.click();
    await pause(page, ms);
};

test(
    'Email properly displays in Email section and user is able to send outbound email',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        // Constants
        const loginID = `OutboundEmail`;
        const member = `Bradtke, QAWFlavio`;
        const emailAddress = `chordline+memberDetails@qawolf.com`;
        const subject = `QAW Subject`;
        const emailBody = `QAW message body text`;

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });




        await waitUntilLoaded(page);

        // Ensure clean state
        await cleanUpEmailForMember2(page, { member, emailAddress });

        //--------------------------------
        // Act: Navigate to Member
        //--------------------------------
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member);

        await page
            .locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button')
            .click();

        await page.getByRole('gridcell', { name: member }).dblclick();
        await waitUntilLoaded(page);

        //--------------------------------
        // Act: Send Outbound Email
        //--------------------------------
        await page.locator('#shortcuts').getByText('Emails').click();

        await page
            .getByRole('button', { name: ' Email' })
            .click();

        await waitUntilLoaded(page);

        // Fill "To" field
        await page
            .getByRole('combobox', { name: 'To:' })
            .fill(emailAddress);

        await page
            .locator('#recipients_listbox')
            .getByText('Add new item: chordline+memberDetails@')
            .click();

        // Subject
        await page
            .getByRole('textbox', { name: 'Subject:' })
            .fill(subject);

        // Email body (iframe)
        const iframe = page.frameLocator(
            'iframe[title="Editable area. Press F10 for toolbar."]',
        );

        await iframe
            .locator('[contenteditable="true"]')
            .fill(emailBody);

        // Send email
        await page
            .getByRole('button', { name: 'Send Email' })
            .click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Email appears in grid
        //--------------------------------
        await expect(
            page.getByRole('gridcell', { name: subject }),
        ).toBeVisible();

        await expect(
            page.getByRole('gridcell', { name: emailAddress }),
        ).toBeVisible();

        await expect(
            page.getByRole('gridcell', { name: 'Queued' }),
        ).toBeVisible();

        //--------------------------------
        // Act: Open sent email
        //--------------------------------
        await page
            .locator('#emails-anchor [placeholder="Search..."]')
            .fill(emailAddress);

        await page.locator('[data-grid-prefix="emails"]').click();

        await page
            .getByRole('gridcell', { name: emailAddress })
            .dblclick();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Email modal contents
        //--------------------------------
        await expect(page.locator('#crxc_type')).toHaveText('Outbound');
        await expect(page.locator('#crxc_status')).toHaveText('Success');
        await expect(page.locator('#html-body')).toHaveText(emailBody);


        try {
                await page
                    .getByLabel(`Email #`)
                    .getByText(`Close`, { exact: true })
                    .click();
        } catch {
                console.log("Click close button");
            }













            const emailCells = page.getByRole('gridcell', { name: emailAddress });

            let attempt = 0;

            while ((await emailCells.count()) > 0 && attempt < 5) {
                    attempt++;

                    try {
                            await emailCells.first().click();

                            await page.getByRole('button', { name: '' }).click();
                            await page.getByRole('button', { name: 'Yes' }).click();

                            // Optional: wait for grid refresh / deletion to complete
                            await page.waitForTimeout(500);
                    } catch (err) {
                            console.warn('Attempt to delete email failed:', err);
                            break;
                    }
            }

// ✅ ASSERTION (VERY IMPORTANT)
            await expect(emailCells).toHaveCount(0);









    },
);



 */
























import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanUpEmailForMember,
    cleanUpEmailForMember2, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";



const pause = (page, ms = 1500) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = 1500) => {
    await locator.click();
    await pause(page, ms);
};

test(
    'Email properly displays in Email section and user is able to send outbound email',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        // Constants
        const loginID = `OutboundEmail`;
        const member = `Bradtke, QAWFlavio`;
        const emailAddress = `chordline+memberDetails@qawolf.com`;
        const subject = `QAW Subject`;
        const emailBody = `QAW message body text`;

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });




        await waitUntilLoaded(page);

        // Ensure clean state
        await cleanUpEmailForMember2(page, { member, emailAddress });

        //--------------------------------
        // Act: Navigate to Member
        //--------------------------------
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member);

        await page
            .locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button')
            .click();

        await page.getByRole('gridcell', { name: member }).dblclick();
        await waitUntilLoaded(page);

        //--------------------------------
        // Act: Send Outbound Email
        //--------------------------------
        await page.locator('#shortcuts').getByText('Emails').click();

        await page
            .getByRole('button', { name: ' Email' })
            .click();

        await waitUntilLoaded(page);

        // Fill "To" field
        await page
            .getByRole('combobox', { name: 'To:' })
            .fill(emailAddress);

        await page
            .locator('#recipients_listbox')
            .getByText('Add new item: chordline+memberDetails@')
            .click();

        // Subject
        await page
            .getByRole('textbox', { name: 'Subject:' })
            .fill(subject);

        // Email body (iframe)
        const iframe = page.frameLocator(
            'iframe[title="Editable area. Press F10 for toolbar."]',
        );

        await iframe
            .locator('[contenteditable="true"]')
            .fill(emailBody);

        // Send email
        await page
            .getByRole('button', { name: 'Send Email' })
            .click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Email appears in grid
        //--------------------------------
        await expect(
            page.getByRole('gridcell', { name: subject }),
        ).toBeVisible();

        await expect(
            page.getByRole('gridcell', { name: emailAddress }),
        ).toBeVisible();

        await expect(
            page.getByRole('gridcell', { name: 'Queued' }),
        ).toBeVisible();

        //--------------------------------
        // Act: Open sent email
        //--------------------------------
        await page
            .locator('#emails-anchor [placeholder="Search..."]')
            .fill(emailAddress);

        await page.locator('[data-grid-prefix="emails"]').click();

        await page
            .getByRole('gridcell', { name: emailAddress })
            .dblclick();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Email modal contents
        //--------------------------------
        await expect(page.locator('#crxc_type')).toHaveText('Outbound');
        await expect(page.locator('#crxc_status')).toHaveText('Success');
        await expect(page.locator('#html-body')).toHaveText(emailBody);


        try {
            await page
                .getByLabel(`Email #`)
                .getByText(`Close`, { exact: true })
                .click();
        } catch {
            console.log("Click close button");
        }












        const emailCellSelector = `[role="gridcell"]:has-text("${emailAddress}")`;

        let attempt = 0;
        while (attempt < 5) {
            const cell = page.locator(emailCellSelector).first();

            if (!(await cell.isVisible())) {
                break; // nothing left to delete
            }

            await cell.click();
            await page.getByRole('button', { name: '' }).click();
            await page.getByRole('button', { name: 'Yes' }).click();

            // ✅ wait for the row to be removed from the DOM
            await page.waitForSelector(emailCellSelector, {
                state: 'detached',
                timeout: 15_000,
            });

            attempt++;
        }



        await page.waitForSelector(
            `[role="gridcell"]:has-text("${emailAddress}")`,
            { state: 'detached', timeout: 15_000 }
        );





    },
);





