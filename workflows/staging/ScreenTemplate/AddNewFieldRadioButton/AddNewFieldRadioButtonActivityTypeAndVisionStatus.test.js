import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

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
    'Add New Field – Radio Button with Visibility Rule',
    () => {
        test('Radio Button field supports responses and visibility rule indicator', async () => {
            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `ANFRadioB`;
            const screenTemplateGroup = `Provider Facility`;
            const defaultTemplate = `Provider Facility - Default`;
            const copyTemplate = `Provider Facility - Default - Copy`;
            const screenName = `ANFRadioBTest`;
            const screenTemplateCopyName = `${screenName}${Date.now()}`;

            const fieldText =
                `Should be able to add activity type and have a visibility rule indicator`;
            const resp1 = `Response 1`;
            const resp2 = `Response 2`;

            //const { page } = await logIn({ loginID });

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                url });


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
            await clickAndWait(
                page,
                page
                .getByRole('treeitem', { name: screenTemplateGroup, exact: true })
                .locator('span')
                .nth(1),
            );

            //await waitUntilLoaded(page);

            await page
                .getByRole('gridcell', { name: defaultTemplate, exact: true })
                .hover();

            await clickAndWait(
                page,
                page
                .locator(
                    `[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`,
                ),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Yes' }),
            );

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
            // Act – Add Radio Button Field
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
                page.getByRole('option', { name: 'Radio Button' }),
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




//--------------------------------
            // Assert – No visibility rule yet
            //--------------------------------
            const radioField = page
                .locator(
                    `[data-type="Radio Button"]:has(.flex-item:has-text("${fieldText}"))`,
                )
                .first();

            await expect(radioField).toBeVisible();
            await expect(radioField).toContainText(resp1);
            await expect(radioField).toContainText(resp2);

            // No visibility rule indicator yet
            await expect(radioField).not.toHaveClass(/has-visibility-rule/);





            /*
            //--------------------------------
            // Assert – No Visibility Rule
            //--------------------------------
            const radioField = page
                .locator(
                    `[data-type="Radio Button"]:has(.flex-item:has-text("${fieldText}"))`,
                )
                .first();

            const radioContent = radioField.locator('.flex-item').first();

            await expect(radioContent).toHaveScreenshot(
                'addedRadio_no_vis_rule.png',
                {
                    maxDiffPixelRatio: 0.06,
                },
            );

             */




            //--------------------------------
            // Act – Add Visibility Rule
            //--------------------------------
            await clickAndWait(
                page,
                page.getByText('Rules'),
            );

            await clickAndWait(
                page,
                page
                .locator('span')
                .filter({ hasText: 'Always show this field' })
                .nth(1),
            );

            await clickAndWait(
                page,
                page
                .getByRole('option', { name: 'Hide this field when...' })
                .locator('span'),
            );

            await clickAndWait(
                page,
                page.getByLabel('Rules').getByText('Select...'),
            );


            await clickAndWait(
                page,
                page
                .getByRole('option', { name: resp1 })
                .locator('span'),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Save' }),
            );
            await waitUntilLoaded(page);




            //--------------------------------
            // Assert – Visibility rule applied
            //--------------------------------
            await expect(radioField).toBeVisible();
            await expect(radioField).toContainText(resp1);
            await expect(radioField).toContainText(resp2);

            // ✅ Visibility rule indicator is present via CSS state
            await expect(radioField).toHaveClass(/has-visibility-rule/);



        });
    },
);