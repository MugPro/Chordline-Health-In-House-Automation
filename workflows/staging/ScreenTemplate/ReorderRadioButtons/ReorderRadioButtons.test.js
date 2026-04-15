import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';

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

const fillAndWait = async (page, locator, value, ms = ACTION_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test.describe('Reorder Radio Buttons', () => {
    test('Radio Buttons can be reordered via drag and drop', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'RadioButtonReorder';
        const screenTemplateGroup = 'Medical Review - BH OBS';
        const defaultTemplate = 'Medical Review - OBS - BH - Default';
        const screenName = `${defaultTemplate} - Copy`;
        const radioButton1 = 'radioButton1';
        const radioButton2 = 'radioButton2';

        const { page } = await logIn({ loginID });

        await cleanupScreenTemplateCopy(page, {
            screenName,
            screenTemplateGroup,
            defaultTemplate,
            dontClose: true,
        });

        await copyDefaultScreenTemplate(page, {
            defaultTemplate,
            screenTemplateGroup,
            screenName,
            onScreen: true,
            dontClose: true,
        });

        await waitUntilLoaded(page);

        //--------------------------------
        // Act – Create first radio button
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Field' }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        await fillAndWait(
            page,
            page.locator('#question-text'),
            radioButton1,
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Save' }),
        );

        //--------------------------------
        // Act – Create second radio button AFTER first
        //--------------------------------
        await clickAndWait(page, page.getByText(`${radioButton1}:`));
        await page.evaluate(() => window.scrollTo(0, 0));

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Field' }),
        );

        await clickAndWait(
            page,
            page.getByRole('radio', { name: 'After' }),
        );

        await clickAndWait(
            page,
            page.getByText('Field (Lookup): Medical').first(),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', {
                    name: `Field (Radio Button): ${radioButton1}`,
                })
                .locator('div'),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        await fillAndWait(
            page,
            page.locator('#question-text'),
            radioButton2,
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Save' }),
        );

        await waitUntilLoaded(page);

        //--------------------------------
        // Act – Drag and drop reorder
        //--------------------------------
        const sourceRadio = page.getByText(`${radioButton1}:`).first();
        const targetRadio = page.getByText(`${radioButton2}:`).first();

        await sourceRadio.dragTo(targetRadio, {
            position: { x: 10, y: 10 },
        });

        //--------------------------------
        // Assert
        //--------------------------------
        const radioLabels = await page
            .locator('div#record-div .formSectionContent .flex-item.label')
            .all();

        const labelTexts = [];
        for (const label of radioLabels) {
            labelTexts.push((await label.innerText()).trim());
        }

        const indexRadio2 = labelTexts.findIndex((text) =>
            text.startsWith(`${radioButton2}:`),
        );
        const indexRadio1 = labelTexts.findIndex((text) =>
            text.startsWith(`${radioButton1}:`),
        );

        expect(indexRadio2).toBeGreaterThan(-1);
        expect(indexRadio1).toBeGreaterThan(-1);
        expect(indexRadio2).toBeLessThan(indexRadio1);



    });
});