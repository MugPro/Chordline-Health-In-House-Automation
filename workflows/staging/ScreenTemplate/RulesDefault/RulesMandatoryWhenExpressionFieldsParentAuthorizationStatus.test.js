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

test.describe(
    'Rules – Mandatory When Expression (Fields Parent Authorization Status)',
    () => {
        test(
            'Checkbox becomes mandatory when parent Authorization Status is Closed',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = '12345';
                const screenTemplateGroup = 'Authorization - BH RF';
                const defaultTemplate =
                    'Authorization - RF - BH - Default';
                const screenName = `${defaultTemplate} - Copy`;
                const checkboxOption1 = 'yes';
                const mandatoryCheckbox = 'Checkbox:';

                //const { page } = await logIn({ loginID });

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;





                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url });



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
                // Act – Navigate to copied screen
                //--------------------------------
                await clickAndWait(page, page.getByText('Tools'));
                await clickAndWait(page, page.getByText('Screen Templates'));
                await clickAndWait(
                    page,
                    page.getByText(screenTemplateGroup),
                );

                await clickAndWait(
                    page,
                    page.getByRole('gridcell', { name: screenName }),
                );

                //--------------------------------
                // Act – Add Checkbox field
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: '' }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Field' }).first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('combobox')
                        .filter({
                            hasText:
                                'Radio ButtonRadio ButtonDrop',
                        })
                        .getByLabel('select'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: '​  Checkbox',
                        })
                        .locator('div'),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: 'Add',
                        exact: true,
                    }),
                );

                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Add valid response
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: ' Valid Response',
                    }),
                );

                await page.keyboard.type(checkboxOption1);
                await page.keyboard.press('Enter');

                //--------------------------------
                // Act – Configure Mandatory When expression
                //--------------------------------
                await clickAndWait(
                    page,
                    page.locator('[data-identity="0"]'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        '[role="tab"] :text("Rules")',
                    ),
                );

                await clickAndWait(
                    page,
                    page
                        .locator(
                            '[aria-controls="mandatory-when_listbox"]',
                        )
                        .first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name:
                                '​ Mandatory when expression...',
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page
                        .locator('span')
                        .filter({
                            hasText: `Fields (${screenTemplateGroup})`,
                        }),
                );

                await clickAndWait(
                    page,
                    page.getByText(
                        'Referral Status (aush_status_id)',
                    ),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: 'Use Field',
                    }),
                );

                await page.keyboard.type('= ');

                await clickAndWait(
                    page,
                    page
                        .getByRole('dialog', {
                            name:
                                '​ Set Mandatory Condition for',
                        })
                        .getByLabel('expand combobox'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: '​ Closed',
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: 'Insert Code Value',
                    }),
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
                    page.getByRole('button', { name: 'Save' }),
                );

                //--------------------------------
                // Act – Preview screen
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', {
                        name: 'Preview',
                    }),
                );

                const saveCheckboxElement = page.locator(
                    `[class*="left flex-container-row"]:has(:text("${mandatoryCheckbox}"))`,
                );

                await waitUntilLoaded(page);

                //--------------------------------
                // Assert – Not mandatory initially
                //--------------------------------
                await expect(
                    saveCheckboxElement.locator(
                        '[class*="required-asterisk"]',
                    ),
                ).not.toBeVisible();

                //--------------------------------
                // Act – Change Authorization Status to Closed
                //--------------------------------
                await clickAndWait(
                    page,
                    page
                        .getByLabel('Edit Screen - Internal (')
                        .getByRole('button', {
                            name: '',
                            exact: true,
                        }),
                );

                await clickAndWait(
                    page,
                    page
                        .locator('span')
                        .filter({ hasText: /^4$/ })
                        .getByLabel('expand combobox'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: '​ Closed',
                        })
                        .locator('span'),
                );

                //--------------------------------
                // Assert – Field becomes mandatory
                //--------------------------------
                await expect(
                    saveCheckboxElement.locator(
                        '[class*="required-asterisk"]',
                    ),
                ).toBeVisible();

            },
        );
    },
);
