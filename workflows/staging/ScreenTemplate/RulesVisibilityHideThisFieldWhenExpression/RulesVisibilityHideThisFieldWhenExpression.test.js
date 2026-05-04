import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

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

test.describe('Rules - Visibility - Hide This Field When Expression', () => {
    test('Email field hides when Team equals selected value', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'RulesVisibilityHideWhenExp';
        const screenTemplateGroup = 'Authorization - RF';
        const defaultTemplate = `${screenTemplateGroup} - Default`;
        const screenNameBase = `${defaultTemplate} - Copy - `;
        const screenName = `${defaultTemplate} - Copy - ${Date.now()}`;
        const emailInputLiteral = 'Email: ';

        //const { page } = await logIn({ loginID});

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });


        await waitUntilLoaded(page);

        // Clean up any existing copies
        await cleanupScreenTemplateCopy(page, {
            screenName: screenNameBase,
            screenTemplateGroup,
            defaultTemplate,
            dontClose: true,
        });

        // Create screen copy
        await copyDefaultScreenTemplate(page, {
            defaultTemplate,
            screenTemplateGroup,
            customScreenName: screenName,
            onScreen: true,
            dontClose: true,
        });

        await waitUntilLoaded(page);

        //--------------------------------
        // Act – Add Email Field
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Field' }).first(),
        );

        await clickAndWait(
            page,
            page.locator(
                `[role="tooltip"] [role="combobox"]:above(:text-is("After")):visible`,
            ),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: ' Email' })
                .locator('div'),
        );

        await clickAndWait(
            page,
            page.locator(`[role="tooltip"] button:has-text("Add")`),
        );

        //--------------------------------
        // Act – Configure Visibility Rule
        //--------------------------------
        await clickAndWait(
            page,
            page.locator('[aria-controls="rules-tab-content"]'),
        );

        await clickAndWait(
            page,
            page
                .locator(
                    `[class="rule-wrapper"]:has-text("Visibility") [class="flex-item"]`,
                )
                .last(),
        );

        await clickAndWait(
            page,
            page.locator(
                `li[role="option"] span:text-is("Hide this field when...")`,
            ),
        );

        // Select field: Team
        await clickAndWait(
            page,
            page.getByText('Select a field...').first(),
        );

        await clickAndWait(
            page,
            page.locator(`[role="option"] :text-is("Team")`),
        );

        // Select team value
        await clickAndWait(
            page,
            page
                .getByRole('tabpanel', { name: 'Rules' })
                .getByLabel('expand combobox'),
        );

        await page.locator(`[role="option"]:visible`).first().waitFor();

        const allTeams = await page
            .locator(`[role="option"]:visible`)
            .allInnerTexts();

        const selectedTeam = faker.helpers.arrayElement(allTeams);

        await clickAndWait(
            page,
            page.locator(
                `[role="option"] :text-is("${selectedTeam}"):visible`,
            ),
        );

        await waitUntilLoaded(page);

        //--------------------------------
        // Act – Save & Preview
        //--------------------------------
        await clickAndWait(
            page,
            page.locator(`button:text-is("Save")`),
        );

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Preview' }),
        );

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert – Email is initially visible
        //--------------------------------
        const emailInput = page.locator(
            `[role="dialog"] [class="formField fieldcol1 rowLast"]:has-text("${emailInputLiteral}") input`,
        );

        await emailInput.waitFor();

        //--------------------------------
        // Act – Select Team in Preview
        //--------------------------------
        await clickAndWait(
            page, // ✅ FIX: page passed correctly
            page.locator(
                `[role="dialog"] [class="formField fieldcol1 rowFirst"]:has-text("Team") button:visible`,
            ).first(),
            500,
        );

        await clickAndWait(
            page,
            page.locator(`li :text-is("${selectedTeam}")`),
        );

        //--------------------------------
        // Assert – Email is hidden
        //--------------------------------
        try {
            await expect(emailInput).toBeVisible({ timeout: 5000 });
            throw new Error('Email input should be hidden');
        } catch {
            await expect(emailInput).not.toBeVisible();
        }

        //--------------------------------
        // Assert – Team is required
        //--------------------------------
        const teamLabel = page.locator(
            `[class="required-asterisk"] ~ [class="label required"]:text-is("Team:")`,
        );

        await expect(teamLabel).toBeVisible();
        await expect(teamLabel).toHaveCSS(
            'color',
            'rgb(255, 0, 0)',
            { timeout: 5000 },
        );

    });
});