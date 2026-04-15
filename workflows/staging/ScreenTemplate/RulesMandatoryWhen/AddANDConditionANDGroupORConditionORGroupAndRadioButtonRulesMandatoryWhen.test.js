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

const fillAndWait = async (page, locator, value, ms = ACTION_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

/* -------------------------------------------
   Shared state across tests
------------------------------------------- */
let page;
let saveCheckboxElement;
let closeButton;

let screenTemplateGroup;
let defaultTemplate;
let screenName;
let prefix;
let isEqualTo;
let andCondition;
let isEqualCondition;

test.describe(
    'Rules – Mandatory When – AND / OR conditions, groups, and radios',
    () => {

        test('Initial Mandatory when rule', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = 'MandatoryWhen';
            screenTemplateGroup = 'Authorization Bed Day - BH IP';
            defaultTemplate =
                'Authorization Bed Day - IP - BH - Default';
            screenName = `${defaultTemplate} - Copy`;
            prefix = 'MandatoryWhen';
            const customScreenName = `${prefix}${Date.now()}`;
            const mandatoryWhen = 'Service Request Type';
            isEqualTo = 'PTS-Expedited';
            andCondition = 'Request Type';
            isEqualCondition = 'Code';

            ({ page } = await logIn({ loginID }));

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

            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                screenName,
                customScreenName,
                onScreen: true,
            });

            //--------------------------------
            // Act – Configure Mandatory When
            //--------------------------------
            await clickAndWait(page, page.getByText('Tools'));
            await clickAndWait(page, page.getByText('Screen Templates'));

            await clickAndWait(
                page,
                page
                    .getByRole('treeitem', {
                        name: screenTemplateGroup,
                    })
                    .locator('span')
                    .nth(1),
            );

            await clickAndWait(
                page,
                page.getByRole('gridcell', {
                    name: customScreenName,
                }),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: '' }),
            );

            await clickAndWait(
                page,
                page.locator('#auli_send_date_overlay'),
            );

            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByText('Rules'));

            await clickAndWait(
                page,
                page.getByText('Never mandatory').first(),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', {
                        name: 'Mandatory when...',
                        exact: true,
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
                    .getByRole('option', {
                        name: mandatoryWhen,
                    })
                    .locator('span'),
            );

            await clickAndWait(
                page,
                page
                    .getByLabel('Rules')
                    .getByRole('button', {
                        name: 'expand combobox',
                    }),
            );

            await clickAndWait(page, page.getByText(isEqualTo));

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({
                        hasText:
                            'Show this field when...Always',
                    })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', {
                        name: 'Always show this field',
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

            saveCheckboxElement = page.locator(
                `[class*="left flex-container-row"]:has(:text("Send Date"))`,
            );

            closeButton = page
                .getByLabel('Edit Screen - Internal (')
                .getByRole('button', { name: '', exact: true })
                .first();

            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – Mandatory toggles correctly
            //--------------------------------
            await clickAndWait(page, closeButton);

            await clickAndWait(
                page,
                page
                    .getByRole('dialog', {
                        name: 'Edit Screen - Internal (',
                    })
                    .locator(
                        'input[name="auli_service_request_type_input"]',
                    ),
            );

            await page.keyboard.type(isEqualTo);
            await clickAndWait(page, page.getByText(isEqualTo));

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).toBeVisible();

            await clickAndWait(page, closeButton);

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).not.toBeVisible();


            //--------------------------------
            // Add AND condition
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByRole('dialog', {
                        name: 'Edit Screen - Internal (',
                    })
                    .getByLabel('Close'),
            );

            //--------------------------------
            // Act
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('#auli_send_date_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Condition' }),
            );

            await clickAndWait(
                page,
                page
                    .getByLabel('Rules')
                    .getByText('Select a field...')
                    .nth(1),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', {
                        name: andCondition,
                    })
                    .locator('span')
                    .last(),
            );

            await clickAndWait(
                page,
                page.locator(
                    `[data-bind="visible: valueIsValidResponse"] :visible >> :text("Select")`,
                ),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', {
                        name: isEqualCondition,
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

            await clickAndWait(page, closeButton);

            await clickAndWait(
                page,
                page
                    .getByRole('dialog', {
                        name: 'Edit Screen - Internal (',
                    })
                    .locator(
                        'input[name="auli_service_request_type_input"]',
                    ),
            );

            await page.keyboard.type(isEqualTo);
            await clickAndWait(page, page.getByText(isEqualTo));

            await clickAndWait(
                page,
                page
                    .getByLabel('Edit Screen - Internal (')
                    .getByText(isEqualCondition, {
                        exact: true,
                    }),
            );

            //--------------------------------
            // Assert
            //--------------------------------
            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).toBeVisible();

            await clickAndWait(page, closeButton);

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).not.toBeVisible();


            //--------------------------------
            // Add OR condition
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByRole('dialog', {
                        name: 'Edit Screen - Internal (',
                    })
                    .getByLabel('Close'),
            );

            //--------------------------------
            // Act
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('#auli_send_date_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({ hasText: 'andandor' })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: 'or' }),
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
            // Assert
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('radio', { name: 'Code' }),
            );

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).toBeVisible();

            await clickAndWait(
                page,
                page.getByRole('radio', {
                    name: 'Bed Day',
                    exact: true,
                }),
            );

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).not.toBeVisible();


            //--------------------------------
            // Add OR group
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByRole('dialog', {
                        name: 'Edit Screen - Internal (',
                    })
                    .getByLabel('Close'),
            );

            //--------------------------------
            // Act
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('#auli_send_date_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Group' }),
            );

            await clickAndWait(
                page,
                page
                    .locator('#condition96')
                    .getByRole('button', { name: 'select' }),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: 'Discharged' })
                    .locator('span'),
            );

            await clickAndWait(
                page,
                page
                    .locator('#condition96')
                    .getByText('Select...'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: 'Yes' })
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
            // Assert
            //--------------------------------
            await clickAndWait(
                page,
                page.locator(
                    '#auli_discharged\\.Yes[type="radio"]',
                ),
            );

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).toBeVisible();

            await clickAndWait(
                page,
                page.locator(
                    '#auli_discharged\\.No[type="radio"]',
                ),
            );

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).not.toBeVisible();


            //--------------------------------
            // Add AND group
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByRole('dialog', {
                        name: 'Edit Screen - Internal (',
                    })
                    .getByLabel('Close'),
            );

            //--------------------------------
            // Act
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('#auli_send_date_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            await clickAndWait(
                page,
                page
                    .locator('.groupLogic [role="button"]')
                    .first(),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: 'and' })
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
            // Assert
            //--------------------------------
            await clickAndWait(page, closeButton);


            /*
            await clickAndWait(
                page,
                page.locator(
                    'input[name="auli_service_request_type_input"]',
                ),
            );

             */


            await clickAndWait(
                page,
                page
                    .getByRole('dialog', {
                        name: 'Edit Screen - Internal (',
                    })
                    .locator(
                        'input[name="auli_service_request_type_input"]',
                    ),
            );








            await page.keyboard.type(isEqualTo);
            await clickAndWait(page, page.getByText(isEqualTo));

            await clickAndWait(
                page,
                page.locator(
                    '#auli_discharged\\.Yes[type="radio"]',
                ),
            );

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).toBeVisible();

            /*
            await clickAndWait(
                page,
                page.getByText('No', { exact: true }),
            );

             */


            await clickAndWait(
                page,
                page.locator('#auli_discharged\\.No[type="radio"]'),
            );

            await expect(
                saveCheckboxElement.locator(
                    '[class*="required-asterisk"]',
                ),
            ).not.toBeVisible();



        });
    },
);