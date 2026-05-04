

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

test.describe('Move This Field - Before and After (Single Test)', () => {
    test('Radio Button field can be moved Before and After other fields', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'FieldBefore';
        const screenTemplateGroup = 'Medical Review - BH IP';
        const defaultTemplate = 'Medical Review - IP - BH - Default';
        const screenName = `${defaultTemplate} - Copy`;

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });



        await waitUntilLoaded(page);

        await cleanupScreenTemplateCopy(page, {
            screenName,
            screenTemplateGroup,
            defaultTemplate,
        });

        await copyDefaultScreenTemplate(page, {
            defaultTemplate,
            screenTemplateGroup,
            screenName,
        });

        //--------------------------------
        // ACT 1 — Move field BEFORE
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
            page.getByRole('button', { name: '' }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Field' }),
        );

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.getByRole('radio', { name: 'Before' }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Preview' }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Yes' }),
        );

        //--------------------------------
        // ASSERT 1 — BEFORE
        //--------------------------------
        await expect(
            page
                .getByLabel('Edit Screen - Internal', { exact: true })
                .getByText('Radio Button:'),
        ).toBeVisible();

        await expect(
            page
                .getByLabel('Edit Screen - Internal', { exact: true })
                .getByText('* Medical Review From:'),
        ).toBeVisible();

        let labels = await page.locator('.formSectionContent .label').all();
        let radioIndex = -1;
        let medReviewFromIndex = -1;

        for (let i = 0; i < labels.length; i++) {
            const text = (await labels[i].innerText()).trim();
            if (text.startsWith('Radio Button:')) radioIndex = i;
            if (text.includes('Medical Review From:')) medReviewFromIndex = i;
        }

        expect(radioIndex).not.toBe(-1);
        expect(medReviewFromIndex).not.toBe(-1);
        expect(radioIndex).toBeLessThan(medReviewFromIndex);

        //--------------------------------
        // ACT 2 — Move field AFTER
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Close' }),
        );

        await clickAndWait(
            page,
            page.getByText('Radio Button:'),
        );

        await clickAndWait(
            page,
            page.locator(
                `[class="formSectionContent clearboth"]:has-text("Radio Button:") button[title="Remove"]:visible`,
            ),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Field' }),
        );

        await clickAndWait(
            page,
            page.getByText('After'),
        );

        await clickAndWait(
            page,
            page.locator('.position-field [aria-label="select"]'),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: 'Field (Lookup): Status' })
                .locator('div'),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Save' }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Preview' }),
        );

        //--------------------------------
        // ASSERT 2 — AFTER
        //--------------------------------
        labels = await page.locator('.formSectionContent .label').all();
        const labelTexts = [];

        for (const label of labels) {
            labelTexts.push((await label.innerText()).trim());
        }

        const statusIndex = labelTexts.findIndex(
            (text) => text === 'Status:',
        );

        const radioAfterIndex = labelTexts.findIndex(
            (text) => text === 'Radio Button:',
        );

        expect(statusIndex).not.toBe(-1);
        expect(radioAfterIndex).not.toBe(-1);
        expect(radioAfterIndex).toBeGreaterThan(statusIndex);

        //--------------------------------
        // Cleanup
        //--------------------------------
        /*
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

         */
    });
});