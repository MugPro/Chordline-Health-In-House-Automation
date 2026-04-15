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
    'Rules - Notify When Field Value Changes (Field + Variable)',
    () => {
        test(
            "Notification triggers only when field condition AND variable condition are met",
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'STRNotifyWhenFieldValueChAnd';
                const screenTemplateGroup = 'Authorization - OP';
                const defaultTemplate = 'Authorization - OP - Default';
                const copyTemplate = 'Authorization - OP - Default - Copy';
                const screenName = 'NotifyWhenFieldValChAnd';
                const screenTemplateCopyName = `${screenName}${Date.now()}`;
                const fieldText = 'Should a notification pop up?';
                const resp1 = 'Yes';
                const resp2 = 'No';

                const memberFirstName = 'Jennifer';
                const memberLastName = 'Collins';
                const memberFirstName1 = 'James';
                const memberLastName1 = 'Dillinger';

                const { page } = await logIn({
                    loginID,
                    slowMo: 500,
                });

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
                    screenName: copyTemplate,
                    onScreen: true,
                    dontClose: true,
                });
                // -- Cleanup: End --

                // Copy default template
                await copyDefaultScreenTemplate(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    onScreen: true,
                    dontClose: true,
                });

                await waitUntilLoaded(page);

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
                // Act – Create dropdown field
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
                        '[data-role="staticlist"] [role="option"]:has-text("Drop Down"):visible',
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
                        '[data-role="staticlist"] [role="option"]:has-text("Field (Lookup): Team")',
                    ),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: 'Add',
                        exact: true,
                    }),
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
                    page.getByRole('button', {
                        name: ' Valid Response',
                    }),
                );

                await fillAndWait(
                    page,
                    page
                        .getByRole('tabpanel', {
                            name: 'Field Editor',
                        })
                        .getByRole('textbox')
                        .nth(1),
                    resp1,
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: ' Valid Response',
                    }),
                );

                await fillAndWait(
                    page,
                    page
                        .getByRole('tabpanel', {
                            name: 'Field Editor',
                        })
                        .getByRole('textbox')
                        .nth(2),
                    resp2,
                );

                //--------------------------------
                // Act – Rules (Field condition)
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
                                "​ Notify when this field's value changes and...",
                            exact: true,
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.getByText('Drop Down (this question)').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: 'Drop Down (this question)',
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.getByText('Is equal to').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', {
                        name: '​ Is equal to',
                    }),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        '[data-bind="visible: valueIsValidResponse"]',
                    ),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: '​ No' }),
                );

                await fillAndWait(
                    page,
                    page.locator(
                        '#notifyOnEntry-rule-element[type="text"]',
                    ),
                    `This is from ${screenTemplateCopyName}`,
                );

                //--------------------------------
                // Act – Preview & assert (field only)
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

                await expect(
                    page.locator(
                        'body #modal-window_wnd_title:text("New Screen - Internal (PREVIEW)")',
                    ),
                ).toBeVisible();

                await expect(async () => {
                    await page
                        .getByRole('combobox')
                        .filter({ hasText: 'YesNo' })
                        .getByLabel('select')
                        .click({ force: true, delay: 500 });

                    await page
                        .getByRole('option', { name: '​ No' })
                        .click({ timeout: 2500 });
                }).toPass({ timeout: 30 * 1000 });

                await expect(
                    page.getByText('Notification', { exact: true }),
                ).toBeVisible();

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



                await page.getByRole(`button`, { name: ` Close` }).click();

                //--------------------------------
                // Act – Switch rule to Variable
                //--------------------------------
                await page
                    .locator('[id*="auth_custom_field"]:visible')
                    .click();

                await clickAndWait(page, page.getByText('Rules'));

                await clickAndWait(
                    page,
                    page.getByRole('radio', { name: 'Variable' }),
                );

                await clickAndWait(
                    page,
                    page.getByText('Select a variable...').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', {
                        name: "Member's Birth Gender",
                    }),
                );

                await fillAndWait(
                    page,
                    page.getByRole('combobox', { name: 'Select...' }),
                    'Female',
                );

                await clickAndWait(
                    page,
                    page.getByText('Female', { exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Member with Female gender
                //--------------------------------
                await page
                    .getByLabel('New Screen - Internal')
                    .getByText('Close', { exact: true })
                    .click();

                await page
                    .locator(
                        `[role="row"]:has(:text-is("${screenTemplateCopyName}")) input`,
                    )
                    .first()
                    .click();

                await page.getByText('Close', { exact: true }).click();

                await clickAndWait(
                    page,
                    page.getByRole('tab', { name: 'Members' }).locator('span'),
                );

                await page.locator('[selectedvalue="active"]').click();
                await page.locator('#inactive').check();

                await fillAndWait(
                    page,
                    page.getByRole('textbox', { name: 'Search...' }),
                    `${memberLastName}, ${memberFirstName}`,
                );

                await page.keyboard.press('Enter');

                await page
                    .getByRole('gridcell', {
                        name: `${memberLastName}, ${memberFirstName}`,
                    })
                    .dblclick();

                await expect(
                    page.getByText('* Birth Gender: Female'),
                ).toBeVisible();

                //--------------------------------
                // Assert – Notification fires
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByText('Authorizations').nth(2),
                );

                await page
                    .getByRole('button')
                    .filter({
                        hasText: 'Authorization Inpatient',
                    })
                    .hover();

                await page.getByText('Outpatient', { exact: true }).click();

                await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page
                        .getByRole('combobox')
                        .filter({ hasText: 'YesNo' })
                        .locator('span')
                        .nth(1),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: 'No' }),
                );

                await expect(
                    page.getByText(
                        `This is from ${screenTemplateCopyName}`,
                    ),
                ).toBeVisible();
            },
        );
    },
);
