
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
    'Rules - Read Only When (Field + Variable)',
    () => {
        test(
            'Field becomes read-only when variable condition is met',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'ReadOnlyWhenVar';
                const screenTemplateGroup = 'Authorization - OBS';
                const defaultTemplate = 'Authorization - OBS - Default';
                const copyTemplate = 'Authorization - OBS - Default - Copy';
                const screenName = 'NotifyWhenFieldValChAnd';
                const screenTemplateCopyName = `${screenName}${Date.now()}`;
                const fieldText = 'Should be read only when team is case';
                const resp1 = 'Yes';
                const resp2 = 'No';

                const memberFirstName = 'Rebecca';
                const memberLastName = 'Dillon';
                const memberFirstName1 = 'Robert';
                const memberLastName1 = 'Bannister';


                /*
                const { page } = await logIn({
                    loginID,
                    slowMo: 300,
                });

                 */

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;





                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url, slowMo: 300 });


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

                //--------------------------------
                // Copy default template
                //--------------------------------
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
                // Act – Create checkbox field
                //--------------------------------
                await expect(async () => {
                    await page
                        .getByRole('button', { name: ' Field' })
                        .first()
                        .waitFor();

                    await page
                        .getByRole('button', { name: ' Field' })
                        .first()
                        .click({ force: true, delay: 500 });

                    await page
                        .getByRole('radio', { name: 'New Custom field' })
                        .click({ timeout: 3500 });
                }).toPass({ timeout: 30 * 1000 });

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="fieldTypes_listbox"]'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        '[data-role="staticlist"] [role="option"]:has-text("Checkbox"):visible',
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
                // Rules – Field condition
                //--------------------------------
                await clickAndWait(page, page.getByText('Rules'));

                await clickAndWait(
                    page,
                    page.getByText('Never read-only').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: 'Read-only when...',
                            exact: true,
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.getByText('Checkbox (this question)').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: 'Team' }),
                );

                await clickAndWait(
                    page,
                    page.getByText('Is equal to').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: '​ Is equal to' }),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('tabpanel', { name: 'Rules' })
                        .getByLabel('expand combobox'),
                );

                await clickAndWait(
                    page,
                    page.getByText('Case Team'),
                );

                //--------------------------------
                // Preview
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
                // Assert – Preview behavior
                //--------------------------------
                await expect(
                    page.locator(
                        'body #modal-window_wnd_title:text("New Screen - Internal (PREVIEW)")',
                    ),
                ).toBeVisible();

                await expect(
                    page.getByRole('checkbox', { name: 'Yes' }),
                ).toBeEnabled();

                await expect(
                    page.getByRole('checkbox', { name: 'No' }),
                ).toBeEnabled();






                await page.getByRole('button', { name: '...' }).nth(3).click();
                    await page.getByRole('gridcell', { name: 'Case Team' }).click();
                    await page.getByRole('button', { name: 'Select', exact: true }).click();

                    await waitUntilLoaded(page);







                await expect(
                    page.getByRole('checkbox', { name: 'Yes' }),
                ).toBeDisabled();

                await expect(
                    page.getByRole('checkbox', { name: 'No' }),
                ).toBeDisabled();

                await page.getByRole('button', { name: ' Close' }).click();

                //--------------------------------
                // Switch rule to Variable
                //--------------------------------
                await page
                    .locator('[id*="auth_custom_field"]:visible')
                    .nth(1)
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
                // Activate template
                //--------------------------------
                await expect(async () => {
                    await page
                        .getByLabel('New Screen - Internal')
                        .getByText('Close', { exact: true })
                        .click();

                    await page
                        .locator(
                            `[role="row"]:has(:text-is("${screenTemplateCopyName}")) input`,
                        )
                        .first()
                        .click({ timeout: 5000 });
                }).toPass({ timeout: 30 * 1000 });

                await page.getByText('Close', { exact: true }).click();

                //--------------------------------
                // Member: Female
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('tab', { name: 'Members' }).locator('span'),
                );






                await page.getByRole('button').filter({ hasText: 'Status: Active Active Inactive' }).click();
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

                await clickAndWait(
                    page,
                    page.getByText('Authorizations').nth(2),
                );

                await page
                    .getByRole('button')
                    .filter({ hasText: 'Authorization Inpatient' })
                    .hover();

                await page.getByText('Observation', { exact: true }).click();

                await waitUntilLoaded(page);

                await expect(
                    page.getByRole('checkbox', { name: 'Yes' }),
                ).toBeDisabled();

                await expect(
                    page.getByRole('checkbox', { name: 'No' }),
                ).toBeDisabled();

                //--------------------------------
                // Member: Male
                //--------------------------------
                await page
                    .getByRole('tab', {
                        name: `${memberLastName}, ${memberFirstName}`,
                    })
                    .locator('span')
                    .nth(2)
                    .click();

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Yes' }),
                );



                await fillAndWait(
                    page,
                    page.getByRole('textbox', { name: 'Search...' }),
                    `${memberLastName1}, ${memberFirstName1}`,
                );

                await page.keyboard.press('Enter');

                await page
                    .getByRole('gridcell', {
                        name: `${memberLastName1}, ${memberFirstName1}`,
                    })
                    .dblclick();

                await expect(
                    page.getByText('* Birth Gender: Male'),
                ).toBeVisible();

                await clickAndWait(
                    page,
                    page.getByText('Authorizations').nth(2),
                );

                await page
                    .getByRole('button')
                    .filter({ hasText: 'Authorization Inpatient' })
                    .hover();

                await page.getByText('Observation', { exact: true }).click();

                await waitUntilLoaded(page);

                await expect(
                    page.getByRole('checkbox', { name: 'Yes' }),
                ).toBeEnabled();

                await expect(
                    page.getByRole('checkbox', { name: 'No' }),
                ).toBeEnabled();


            },
        );
    },
);


