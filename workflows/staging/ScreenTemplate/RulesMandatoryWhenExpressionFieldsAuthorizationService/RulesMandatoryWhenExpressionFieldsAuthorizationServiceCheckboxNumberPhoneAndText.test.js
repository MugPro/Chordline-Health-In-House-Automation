import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Helpers
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
   Shared State
------------------------------------------- */
let page;
let screenTemplateGroup;
let defaultTemplate;

const getTeamCombobox = (page) =>
    page.locator(
        `[id="record-splitter"] [class*="formField"]:has-text("Team") >> [aria-label*="combobox"]`,
    );

const clearTeamSelection = async (page) => {
    await clickAndWait(
        page,
        page
            .locator(
                `[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [role="button"]`,
            )
            .first(),
    );
};

const createMandatoryExpressionRule = async (
    page,
    conditionValue,
    screenTemplateGroup,
) => {
    await clickAndWait(
        page,
        page.locator('[aria-controls="mandatory-when_listbox"]').first(),
    );

    await clickAndWait(
        page,
        page
            .getByRole('option', { name: '​ Mandatory when expression...' })
            .locator('span'),
    );

    await clickAndWait(
        page,
        page
            .locator('span')
            .filter({ hasText: `Fields (${screenTemplateGroup})` }),
    );

    await fillAndWait(
        page,
        page
            .getByRole('dialog', {
                name: '​ Set Mandatory Condition for',
            })
            .getByPlaceholder('Search...'),
        'team',
    );

    await page.keyboard.press('Enter');

    await clickAndWait(page, page.getByText('(auth_team_reference_id)'));

    await clickAndWait(
        page,
        page.getByRole('button', { name: 'Use Field (Code)' }),
    );

    await page.keyboard.press('=');

    await clickAndWait(
        page,
        page
            .getByRole('dialog', {
                name: '​ Set Mandatory Condition for',
            })
            .getByLabel('expand combobox'),
    );

    await clickAndWait(page, page.getByText(conditionValue));

    await clickAndWait(
        page,
        page.getByRole('button', { name: 'Insert Code Value' }),
    );

    await clickAndWait(
        page,
        page.getByRole('button', { name: 'Select', exact: true }),
    );

    await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
};

