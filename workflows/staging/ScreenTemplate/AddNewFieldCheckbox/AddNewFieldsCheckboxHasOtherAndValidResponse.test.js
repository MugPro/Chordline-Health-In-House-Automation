import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    copyDefaultScreenTemplate,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 0;

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
    'Add New Fields – Checkbox with Has Other and Valid Responses',
    () => {
        test('Checkbox field shows Has Other with valid response input in preview', async () => {
            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `ANFCheckBox`;
            const screenTemplateGroup = `Provider Group`;
            const defaultTemplate = `Provider Group - Default`;
            const copyTemplate = `Provider Group - Default - Copy`;
            const screenName = `ANFCheckboxTest`;
            const screenTemplateCopyName = `${screenName}${Date.now()}`;

            const fieldText = `Should be able to add valid responses`;
            const resp1 = `Valid response 1`;
            const resp2 = `Another response 2`;

            const { page } = await logIn({ loginID, slowMo: 400 });
            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre‑test)
            //--------------------------------
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName,
                    //dontClose: true,
                });

                //await waitUntilLoaded(page);

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

            //await waitUntilLoaded(page);



            // Navigate Tools > Screen Templates
            await page.getByText('Tools').hover();
            await page.getByText('Screen Templates').click();
            await waitUntilLoaded(page);

            // Expand group
            await page
                .getByRole('treeitem', { name: screenTemplateGroup, exact: true })
                .locator('span')
                .nth(1)
                .click();

            //await waitUntilLoaded(page);

            // Hover default template & click copy
            await page.getByRole('gridcell', { name: defaultTemplate, exact: true }).hover();
            await page.locator(`[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`).click({ timeout: 500 });
            //await waitUntilLoaded(page);
            await page.getByRole('button', { name: 'Yes' }).click();





            //await waitUntilLoaded(page);

            await fillAndWait(
                page,
                page.getByRole('textbox', { name: 'Screen Name:' }),
                screenTemplateCopyName,
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Save' }),
            );
            //await waitUntilLoaded(page);

            //--------------------------------
            // Act – Add Checkbox Field
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
                page.getByRole('option', { name: 'Checkbox' }),
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
            // Add Valid Responses
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Valid Response' }),
            );

            await fillAndWait(
                page,
                page
                    .getByRole('tabpanel', { name: 'Field Editor' })
                    .getByRole('textbox')
                    .nth(1),
                resp1,
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Valid Response' }),
            );

            await fillAndWait(
                page,
                    page
                    .getByRole('tabpanel', { name: 'Field Editor' })
                    .getByRole('textbox')
                    .nth(2),
                resp2,
            );
            await page
                .getByRole('tabpanel', { name: 'Field Editor' })
                .getByRole('textbox')
                .nth(2)
                .blur();

           // await waitUntilLoaded(page);


                await page.getByRole('checkbox', { name: 'Has Other' }).check();


            //--------------------------------
            // Preview & Save
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Preview' }),
            );

            //await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Yes' }),
            );

            //await waitUntilLoaded(page);

            //--------------------------------
            // Assert – Preview UI
            //--------------------------------
            const preview = page.getByLabel('New Screen - Internal (');

            await expect(preview.getByText(fieldText)).toBeVisible();
            await expect(preview.getByText(resp1)).toBeVisible();
            await expect(preview.getByText(resp2)).toBeVisible();

            await expect(
                preview.getByText('Other, please specify'),
            ).toBeVisible();

            await expect(
                page
                    .locator(
                        'label:has-text("Other, please specify") + span input[id*="prov_custom_field"]',
                    )
                    .first(),
            ).toBeVisible();

            //--------------------------------
            // Cleanup – Close Preview & Template
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Close' }),
            );

            //await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page
                    .getByLabel('New Screen - Internal')
                    .getByText('Close'),
            );

            /*
            await waitUntilLoaded(page);

            try {


                await page.getByText('Close', { exact: true }).click();


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

            //await page.close();

             */

            console.log(
                '✅ Checkbox field supports Valid Responses and Has Other option correctly',
            );
        });
    },
);