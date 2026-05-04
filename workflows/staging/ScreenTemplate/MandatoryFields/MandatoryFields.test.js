import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after actions
------------------------------------------- */
const ACTION_PAUSE_MS = 700;

const pause = (page, ms = ACTION_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = ACTION_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

test.describe(
    'Mandatory Fields – Always Mandatory Rule',
    () => {
        test(
            'Medical Review To field shows as mandatory in Preview when set to Always Mandatory',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'MandatoryFields';
                const screenTemplateGroup = 'Medical Review - BH OBS';
                const defaultTemplate = 'Medical Review - OBS - BH - Default';
                const screenName = `${defaultTemplate} - Copy`;
                const mandatoryField = 'Medical Review To:';

                //const { page } = await logIn({ loginID });

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;





                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url });


                await waitUntilLoaded(page);

                //--------------------------------
                // Cleanup (pre-test)
                //--------------------------------
                try {
                    await cleanupScreenTemplateCopy(page, {
                        screenName,
                        screenTemplateGroup,
                        defaultTemplate,
                        dontClose: true,
                    });
                } catch (e) {
                    await reportCleanupFailed({
                        dedupKey: 'cleanupScreenTemplateCopy',
                        errorMsg: e.message,
                    });
                }

                //--------------------------------
                // Create copy of default template
                //--------------------------------
                await copyDefaultScreenTemplate(page, {
                    defaultTemplate,
                    screenTemplateGroup,
                    screenName,
                    onScreen: true,
                    dontClose: true,
                });

                //--------------------------------
                // Act
                //--------------------------------
                // Open mandatory field
                await clickAndWait(
                    page,
                    page.getByText(mandatoryField),
                );

                // Open Rules tab
                await clickAndWait(
                    page,
                    page.getByText('Rules'),
                );

                // Change from Never mandatory → Always mandatory
                await clickAndWait(
                    page,
                    page.getByText('Never mandatory').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', { name: 'Always mandatory' })
                        .locator('span'),
                );

                // Save rules
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );
                await waitUntilLoaded(page);

                // Preview screen
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Preview' }),
                );
                await waitUntilLoaded(page);

                //--------------------------------
                // Assert
                //--------------------------------
                const medReviewToLabel = page
                    .getByLabel('New Screen - Internal', { exact: true })
                    .getByText('* Medical Review To:')
                    .first();

                // Asterisk is visible
                await expect(
                    page.locator('.required-asterisk').nth(1),
                ).toBeVisible();

                // Label text is visible
                await expect(medReviewToLabel).toBeVisible();

                // Label color is red
                const labelColor = await medReviewToLabel.evaluate(
                    (el) => getComputedStyle(el).color,
                );

                expect(['rgb(255, 0, 0)']).toContain(labelColor);

                //--------------------------------
                // Cleanup
                //--------------------------------
                // Close Preview
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                // Close editor
                await clickAndWait(
                    page,
                    page
                        .getByLabel('New Screen - Internal')
                        .getByText('Close', { exact: true }),
                );


            },
        );
    },
);