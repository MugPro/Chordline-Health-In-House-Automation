import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
    closeScreenTemplateModal,
} from '../../../../helpers/Node20Helpers.js';

const ACTION_PAUSE_MS = 300;

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
    'Rules - Visibility - Hide this field when (Field + Variable)',
    () => {
        test(
            'Hides Reviewer field based on Team field and Member Age variable',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const screenTemplateGroup = 'Authorization - BH IP';
                const defaultTemplate = 'Authorization - IP - BH - Default';
                const screenName = `${defaultTemplate} - Copy`;
                const memberName = 'Abbott, QAWBrenda';
                const team = 'Compliance Team';
                const ruleVariable = "Member's Age (yrs)";
                const variableCondition = 'Is equal to';
                const variableConditionValue = '20';
                const loginID = 'RulesVisiblity';

                const { page } = await logIn({ loginID });
                await waitUntilLoaded(page);

                //--------------------------------
                // Cleanup existing copy
                //--------------------------------
                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                });

                //--------------------------------
                // Copy default template
                //--------------------------------
                await copyDefaultScreenTemplate(page, {
                    defaultTemplate,
                    screenTemplateGroup,
                    screenName,
                });

                //--------------------------------
                // Act – Open copied template
                //--------------------------------
                await clickAndWait(page, page.getByText('Tools'));
                await clickAndWait(page, page.getByText('Screen Templates').first());

                await clickAndWait(
                    page,
                    page.getByRole('gridcell', { name: screenName }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: '' }),
                );

                //--------------------------------
                // Field-based visibility rule (Team)
                //--------------------------------
                await clickAndWait(
                    page,
                    page.locator('[data-table-code="USER"]').nth(0),
                );

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="rules-tab-content"]'),
                );

                    await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByText('Rules', { exact: true }),
                );

                await clickAndWait(
                    page,
                    page.locator('.is-hidden-rule [aria-label="select"]').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', { name: '​ Hide this field when...' })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('combobox')
                        .filter({
                            hasText:
                                'Reviewer (this question)Select a field...',
                        })
                        .getByLabel('select'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', { name: '​ Team' })
                        .locator('span'),
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
                        .getByRole('option', { name: `​ ${team}` })
                        .locator('span'),
                );

                //--------------------------------
                // Preview – Team rule
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
                // Assert – Reviewer hidden by Team rule
                //--------------------------------
                await expect(
                    page
                        .getByLabel('Edit Screen - Internal (')
                        .locator('#record-div div')
                        .filter({ hasText: 'Summary * Team: 1 * Reviewer' })
                        .getByLabel('expand combobox')
                        .nth(1),
                ).not.toBeVisible();

                //--------------------------------
                // Variable-based visibility rule (Member Age)
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                await clickAndWait(
                    page,
                    page
                        .locator('[class*="formField"]:has-text("Reviewer")')
                        .first(),
                );

                await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByText('Rules', { exact: true }),
                );

                await clickAndWait(
                    page,
                    page.locator('[type="radio"][value="systemfx"]').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .locator('#condition13')
                        .getByRole('button', { name: 'select' }),
                );

                await clickAndWait(
                    page,
                    page.locator(`li >> span:text("${ruleVariable}")`).nth(1),
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

                await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                await waitUntilLoaded(page);

                await closeScreenTemplateModal(page);

                await waitUntilLoaded(page);

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



                    await clickAndWait(
                    page,
                    page.getByRole('gridcell', { name: memberName }),
                );


                await page.getByRole('gridcell', { name: memberName }).dblclick();


                await page.getByText('AuthorizationsAuthorizations').click();

                await waitUntilLoaded(page);



                await clickAndWait(
                    page,
                    page
                        .getByRole('button')
                        .filter({ hasText: 'Authorization Inpatient' }),
                );

                await clickAndWait(
                    page,
                    page.getByText('BH Inpatient', { exact: true }),
                );


                await waitUntilLoaded(page);



                //--------------------------------
                // Assert – Reviewer hidden by variable rule
                //--------------------------------
                await expect(
                    page
                        .getByLabel('Edit Screen - Internal (')
                        .locator('#record-div div')
                        .filter({ hasText: 'Summary * Team: 1 * Reviewer' })
                        .getByLabel('expand combobox')
                        .nth(1),
                ).not.toBeVisible();

                await expect(
                    page.locator(
                        '[id="authorizations"] >> :above(:text("Auth TAT Due:")) :text-is("Reviewer")',
                    ),
                ).not.toBeVisible();


            },
        );
    },
);