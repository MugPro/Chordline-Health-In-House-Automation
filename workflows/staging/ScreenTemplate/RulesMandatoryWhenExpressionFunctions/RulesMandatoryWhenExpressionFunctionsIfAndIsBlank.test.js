import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Helpers
------------------------------------------- */
const ACTION_PAUSE_MS = 350;

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

/* -------------------------------------------
   Shared State
------------------------------------------- */
let page;
let saveCheckboxElement;
let customScreenName;
let screenTemplateGroup;
let defaultTemplate;

test.describe(
    'Rules – Mandatory when expression – Functions (If, IsBlank)',
    () => {

        test('Rules – Mandatory when expression – Functions – If and IsBlank', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = 'ComputedWhen';
            screenTemplateGroup = 'Authorization - RF';
            defaultTemplate = `${screenTemplateGroup} - Default`;
            const screenName = `${defaultTemplate} - Copy`;
            customScreenName = `${loginID}${Date.now()}`;

            // NOTE: reviewer id must exist
            /*
            const ifCondition =
                "If ( aush_status_id = 'CLOSED' AND auth_reviewer_user_id = '191', TRUE, FALSE )";

             */


            // ✅ Stable IF condition
            const ifCondition =
                "If ( aush_status_id = 'CLOSED', TRUE, FALSE )";


            const reviewerValue = 'Computed When';
            const referralStatus = 'Closed';

           // ({ page } = await logIn({ loginID }));

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                url });



            await cleanupScreenTemplateCopy(page, {
                screenName,
                screenTemplateGroup,
                defaultTemplate,
                dontClose: true,
            });

            await cleanupScreenTemplateCopy(page, {
                screenName: 'ComputedWhen',
                screenTemplateGroup,
                defaultTemplate,
                dontClose: true,
                onScreen: true,
            });

            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                customScreenName,
                dontClose: true,
                onScreen: true,
            });

            await waitUntilLoaded(page);

            //--------------------------------
            // Act – Configure If() expression
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('#auth_team_reference_id_overlay'),
            );

            await clickAndWait(
                page,
                page.locator('[aria-controls="rules-tab-content"]'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({
                        hasText: 'Mandatory when...Never',
                    })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', {
                        name: 'Mandatory when expression...',
                    })
                    .locator('span'),
            );

            await clickAndWait(
                page,
                page.getByRole('button', {
                    name: 'Clear Expression',
                }),
            );

            await fillAndWait(
                page,
                page.locator('#flyout-textarea'),
                ifCondition,
            );

            await clickAndWait(
                page,
                page.getByRole('button', {
                    name: 'Select',
                    exact: true,
                }),
            );

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
            // Act – Satisfy IF condition
            //--------------------------------
            const reviewerInput = page
                .locator('input[name="auth_reviewer_user_id_input"]')
                .last();

            await expect(async () => {
                await reviewerInput.fill(reviewerValue);
                await page
                    .locator('#auth_reviewer_user_id-autocomplete_listbox')
                    .getByText(reviewerValue)
                    .click();

                await waitUntilLoaded(page);

                await expect(reviewerInput).toHaveValue(reviewerValue);
            }).toPass({ timeout: 30_000 });

            await waitUntilLoaded(page);
            await page.keyboard.press('Enter');

            await clickAndWait(
                page,
                page
                    .locator('.input [title="clear"][role="button"]')
                    .first(),
            );

            await page.keyboard.type(referralStatus);

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: referralStatus })
                    .locator('span'),
            );

            //--------------------------------
            // Assert
            //--------------------------------
            saveCheckboxElement = page.locator(
                `[class*="left flex-container-row"]:has(:text("Team"))`,
            );

            const closeReferralStatusButton = page.locator(
                `.input [role="button"] >> nth=0`,
            );

            /*
            await expect(
                saveCheckboxElement.locator('[class*="required-asterisk"]'),
            ).toBeVisible();

             */



            // Force rule evaluation
            await clickAndWait(page, page.locator('#record-splitter'));

            await expect(
                saveCheckboxElement.locator('[class*="required-asterisk"]'),
            ).toBeVisible();










            await clickAndWait(page, closeReferralStatusButton);

            await expect(
                saveCheckboxElement.locator('[class*="required-asterisk"]'),
            ).not.toBeVisible();




            //--------------------------------
            // Rules – Mandatory when expression – Function – IsBlank()
            //--------------------------------
            const isBlankCondition =
                'IsBlank ( auth_reviewer_user_id  )';

            //--------------------------------
            // Act – Change rule to IsBlank
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Close' }),
            );

            await clickAndWait(
                page,
                page.locator('#auth_team_reference_id_overlay'),
            );

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.locator('[aria-controls="rules-tab-content"]'),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: '' }),
            );

            await clickAndWait(
                page,
                page.getByRole('button', {
                    name: 'Clear Expression',
                }),
            );

            await page.keyboard.type(isBlankCondition);

            await clickAndWait(
                page,
                page.getByRole('button', {
                    name: 'Select',
                    exact: true,
                }),
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
            // Assert – Blank reviewer
            //--------------------------------
            await expect(
                saveCheckboxElement.locator('[class*="required-asterisk"]'),
            ).toBeVisible();

            //--------------------------------
            // Act – Populate reviewer
            //--------------------------------
            await waitUntilLoaded(page);

            /*
            const reviewerInput = page
                .locator('.input [name="auth_reviewer_user_id_input"]')
                .last();

             */

            await reviewerInput.fill('Computed When');

            await clickAndWait(
                page,
                page
                    .getByRole('option', {
                        name: 'Computed When',
                    })
                    .locator('span'),
            );

            //--------------------------------
            // Assert – Not blank anymore
            //--------------------------------
            await expect(
                saveCheckboxElement.locator('[class*="required-asterisk"]'),
            ).not.toBeVisible();


        });
    },
);