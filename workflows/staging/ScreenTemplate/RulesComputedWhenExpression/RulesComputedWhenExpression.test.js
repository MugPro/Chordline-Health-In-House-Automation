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

test.describe('Rules – Computed When Expression', () => {
    test('Number field is computed when expression evaluates true', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'ComputedWhen';
        const screenTemplateGroup = 'Authorization - IP';
        const defaultTemplate = `${screenTemplateGroup} - Default`;
        const screenName = `${defaultTemplate} - Copy`;
        const teamOption = 'Review Team';
        const computedValue = '0.01';

        const { page } = await logIn({ loginID });

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
        await clickAndWait(page, page.getByText(screenTemplateGroup).first());

        await clickAndWait(
            page,
            page.getByRole('gridcell', { name: screenName }),
        );

        //--------------------------------
        // Act – Add Number field
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
                .filter({ hasText: 'Radio ButtonRadio ButtonDrop' })
                .getByLabel('select'),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: '​  Number' })
                .locator('div'),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        //--------------------------------
        // Act – Configure Computed When expression
        //--------------------------------
        await clickAndWait(page, page.getByText('Rules'));

        await clickAndWait(
            page,
            page
                .getByRole('combobox')
                .filter({ hasText: 'Never computedNever' })
                .getByLabel('select'),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', {
                    name: '​ Computed when expression...',
                })
                .locator('span'),
        );

        await clickAndWait(
            page,
            page.getByText(`(${screenTemplateGroup})`),
        );

        await clickAndWait(
            page,
            page.getByText('Team (auth_team_reference_id)'),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Use Field' }),
        );

        await page.keyboard.type('= ');

        await clickAndWait(
            page,
            page
                .getByRole('dialog', {
                    name: '​ Set Computed Condition for',
                })
                .getByLabel('expand combobox'),
        );

        await clickAndWait(page, page.getByText(teamOption));

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Insert Code Value' }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Select', exact: true }),
        );

        await clickAndWait(
            page,
            page
                .getByLabel('Rules')
                .getByRole('button', { name: 'Increase value' }),
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
            page.getByRole('button', { name: 'Preview' }),
        );

        //--------------------------------
        // Assert – Field not computed initially
        //--------------------------------
        const numberInput = page
            .locator('input[class*="numeric-textbox-with-spinner"]', {
                rightOf: page.getByText('Number:'),
            })
            .last();

        await expect(numberInput).toHaveValue('');

        //--------------------------------
        // Act – Select Team
        //--------------------------------
        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.locator(
                `[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`,
            ),
        );

        await clickAndWait(page, page.getByText(teamOption));

        //--------------------------------
        // Assert – Number computed
        //--------------------------------
        await expect(numberInput).toHaveValue(computedValue);



    });
});