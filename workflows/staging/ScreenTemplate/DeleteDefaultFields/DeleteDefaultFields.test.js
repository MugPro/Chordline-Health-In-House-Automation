import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
    copyDefaultScreenTemplate,
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

test.describe(
    'Delete Default Fields',
    () => {
        test('User can delete a default field and it is removed from Preview', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const screenTemplateGroup = `Compliance - Grievance`;
            const defaultTemplate = `${screenTemplateGroup} - Default`;
            const screenName = `${defaultTemplate} - Copy`;
            const loginID = `DeleteDefault`;

            const { page } = await logIn({ loginID });
            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre-test)
            //--------------------------------
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                });
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupScreenTemplateCopy',
                    errorMsg: e.message,
                });
            }

            //--------------------------------
            // Create a copy of the default template
            //--------------------------------
            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                screenName,
            });

            //--------------------------------
            // Navigate to Screen Templates
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('span').filter({ hasText: 'Tools' }).first(),
            );

            await clickAndWait(
                page,
                page.getByText('Screen Templates').first(),
            );

            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByText(screenTemplateGroup));

            await clickAndWait(
                page,
                page.getByRole('gridcell', { name: screenName }),
            );

            await waitUntilLoaded(page);

            //--------------------------------
            // Open field editor sidebar
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: '' }),
            );

            //--------------------------------
            // Act – Delete default "Closed Date" field
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('#cpch_closed_date_overlay'),
            );

            await clickAndWait(
                page,
                page.locator('.k-state-hover [title="Remove"]'),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Save' }),
            );

            //--------------------------------
            // Preview
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Preview' }),
            );




            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the page has text "Edit Screen - Internal ("
            await expect(
                page.getByLabel(`Edit Screen - Internal (`).getByText(`Closed Date:`),
            ).not.toBeVisible();

            // Assert the "Edit Screen - Internal (" dialog is visible
            await expect(
                page
                    .getByRole(`dialog`, { name: `Edit Screen - Internal (` })
                    .locator(`#cpch_closed_date`),
            ).not.toBeVisible();

            //--------------------------------
            // Cleanup
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Close' }),
            );

            await clickAndWait(
                page,
                page
                    .getByLabel('Edit Screen - Internal')
                    .getByText('Close', { exact: true }),
            );

            await clickAndWait(
                page,
                page.getByText('Close', { exact: true }),
            );

            await cleanupScreenTemplateCopy(page, {
                screenName,
                screenTemplateGroup,
                defaultTemplate,
            });

            // await page.close();

            console.log(
                '✅ Default field "Closed Date" successfully deleted and removed from Preview',
            );
        });
    },
);
