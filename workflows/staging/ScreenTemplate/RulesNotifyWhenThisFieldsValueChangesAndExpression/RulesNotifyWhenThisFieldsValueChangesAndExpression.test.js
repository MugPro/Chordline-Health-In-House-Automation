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

const fillAndWait = async (page, locator, value, ms = ACTION_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test.describe(
    "Rules - Notify When Field Value Changes (Expression)",
    () => {
        test(
            "Notification triggers only when expression evaluates to true",
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'NotifyWhenFieldValChangeExpr';
                const screenTemplateGroup = 'Work Log';
                const defaultTemplate = 'Work Log - Default';
                const screenName = 'NotifyValueChangeExpr';
                const screenTemplateCopyName = `${screenName}${Date.now()}`;
                const fieldText = 'Always notify with expression';
                const resp1 = 'Yes';
                const resp2 = 'No';
                const activityType = 'Case Management Activity';

                //const { page } = await logIn({ loginID });

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;





                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url });


                await waitUntilLoaded(page);

                // -- Cleanup: Start --
                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName: 'Work Log - Default (Copy)',
                    dontClose: true,
                    onScreen: true,
                });
                // -- Cleanup: End --

                //--------------------------------
                // Copy default template
                //--------------------------------
                await copyDefaultScreenTemplate(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    dontClose: true,
                    onScreen: true,
                });

                //await waitUntilLoaded(page);

                await fillAndWait(
                    page,
                    page.getByRole('textbox', { name: 'Screen Name:' }),
                    screenTemplateCopyName,
                );


                try {
                    await page.getByRole('button', { name: 'Save' }).click();
                } catch {
                    await page.getByRole('button', { name: 'OK' }).click();
                    await page.getByRole('button', { name: 'Save' }).click();
                }

                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Create radio button field
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Field' }).first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('radio', { name: 'New Custom field' }),
                );

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="fieldTypes_listbox"]'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        '[data-role="staticlist"] [role="option"]:has-text("Radio Button"):visible',
                    ).first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('radio', { name: 'Before' }),
                );

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="fieldsInSection_listbox"]'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        '[data-role="staticlist"] [role="option"]:has-text("Field (Lookup): Completed By")',
                    ),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Add', exact: true }),
                );

                //--------------------------------
                // Act – Field editor
                //--------------------------------
                await fillAndWait(
                    page,
                    page.locator('#question-text'),
                    fieldText,
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

                //--------------------------------
                // Act – Rules (Expression)
                //--------------------------------
                await clickAndWait(page, page.getByText('Rules'));

                await clickAndWait(
                    page,
                    page.getByText('Never notify').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name:
                                "​ Notify when this field's value changes and expression...",
                            exact: true,
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.getByText('Fields (Work Log)'),
                );

                await clickAndWait(
                    page,
                    page.getByText('Activity Type ('),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Use Field (Code)' }),
                );

                await page.keyboard.press('=');

                await clickAndWait(
                    page,
                    page
                        .getByRole('dialog', { name: '​ Set Notify on Change' })
                        .getByLabel('expand combobox'),
                );

                await clickAndWait(
                    page,
                    page.getByText(activityType),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: 'Insert Code Value',
                    }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Select', exact: true }),
                );

                await fillAndWait(
                    page,
                    page.locator('#notifyOnEntry-rule-element[type="text"]'),
                    `This is from ${screenTemplateCopyName}`,
                );

                //--------------------------------
                // Act – Preview
                //--------------------------------
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
                // Assert – Preview load
                //--------------------------------
                await expect(
                    page.locator(
                        'body #modal-window_wnd_title:text("New Screen - Internal (PREVIEW)")',
                    ),
                ).toBeVisible();

                //--------------------------------
                // Assert – Expression FALSE
                //--------------------------------
                await page.locator(
                    '[name*="work_custom_field_"][value="Yes"]',
                ).click();

                await expect(
                    page.getByText('Notification', { exact: true }),
                ).not.toBeVisible();

                //--------------------------------
                // Act – Set Activity Type
                //--------------------------------
                await fillAndWait(
                    page,
                    page
                        .getByRole('dialog', {
                            name: '​ New Screen - Internal (',
                        })
                        .locator('input[name="work_activity_type_input"]'),
                    activityType,
                );

                await clickAndWait(
                    page,
                    page.getByText(activityType),
                );

                //--------------------------------
                // Assert – Expression TRUE
                //--------------------------------
                await page.locator(
                    '[name*="work_custom_field_"][value="No"]',
                ).click();

                await expect(
                    page.getByText(
                        `This is from ${screenTemplateCopyName}`,
                    ),
                ).toBeVisible();

                await expect(
                    page
                        .getByLabel('Notification')
                        .getByText(fieldText),
                ).toBeVisible();

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Okay' }),
                );

            },
        );
    },
);