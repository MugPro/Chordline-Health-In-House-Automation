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

test.describe('Rules – Computed Always Computed', () => {
    test('Auth Status can be set to Always Computed with value Completed', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const screenTemplateGroup = 'Authorization - BH OP';
        const defaultTemplate = 'Authorization - OP- BH - Default';
        const screenName = `${defaultTemplate} - Copy`;
        const prefix = 'RulesComputed';
        const customScreenName = `${prefix}${Date.now()}`;
        const loginID = '870943';

        const { page } = await logIn({ loginID });

        // Pre-test cleanup
        await cleanupScreenTemplateCopy(page, {
            screenName,
            screenTemplateGroup,
            defaultTemplate,
            dontClose: true,
        });

        await cleanupScreenTemplateCopy(page, {
            screenName: prefix,
            screenTemplateGroup,
            defaultTemplate,
            dontClose: true,
            onScreen: true,
        });

        // Create template copy
        await copyDefaultScreenTemplate(page, {
            defaultTemplate,
            screenTemplateGroup,
            screenName,
            customScreenName,
            onScreen: true,
            dontClose: true,
        });

        //--------------------------------
        // Act
        //--------------------------------
        await expect(async () => {
            await page
                .locator('[id="aush_status_id_overlay"]')
                .click({ force: true, delay: 500 });

            await waitUntilLoaded(page);

            await page
                .locator('[aria-controls="rules-tab-content"]')
                .click({ force: true, timeout: 3500 });
        }).toPass({ timeout: 30 * 1000 });

        // Change Default rule
        await clickAndWait(
            page,
            page.getByText('Default once on new records').first(),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: '​ Never default' })
                .locator('span'),
        );

        // Change Computed rule
        await clickAndWait(
            page,
            page.getByText('Never computed').first(),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: '​ Always computed' })
                .locator('span'),
        );

        // Select computed value
        await clickAndWait(
            page,
            page
                .getByRole('tabpanel', { name: 'Rules' })
                .getByLabel('expand combobox')
                .nth(1),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: '​ Completed' })
                .locator('span'),
        );

        // Preview
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
        // Assert
        //--------------------------------
        const authStatusInput = page.locator('.input').first();

        await expect(authStatusInput).toBeVisible();
        await expect(authStatusInput).toContainText('Completed');

        await expect(
            page.getByText('Auth Status:', { exact: true }),
        ).toBeVisible();



    });
});