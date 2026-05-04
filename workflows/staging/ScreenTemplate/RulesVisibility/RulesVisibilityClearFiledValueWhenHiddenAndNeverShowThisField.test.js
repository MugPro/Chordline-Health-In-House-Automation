import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

const ACTION_PAUSE_MS = 10;

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

test.describe(
    'Rules - Visibility - Clear field value when hidden & Never show this field',
    () => {
        test(
            'Clears field value when hidden and hides field when never shown',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const screenTemplateGroup = 'Authorization - BH IP';
                const defaultTemplate = 'Authorization - IP - BH - Default';
                const screenName = `${defaultTemplate} - Copy`;
                const prefix = 'rulesVis';
                const customScreenName = `${prefix}${Date.now()}`;
                const loginID = 'RulesVisiblity';
                const admittedType = 'Emergency';
                const submittedBy = 'QA Wolf';

                //const { page } = await logIn({ loginID });

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;





                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url });

                await waitUntilLoaded(page);

                //--------------------------------
                // Cleanup existing templates
                //--------------------------------
                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    dontClose: true,
                });

                try {
                    await cleanupScreenTemplateCopy(page, {
                        screenName: prefix,
                        screenTemplateGroup,
                        defaultTemplate,
                        dontClose: true,
                        onScreen: true,
                    });
                } catch (e) {
                    console.log(e);
                }

                //--------------------------------
                // Copy default template
                //--------------------------------
                await copyDefaultScreenTemplate(page, {
                    defaultTemplate,
                    screenTemplateGroup,
                    customScreenName,
                    onScreen: true,
                });

                //--------------------------------
                // Act – Open copied template
                //--------------------------------
                await clickAndWait(page, page.getByText('Tools'));
                await clickAndWait(page, page.getByText('Screen Templates').first());

                await clickAndWait(
                    page,
                    page.getByRole('gridcell', {
                        name: customScreenName,
                        exact: true,
                    }),
                );

                await clickAndWait(
                    page,
                    page.locator('[title="Edit"]:visible').first(),
                );

                //--------------------------------
                // Scenario 1: Never show this field
                //--------------------------------
                await clickAndWait(
                    page,
                    page.locator('[data-table-code="USER"]').nth(0),
                );

                await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.locator('#field-property-tabs-tab-2'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        '[class="rule-wrapper"]:has-text("Visibility") [role="combobox"] [role="button"]',
                    ),
                );

                await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: '​ Never show this field',
                        })
                        .locator('span'),
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
                // Assert – Field hidden
                //--------------------------------
                await expect(
                    page.getByText('Reviewer:', { exact: true }),
                ).not.toBeVisible();

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                //--------------------------------
                // Scenario 2: Hide when + clear value
                //--------------------------------
                await clickAndWait(
                    page,
                    page.locator('#auth_submitted_by_overlay'),
                );

                await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByText('Rules', { exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByText('Always show this field').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: '​ Hide this field when...',
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.getByText('Select a field...').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', { name: '​ Admit Type' })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('tabpanel', { name: 'Rules' })
                        .getByLabel('expand combobox'),
                );

                await clickAndWait(
                    page,
                    page.getByText(admittedType),
                );

                await clickAndWait(
                    page,
                    page.getByRole('checkbox', {
                        name: 'Clear field value when hidden',
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
                // Act – Fill Submitted By
                //--------------------------------
                await fillAndWait(
                    page,
                    page
                        .getByRole('dialog', {
                            name: '​ Edit Screen - Internal (',
                        })
                        .locator('#auth_submitted_by'),
                    submittedBy,
                );

                //--------------------------------
                // Assert – Field visible & value set
                //--------------------------------
                await expect(
                    page
                        .getByLabel('Edit Screen - Internal (')
                        .getByText('Submitted By:'),
                ).toBeVisible();

                await expect(
                    page.locator('[class="input"] [id="auth_submitted_by"]'),
                ).toHaveValue(submittedBy);

                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Trigger hide condition
                //--------------------------------
                await clickAndWait(
                    page,
                    page.locator(
                        '[id="record-splitter"] [class*="formField"]:has-text("Admit Type") >> [aria-label*="combobox"]',
                    ),
                );

                await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByText(admittedType),
                );

                //--------------------------------
                // Assert – Field hidden & value cleared
                //--------------------------------
                await expect(
                    page
                        .getByLabel('Edit Screen - Internal (')
                        .getByText('Submitted By:'),
                ).not.toBeVisible();






/*
                await expect(
                    page.locator('[class="input"] [id="auth_submitted_by"]'),
                ).not.toHaveValue(submittedBy);

 */





                await expect(page.getByRole('dialog', { name: 'Edit Screen - Internal (' }).locator('#auth_submitted_via')).toBeVisible();
                await expect(page.getByRole('dialog', { name: 'Edit Screen - Internal (' }).locator('#auth_submitted_via')).toBeEmpty();



            },
        );
    },
);