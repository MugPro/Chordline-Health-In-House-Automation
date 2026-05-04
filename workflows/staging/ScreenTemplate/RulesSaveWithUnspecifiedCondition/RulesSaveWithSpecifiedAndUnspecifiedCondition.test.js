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
    'Rules - Save with specified and unspecified condition',
    () => {
        test(
            'Shows error when condition value is missing and saves when specified',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'RulesSaveUnspecCond';
                const screenTemplateGroup = 'Touch Visit';
                const defaultTemplate = 'Touch Visit - Default';
                const screenName = 'SaveWithUnspecCond';
                const screenTemplateCopyName = `${screenName}${Date.now()}`;
                const fieldText =
                    'Should receive warning when saving and no condition is specificed';
                const resp1 = 'Yes';
                const resp2 = 'No';

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
                    screenName: 'Touch Visit - Default - Copy',
                    onScreen: true,
                    dontClose: true,
                });
                // -- Cleanup: End --

                //--------------------------------
                // Copy default template
                //--------------------------------
                await copyDefaultScreenTemplate(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    onScreen: true,
                    dontClose: true,
                });

                await fillAndWait(
                    page,
                    page.getByRole('textbox', { name: 'Screen Name:' }),
                    screenTemplateCopyName,
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Create Radio Button field
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
                    ),
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
                        '[data-role="staticlist"] [role="option"]:has-text("Field (Lookup): Touch Focus")',
                    ),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Add', exact: true }),
                );

                //--------------------------------
                // Field Editor
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
                // Rules – Mandatory with missing condition
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByText('Rules', { exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByText('Never mandatory').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: '​ Mandatory when...',
                            exact: true,
                        })
                        .locator('span'),
                );

                //--------------------------------
                // Act – Save with unspecified condition
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                //--------------------------------
                // Assert – Error appears
                //--------------------------------
                await expect(
                    page.locator(
                        '#notificationWindow_wnd_title:has-text("Error")',
                    ),
                ).toBeVisible();

                await expect(
                    page.getByText(
                        'A value must be specified for every condition.',
                    ),
                ).toBeVisible();

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Okay' }),
                );

                //--------------------------------
                // Act – Specify condition value and save
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByLabel('Rules').getByText('Select...'),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: '​ Yes' }),
                );

                await expect(
                    page.getByRole('button', { name: 'Save' }),
                ).toBeEnabled();

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                //--------------------------------
                // Assert – Successful save
                //--------------------------------
                await expect(
                    page.locator(
                        '#notificationWindow_wnd_title:has-text("Error")',
                    ),
                ).not.toBeVisible();

                await expect(
                    page.getByText(
                        'A value must be specified for every condition.',
                    ),
                ).not.toBeVisible();

                await expect(
                    page.getByRole('button', { name: 'Save' }),
                ).toBeDisabled();


            },
        );
    },
);