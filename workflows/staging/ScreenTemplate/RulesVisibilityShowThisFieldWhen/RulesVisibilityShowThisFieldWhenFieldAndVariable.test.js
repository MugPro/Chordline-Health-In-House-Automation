


import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
    closeScreenTemplateModal,
    viewMemberCardTemplate,
} from '../../../../helpers/Node20Helpers.js';


const ACTION_PAUSE_MS = 600;

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
    'Rules – Visibility – Show this field when – Field and Variable',
    () => {

        test('Rules - Visibility - show this field when - field', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const screenTemplateGroup = 'Authorization - BH OBS';
            const defaultTemplate = 'Authorization - OBS - BH - Default';
            const screenName = `${defaultTemplate} - Copy`;

            const memberName = 'Abbott, QAWBrenda';
            const memberName2 = 'Bashirian, QAWIsabella';

            const ruleVariable = `Member's Age (yrs)`;
            const variableCondition = 'Is equal to';
            const variableConditionValue = '20';

            const rulledInputField = '* Observation Status:';
            const rulledDropdownItems = ['Admitted', 'Discharged'];

            const variableRule = 'Compliance Team';
            const templateType = 'BH Observation';
            const loginID = '398042';

            const { page } = await logIn({ loginID, slowMo: 750 });

            await cleanupScreenTemplateCopy(page, {
                screenName,
                screenTemplateGroup,
                defaultTemplate,
                dontClose: true,
            });

            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                screenName,
                onScreen: true,
                //dontClose: true,
            });


            //await waitUntilLoaded(page);

            //--------------------------------
            // Act – Configure visibility rule (Field based)
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('[role="menuitem"]:has-text("Tools")'),
            );

            await clickAndWait(
                page,
                page.getByText('Screen Templates').first(),
            );

            await clickAndWait(
                page,
                page.getByText(screenTemplateGroup),
            );

            await clickAndWait(
                page,
                page.getByRole('gridcell', { name: screenName }),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: '' }),
            );

            await clickAndWait(
                page,
                page.locator('#aush_inpatient_status_id_overlay'),
            );

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.locator('[aria-controls="rules-tab-content"]'),
            );

            await clickAndWait(
                page,
                page.locator('.is-hidden-rule [aria-label="select"] >> nth=0'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', {
                    name: '​ Show this field when...',
                }).locator('span'),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('combobox')
                    .filter({ hasText: 'Observation Status (this' })
                    .getByLabel('select'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: '​ Team' }).locator('span'),
            );

            await clickAndWait(
                page,
                page
                    .getByLabel('Rules')
                    .getByRole('button', { name: 'expand combobox' }),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('option', { name: `​ ${variableRule}` })
                    .locator('span'),
            );

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
            // Act – Select rule value & open ruled field
            //--------------------------------
            await fillAndWait(
                page,
                page.locator('.input [name="auth_team_reference_id_input"]'),
                variableRule,
                2000,
            );

            await clickAndWait(
                page,
                page.locator(':text("Compliance Team")'),
            );

            await clickAndWait(
                page,
                page.locator(
                    `[class*="formField"]:has-text("${rulledInputField}") >> nth=1 >> [aria-label="expand combobox"]`,
                ),
            );

            //--------------------------------
            // Assert – Field based rule
            //--------------------------------
            await expect(
                page.getByRole('option', { name: rulledDropdownItems[0] }),
            ).toBeVisible();

            await expect(
                page.getByRole('option', { name: rulledDropdownItems[1] }),
            ).toBeVisible();

            await expect(
                page
                    .getByLabel('Edit Screen - Internal', { exact: true })
                    .getByText(rulledInputField),
            ).toBeVisible();



            //--------------------------------
            // Arrange
            //--------------------------------
            // page is preserved from previous test via serial execution

            //--------------------------------
            // Act – Variable based rule
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Close' }),
            );

            await clickAndWait(
                page,
                page.locator('#aush_inpatient_status_id_overlay'),
            );

            await clickAndWait(
                page,
                page.getByText('Rules', { exact: true }),
            );

            await clickAndWait(
                page,
                page.locator('.is-hidden-rule [aria-label="select"] >> nth=0'),
            );

            await clickAndWait(
                page,
                page.locator('[type="radio"][value="systemfx"] >> nth=0'),
            );

            await clickAndWait(
                page,
                page.getByText('Select a variable...').first(),
            );

            await clickAndWait(
                page,
                page.locator(`li >> span:text("${ruleVariable}") >> nth=0`),
            );

            await clickAndWait(
                page,
                page.locator('.operator [aria-label="select"]').first(),
            );

            await clickAndWait(
                page,
                page.getByRole('option', {
                    name: `​ ${variableCondition}`,
                }),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('tabpanel', { name: 'Rules' })
                    .getByRole('spinbutton'),
            );

            await page.keyboard.type(variableConditionValue);

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Save' }),
            );

            await closeScreenTemplateModal(page);

            //--------------------------------
            // Activate template
            //--------------------------------
            await clickAndWait(
                page,
                page.locator(`[role="row"]:has(:text("${screenName}"))`),
            );

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.locator(
                    `[role="row"]:has(:text("${screenName}")) input`,
                ),
            );

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.getByText('Close', { exact: true }),
            );

            await waitUntilLoaded(page);

            //--------------------------------
            // Verify rule through real member
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByRole('tab', { name: 'Members' })
                    .locator('span'),
            );

            await waitUntilLoaded(page);

            // Click Age column filter icon
            await page.getByTitle('Age filter column settings').click({ force: true });


            await waitUntilLoaded(page);

// Get ONLY the visible Kendo popup
            const filterPopup = page
                .locator('.k-animation-container[aria-hidden="false"]')
                .last();

            await expect(filterPopup).toBeVisible();

// Scope to filter form
            const filterForm = filterPopup.locator('form.k-filter-menu');
            await expect(filterForm).toBeVisible();

// Fill filter value
            const valueInput = filterForm.locator('input[title="Value"]');
            await expect(valueInput).toBeVisible();
            await valueInput.fill(variableConditionValue);

// Apply filter
            await filterForm.locator('button[title="Filter"]').click();

            await waitUntilLoaded(page);

            await page
                .getByRole('gridcell', { name: memberName })
                .dblclick();

            await clickAndWait(
                page,
                page.getByText('Home', { exact: true }),
            );

            await clickAndWait(
                page,
                page.locator('button[data-field="age"]'),
            );

            await fillAndWait(
                page,
                page.getByRole('textbox', { name: 'Search...' }),
                memberName2,
            );

            await page.keyboard.press('Enter');

            await page
                .getByRole('gridcell', { name: memberName2 })
                .first()
                .dblclick();

            await clickAndWait(
                page,
                page
                    .getByLabel(memberName2)
                    .getByText('Authorizations')
                    .first(),
            );

            await clickAndWait(
                page,
                page
                    .getByRole('button')
                    .filter({ hasText: 'Authorization Inpatient' }),
            );

            await clickAndWait(
                page,
                page.getByText('BH Observation', { exact: true }).last(),
            );

            //--------------------------------
            // Assert – Variable rule
            //--------------------------------
            await expect(
                page.getByText('Observation Status:', { exact: true }),
            ).not.toBeVisible();

            await viewMemberCardTemplate(page, {
                memberName,
                memberName2,
                templateType,
            });

            await expect(
                page.getByText('Observation Status:', { exact: true }),
            ).toBeVisible();


        });
    },
);
