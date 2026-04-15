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

test.describe('Rules – Default when expression', () => {
    test('Checkbox default is applied when expression evaluates true', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'RulesDefaultWhenExpr';
        const screenTemplateGroup = 'Touch CM Activity';
        const defaultTemplate = 'Touch CM Activity - Default';
        const screenName = 'DefaultWheExpr';
        const screenTemplateCopyName = `${screenName}${Date.now()}`;
        const fieldText =
            'When outcome is "Completed" the default value should be chosen';
        const resp1 = 'Default';
        const resp2 = 'Not Default';
        const expression = "tuch_outcome_id = 'COMPLETED'";

        const { page } = await logIn({ loginID });

        //--------------------------------
        // Cleanup
        //--------------------------------
        await cleanupScreenTemplateCopy(page, {
            screenTemplateGroup,
            defaultTemplate,
            screenName,
            dontClose: true,
        });

        await cleanupScreenTemplateCopy(page, {
            screenTemplateGroup,
            defaultTemplate,
            screenName: 'Touch CM Activity - Default - Copy',
            onScreen: true,
            dontClose: true,
        });

        //--------------------------------
        // Create template copy
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
        // Act – Create checkbox field
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
                `[data-role="staticlist"] [role="option"]:has-text("Checkbox"):visible`,
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
                `[data-role="staticlist"] [role="option"]:has-text("Field (Lookup): Touch Focus")`,
            ),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        //--------------------------------
        // Configure field + responses
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
        // Act – Default when expression
        //--------------------------------
        await clickAndWait(
            page,
            page.getByText('Rules', { exact: true }),
        );

        await clickAndWait(
            page,
            page.getByText('Never default').first(),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', {
                    name: '​ Default when expression...',
                    exact: true,
                })
                .locator('span'),
        );

        await fillAndWait(
            page,
            page.locator('#flyout-textarea'),
            expression,
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Select', exact: true }),
        );

        await clickAndWait(
            page,
            page
                .locator('#default-rule-element')
                .getByText('Default', { exact: true }),
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

        //--------------------------------
        // Assert – Default not checked initially
        //--------------------------------
        await waitUntilLoaded(page);

        const defaultCheckbox = page.getByRole('checkbox', {
            name: 'Default',
            exact: true,
        });

        await expect(defaultCheckbox).not.toBeChecked();

        //--------------------------------
        // Act – Set Outcome to Completed
        //--------------------------------
        await clickAndWait(
            page,
            page
                .locator(
                    `[data-bind="attr: { data-table-code: fields.tuch_outcome_id.lookupTableCode, data-filter-code: fields.tuch_outcome_id.lookupFilterCode }"] [role="button"]`,
                )
                .first(),
        );

        await fillAndWait(
            page,
            page.locator('.input [name="tuch_outcome_id_input"]'),
            'Completed',
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: '​ Completed' })
                .locator('span'),
        );

        //--------------------------------
        // Assert – Default checked
        //--------------------------------
        await expect(defaultCheckbox).toBeChecked();


    });
});