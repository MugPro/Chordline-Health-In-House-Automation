import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 20;

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

test.describe(
    'Add New Field – Lookup Activity Type',
    () => {
        test('Lookup field loads Activity Type options in preview', async () => {
            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `LookUpActivityType`;
            const screenTemplateGroup = `Provider Individual`;
            const defaultTemplate = `Provider Individual - Default`;
            const copyTemplate = `Provider Individual - Default - Copy`;
            const screenName = `LUActivityType`;
            const screenTemplateCopyName = `${screenName}${Date.now()}`;

            const fieldText =
                `Should load up the specific look up table in preview`;

            const activityTypes = [
                'Behavioral Health Activity',
                'Case Management Activity',
                'Medical Director Activity',
                'Utilization Management Activity',
            ];

            const { page } = await logIn({ loginID });
            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre‑test)
            //--------------------------------
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName: copyTemplate,
                    onScreen: true,
                    dontClose: true,
                });
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupScreenTemplateCopy',
                    errorMsg: e.message,
                });
            }

            //--------------------------------
            // Navigate to Screen Templates
            //--------------------------------
            await page.getByText('Tools').hover();
            await page.getByText('Screen Templates').click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Expand group & copy default template
            //--------------------------------
            await page
                .getByRole('treeitem', {
                    name: screenTemplateGroup,
                    exact: true,
                })
                .locator('span')
                .nth(1)
                .click();

            await waitUntilLoaded(page);

            await page
                .getByRole('gridcell', {
                    name: defaultTemplate,
                    exact: true,
                })
                .hover();

            await page
                .locator(
                    `[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`,
                )
                .click({ timeout: 500 });

            await page.getByRole('button', { name: 'Yes' }).click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Rename copied screen
            //--------------------------------
            await fillAndWait(
                page,
                page.getByRole('textbox', { name: 'Screen Name:' }),
                screenTemplateCopyName,
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Save' }),
            );

            await waitUntilLoaded(page);

            //--------------------------------
            // Act – Add Lookup Field
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .locator('#record-div div')
                    .filter({ hasText: 'Provider Field * Provider ID' })
                    .getByRole('button'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({ hasText: 'Radio ButtonRadio ButtonDrop' })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: ' Lookup' }),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Add', exact: true }),
            );

            await fillAndWait(
                page,
                page.locator('#question-text'),
                fieldText,
            );
            await page.locator('#question-text').blur();

            //--------------------------------
            // Select Lookup Table = Activity Type
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByRole('tabpanel', { name: 'Field Editor' })
                    .getByLabel('expand combobox'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: 'Activity Type' }),
            );

            //--------------------------------
            // Preview & Save
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Preview' }),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Yes' }),
            );

            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – Preview
            //--------------------------------
            await expect(
                page.getByText('New Screen - Internal ('),
            ).toBeVisible();

            await clickAndWait(
                page,
                page
                    .getByLabel('New Screen - Internal (')
                    .locator('#record-div div')
                    .filter({ hasText: 'Provider * Provider ID:' })
                    .getByLabel('expand combobox'),
            );

            for (const activity of activityTypes) {
                await expect(
                    page.locator(`li:has-text("${activity}")`),
                ).toBeVisible();
            }

            //--------------------------------
            // Cleanup – Close Preview & Template
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Close' }),
            );

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page
                    .getByLabel('New Screen - Internal')
                    .getByText('Close'),
            );

            /*
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName: screenTemplateCopyName,
                    onScreen: true,
                    dontClose: true,
                });
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupScreenTemplateCopy',
                    errorMsg: e.message,
                });
            }

            await page.close();

             */

            console.log(
                '✅ Lookup Activity Type field loads correct values in preview',
            );
        });
    },
);