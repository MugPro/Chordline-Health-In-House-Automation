

import { test, expect } from '@playwright/test';
import {
        logIn,
        waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

test(
    'Able to download Member Details and preview PDF content',
    async () => {
            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `DownloadMemberData`;
            const firstName = `QAWolf`;
            const lastName = `Carter`;
            const member = `${lastName}, ${firstName}`;

            const { page, context } = await logIn({ loginID });
            await waitUntilLoaded(page);

            //--------------------------------
            // Navigate → Members → Member Detail
            //--------------------------------
            await page
                .locator('#home-tabs-tab-4')
                .getByText('Members')
                .click();

            await page
                .getByRole('textbox', { name: 'Search...' })
                .fill(member);

            await page
                .locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button')
                .click();

            await page
                .getByRole('gridcell', { name: member })
                .dblclick();

            await waitUntilLoaded(page);

            //--------------------------------
            // Click Download → wait for PDF preview popup
            //--------------------------------
            const popupPromise = context.waitForEvent('page');

            await page
                .locator('#member-detail #pdf-detail-download-button')
                .click();

            const previewPage = await popupPromise;
            await previewPage.waitForLoadState();

            //--------------------------------
            // Assert PDF Preview Content (STRICT‑MODE SAFE)
            //--------------------------------

            // Assert SAVE PDF button exists (viewer opened)
            await expect(
                previewPage.locator('div').filter({ hasText: '💾 SAVE PDF' })
            ).toBeVisible();

            // Assert patient name (anchored, unique)
            await expect(
                previewPage.locator('div.patient-name')
            ).toHaveText(`${lastName}, ${firstName}`);

            // Assert "Member Detail" header appears
            await expect(
                previewPage.locator('text=/Member Detail/i').first()
            ).toBeVisible();


            //--------------------------------
            // Test ends here intentionally
            //--------------------------------
            // The PDF preview and SAVE dialog are browser‑controlled.
            // Content has been visually validated.
    },
);