import { test, expect } from '@playwright/test';
import { readFile, mkdir, rm } from 'fs/promises';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

import path from 'path';
import fs from 'fs';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers
------------------------------------------- */
const pause = (page, ms = 500) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = 500) => {
    await locator.click();
    await pause(page, ms);
};

test(
    'Able to create, upload, download, update, and delete an attachment',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        // ✅ Corrected constants
        const loginID = `MemDetsAttachment`;
        const member = { firstName: `QAWScottie`, lastName: `Brekke` };

        const fileName = `Johnson, John_H&P.pdf`;
        //const myFilePath = `${process.env.HOME}/files/${fileName}`;



        const myFilePath = path.resolve(
            process.cwd(),
            'test-assets',
            fileName,
        );


        if (!fs.existsSync(myFilePath)) {
            throw new Error(`Attachment file not found: ${myFilePath}`);
        }


        const reason = [
            "Appeal",
            "Clinical",
            "Consent Form",
            "Grievance",
            "History and Physical",
            "Letter",
            "Medication Management",
        ][Math.floor(Math.random() * 7)];

        const type = [
            "Case Management",
            "Compliance",
            "Medication Information",
            "Member Detail",
            "Utilization Management",
        ][Math.floor(Math.random() * 5)];

        const description = faker.lorem.sentence();

        const today = Date.now();
        const printDate = dateFns.format(today, "MM dd yyyy hh mm ss aa");
        const printDateFormat = dateFns.format(today, "MM/dd/yyyy hh:mm:ss aa");

        const hourLater = dateFns.addHours(today, 1);
        const dateSent = dateFns.format(hourLater, "MM dd yyyy hh mm ss aa");
        const dateSentFormat = dateFns.format(
            hourLater,
            "MM/dd/yyyy hh:mm:ss aa",
        );

        const entryBy = `${loginID} Qaw`;
        const module1 = `Member Detail`;

        const { page } = await logIn({ loginID });
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate to Member → Attachments
        //--------------------------------
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(`${member.lastName}, ${member.firstName}`);

        await page.locator('#lookup-search-button:visible').click();

        await page
            .getByRole('gridcell', {
                name: `${member.lastName}, ${member.firstName}`,
            })
            .dblclick();

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page
                .getByRole('menuitem', { name: 'Member Detail' })
                .locator('span')
                .nth(1),
        );

        await page.locator('#shortcuts').getByText('Attachments').click();

        //--------------------------------
        // Act: Create Attachment
        //--------------------------------
        await page.getByRole('button', { name: ' Attachment' }).click();
        await expect(page.getByText('Attachment:')).toBeVisible();

        page.once('filechooser', async (chooser) => {
            await chooser.setFiles(myFilePath);
        });

        await page.getByRole('button', { name: 'Select files...' }).click();
        await expect(page.locator('#atch_filename__1')).toContainText(fileName);

        await page
            .locator('input[name="atch_reason_id__1_input"]')
            .fill(reason);
        await page.getByRole('option', { name: reason }).click();

        await page
            .locator('input[name="atch_type_id__1_input"]')
            .fill(type);
        await page.getByRole('option', { name: type }).click();

        await page.locator('#atch_description__1').fill(description);

        await page.locator('#atch_print_date__1').clear();
        await page.locator('#atch_print_date__1').pressSequentially(printDate);

        await page.locator('#atch_sent_date__1').clear();
        await page.locator('#atch_sent_date__1').pressSequentially(dateSent);

        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Attachment row created
        //--------------------------------
        await page
            .locator('#attachments-anchor')
            .getByRole('textbox', { name: 'Search...' })
            .fill(fileName);
        await page.locator('#attachments-anchor a').click();

        const attachmentRow = page.locator(
            `#attachments-child-grid table tbody tr:has-text("${loginID}"):has-text("${printDateFormat}")`,
        );

        await expect(attachmentRow).toBeVisible();
        await expect(attachmentRow.locator('td').nth(2)).toContainText(module1);
        await expect(attachmentRow.locator('td').nth(3)).toContainText(type);
        await expect(attachmentRow.locator('td').nth(4)).toContainText(reason);
        await expect(attachmentRow.locator('td').nth(5)).toContainText(description);
        await expect(attachmentRow.locator('td').nth(7)).toContainText(fileName);
        await expect(attachmentRow.locator('td').nth(8)).toContainText(entryBy);
        await expect(attachmentRow.locator('td').nth(10)).toContainText(printDateFormat);
        await expect(attachmentRow.locator('td').nth(11)).toContainText(dateSentFormat);

        //--------------------------------
        // Act & Assert: Open → Download
        //--------------------------------
        await attachmentRow.dblclick();
        await expect(page.getByText(`Attachment: ${fileName}`)).toBeVisible();

        const tmpDir = `${process.env.HOME}/tmp`;
        await rm(tmpDir, { recursive: true, force: true });
        await mkdir(tmpDir);

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: ' Download' }).click(),
        ]);

        const downloadPath = `${tmpDir}/Qawolf_download.pdf`;
        await download.saveAs(downloadPath);

        const [buf1, buf2] = await Promise.all([
            readFile(myFilePath),
            readFile(downloadPath),
        ]);

        expect(buf1).toStrictEqual(buf2);

        //--------------------------------
        // Act: Delete attachment
        //--------------------------------
        await page.getByRole('button', { name: ' Close' }).click();
        await attachmentRow.hover();
        await attachmentRow.locator('[title="Delete"]').click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Attachment removed
        //--------------------------------
        await expect(attachmentRow).not.toBeVisible();
    },
);