/* -------------------------------------------
   Test Suite
------------------------------------------- */
test.describe(
    'Rules – Mandatory when expression – Authorization Service (Checkbox, Number, Text, Phone)',
    () => {

        test('Checkbox – Mandatory when expression', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = '12345';
            screenTemplateGroup = 'Authorization - BH OP';
            defaultTemplate = 'Authorization - OP- BH - Default';
            const screenName = `${defaultTemplate} - Copy`;
            const prefix = 'ManExFiCh';
            const customScreenName = `${prefix}${Date.now()}`;

            const checkboxOption1 = 'yes';
            const conditionValue = 'Case Team';
            const mandatoryCheckbox = 'Checkbox:';

            ({ page } = await logIn({ loginID }));

            await waitUntilLoaded(page);

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
            // Act – Navigate
            //--------------------------------
            await waitUntilLoaded(page);
            await clickAndWait(page, page.getByText('Tools'));
            await clickAndWait(page, page.getByText('Screen Templates').first());
            await clickAndWait(page, page.getByText(screenTemplateGroup));
            await page
                .getByRole('gridcell', { name: customScreenName })
                .dblclick();

            await waitUntilLoaded(page);

            //--------------------------------
            // Act – Add Checkbox
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Field' }).first(),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({
                        hasText: 'Radio ButtonRadio ButtonDrop',
                    })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: '​  Checkbox' })
                    .locator('div'),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Add', exact: true }),
            );

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Valid Response' }),
            );
            await page.keyboard.type(checkboxOption1);
            await page.keyboard.press('Enter');

            //--------------------------------
            // Mandatory rule
            //--------------------------------
            await clickAndWait(page, page.locator('[data-identity="0"]'));
            await clickAndWait(
                page,
                page.locator('[role="tab"] :text("Rules")'),
            );

            await createMandatoryExpressionRule(
                page,
                conditionValue,
                screenTemplateGroup,
            );

            //--------------------------------
            // Assert
            //--------------------------------
            await waitUntilLoaded(page);
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, getTeamCombobox(page));
            await clickAndWait(page, page.getByText(conditionValue));

            const checkboxLabel = page.locator(
                `[class*="left flex-container-row"]:has(:text("${mandatoryCheckbox}"))`,
            );

            await expect(
                checkboxLabel.locator('[class*="required-asterisk"]'),
            ).toBeVisible();

            await clearTeamSelection(page);

            await expect(
                checkboxLabel.locator('[class*="required-asterisk"]'),
            ).toBeHidden();

            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));



            //Number – Mandatory when expression

            const conditionValue2 = 'Compliance Team';
            const mandatoryNumber = 'Number:';

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Field' }).first(),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({ hasText: 'Radio ButtonRadio ButtonDrop' })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: '  Number' }).locator('div'),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Add', exact: true }),
            );

            await clickAndWait(
                page,
                page.locator('[role="tab"] :text("Rules")'),
            );

            await createMandatoryExpressionRule(
                page,
                conditionValue2,
                screenTemplateGroup,
            );

            await waitUntilLoaded(page);
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, getTeamCombobox(page));
            await clickAndWait(page, page.getByText(conditionValue2));

            const numberLabel = page.locator(
                `[class*="left flex-container-row"]:has(:text("${mandatoryNumber}"))`,
            );

            await expect(
                numberLabel.locator('[class*="required-asterisk"]'),
            ).toBeVisible();

            await clearTeamSelection(page);

            await expect(
                numberLabel.locator('[class*="required-asterisk"]'),
            ).toBeHidden();

            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));



            //Text – Mandatory when expression
            const conditionValue3 = 'MD Team';
            const mandatoryText = 'Text:';

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Field' }).first(),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({ hasText: 'Radio ButtonRadio ButtonDrop' })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: '​  Text' }).locator('div'),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Add', exact: true }),
            );

            await clickAndWait(
                page,
                page.locator('[role="tab"] :text("Rules")'),
            );

            await createMandatoryExpressionRule(
                page,
                conditionValue3,
                screenTemplateGroup,
            );

            await waitUntilLoaded(page);
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, getTeamCombobox(page));
            await clickAndWait(page, page.getByText(conditionValue3));

            const textLabel = page.locator(
                `[class*="left flex-container-row"]:has(:text("${mandatoryText}"))`,
            );

            await expect(
                textLabel.locator('[class*="required-asterisk"]'),
            ).toBeVisible();

            await clearTeamSelection(page);

            await expect(
                textLabel.locator('[class*="required-asterisk"]'),
            ).toBeHidden();

            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));




            //Phone – Mandatory when expression & Cleanup
            const conditionValue4 = 'Review Team';
            const mandatoryPhone = 'Phone:';

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Field' }).first(),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({ hasText: 'Radio ButtonRadio ButtonDrop' })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: '  Phone' })
                    .locator('div')
                    .last(),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Add', exact: true }),
            );

            await clickAndWait(
                page,
                page.locator('[role="tab"] :text("Rules")'),
            );

            await createMandatoryExpressionRule(
                page,
                conditionValue4,
                screenTemplateGroup,
            );

            await waitUntilLoaded(page);
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, getTeamCombobox(page));
            await clickAndWait(page, page.getByText(conditionValue4));

            const phoneLabel = page.locator(
                `[class*="left flex-container-row"]:has(:text("${mandatoryPhone}"))`,
            );

            await expect(
                phoneLabel.locator('[class*="required-asterisk"]'),
            ).toBeVisible();

            await clearTeamSelection(page);

            await expect(
                phoneLabel.locator('[class*="required-asterisk"]'),
            ).toBeHidden();


        });
    },
);