import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after actions
------------------------------------------- */
const ACTION_PAUSE_MS = 10;

const pause = (page, ms = ACTION_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = ACTION_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

test.describe('Unable to Update Default Text Area Field Text', () => {
    test('Default textarea field text is disabled and cannot be edited', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const screenTemplateGroup = 'Medical Review - BH OBS';
        const defaultTemplate = 'Medical Review - OBS - BH - Default';
        const screenName = `${defaultTemplate} - copy2`;
        const loginID = 'UnableToDefault';

        const customScreenName = screenName;

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });


        await waitUntilLoaded(page);



        await cleanupScreenTemplateCopy(page, {
            screenTemplateGroup,
            defaultTemplate,
            screenName,
            //dontClose: true,
        });

        await waitUntilLoaded(page);

        await copyDefaultScreenTemplate(page, {
            screenTemplateGroup,
            defaultTemplate,
            //screenName,
            customScreenName: customScreenName,
            //dontClose: true,
        });

        await waitUntilLoaded(page);

        //--------------------------------
        // Act – Navigate to screen editor
        //--------------------------------
        await clickAndWait(page, page.getByText('Tools'));
        await clickAndWait(page, page.getByText('Screen Templates'));
        await clickAndWait(page, page.getByText(screenTemplateGroup));

        await clickAndWait(
            page,
            page.getByRole('gridcell', { name: screenName }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: '' }), // Edit
        );

        //--------------------------------
        // Act – Open textarea rules
        //--------------------------------
        await clickAndWait(
            page,
            page.locator('#mrdt_summary_overlay'),
        );

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.getByText('Rules'),
        );

        await clickAndWait(
            page,
            page
                .getByRole('combobox')
                .filter({ hasText: 'Never mandatoryNever' })
                .getByLabel('select'),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: 'Always mandatory' })
                .locator('span'),
        );

        await clickAndWait(
            page,
            page.getByText('Field Editor'),
        );

        //--------------------------------
        // Assert
        //--------------------------------
        const fieldTextArea = page.locator('#question-text');

        await expect(fieldTextArea).toBeVisible();
        await expect(fieldTextArea).toBeDisabled();


    });
});