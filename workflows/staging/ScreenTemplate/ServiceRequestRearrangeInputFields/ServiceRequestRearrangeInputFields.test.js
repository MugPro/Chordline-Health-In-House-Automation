import { test, expect } from '@playwright/test';

import {
    logIn,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate, waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

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

test.describe('Service Request – Rearrange Input Fields', () => {
    test('Input fields can be rearranged via drag and drop', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'ArrangeFields';
        const screenTemplateGroup = 'Provider Group';
        const defaultTemplate = 'Provider Group - Default';
        const copyTemplate = 'Provider Group - Default - Copy';
        const screenName = 'ANFRadioBTest';

        const { page } = await logIn({ loginID });

        await waitUntilLoaded(page);

        // Clean up any existing copy
        await cleanupScreenTemplateCopy(page, {
            screenTemplateGroup,
            defaultTemplate,
            screenName: copyTemplate,
            //dontClose: true,
        });

        await waitUntilLoaded(page);

        // Create a copy of the default template
        await copyDefaultScreenTemplate(page, {
            screenTemplateGroup,
            defaultTemplate,
            screenName,
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
            page.getByRole('gridcell', {
                name: copyTemplate,
            }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: '' }), // Edit
        );

        await waitUntilLoaded(page);

        //--------------------------------
        // Act – Drag and drop fields
        //--------------------------------
        const npiFieldContainer = page.locator('#prov_npi_overlay');
        const otherLanguagesContainer = page.locator(
            '#prov_languages_overlay',
        );

        await npiFieldContainer.dragTo(otherLanguagesContainer);
        await pause(page, 1000);

       // await waitUntilLoaded(page);

        //--------------------------------
        // Act – Save and preview
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Save' }),
        );

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Preview' }),
        );

        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert
        //--------------------------------
        await expect(npiFieldContainer).toBeVisible();
        await expect(otherLanguagesContainer).toBeVisible();

        const npiBox = await npiFieldContainer.boundingBox();
        const otherLanguagesBox =
            await otherLanguagesContainer.boundingBox();

        try {
            expect(npiBox && otherLanguagesBox).toBeTruthy();
            expect(npiBox.y).toBeCloseTo(
                otherLanguagesBox.x + 342.984375,
                0.5,
            );
        } catch {
            await expect(
                page.locator('[role="dialog"] [id="modal-window"]'),
            ).toHaveScreenshot('service-request-rearrange-input-fields.png');
        }

    });
});
