/*

import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';


const ACTION_PAUSE_MS = 400;

const pause = (page, ms = ACTION_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (
    page,
    locator,
    options = {},
    ms = ACTION_PAUSE_MS,
) => {
    await locator.click(options);
    await pause(page, ms);
};

const fillAndWait = async (
    page,
    locator,
    value,
    ms = ACTION_PAUSE_MS,
) => {
    await locator.fill(value);
    await pause(page, ms);
};

test(
    'Rules - Mandatory when expression - Operators - Equals, Less Than, Logical OR, Logical AND',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        // Set constants
        const screenTemplateGroup = `Authorization - RF`;
        const defaultTemplate = `${screenTemplateGroup} - Default`;
        const screenName = `${defaultTemplate} - Copy`;
        const prefix = `ManExprOpEC`;
        const customScreenName = `${prefix}${Date.now()}`;
        const loginID = `OperatorsEquals`;
        const inputValue = `3.00`;
        const lessThenValue = `4.00`;
        const mandatoryText = "Checkbox:";
        const checkboxOption1 = `yes`;

        const { page } = await logIn({ loginID });

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
            onScreen: true,
            dontClose: true,
        });

        await copyDefaultScreenTemplate(page, {
            defaultTemplate,
            screenTemplateGroup,
            screenName: customScreenName,
            onScreen: true,
            dontClose: true,
        });

        await waitUntilLoaded(page);


        // Click OK on the validation popup
        await page.getByRole('button', { name: 'OK' }).click();

// Now fill Screen Name
        await page.getByRole('textbox', { name: 'Screen Name:' })
            .fill(customScreenName);

// Save
        await page.getByRole('button', { name: 'Save' }).click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Create Number field
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Field' }).first());
        await clickAndWait(
            page,
            page
                .getByRole('combobox')
                .filter({ hasText: 'Radio ButtonRadio ButtonDrop' })
                .getByLabel('select'),
        );
        await clickAndWait(
            page,
            page.getByRole('option', { name: '​  Number' }).locator('div'),
        );
        await clickAndWait(page, page.getByRole('button', { name: 'Add', exact: true }));
        await clickAndWait(page, page.getByRole('button', { name: 'Save' }));

        await waitUntilLoaded(page);

        // Overlay-safe click
        await clickAndWait(
            page,
            page.locator('[data-type="Number"]').last(),
            { force: true },
        );

        const fieldId = await page.locator('.promptKey').inputValue();

        //--------------------------------
        // Create Checkbox field
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Field' }).first());
        await clickAndWait(
            page,
            page
                .getByRole('combobox')
                .filter({ hasText: 'Radio ButtonRadio ButtonDrop' })
                .getByLabel('select'),
        );
        await clickAndWait(
            page,
            page.getByRole('option', { name: '​  Checkbox' }).locator('div'),
        );
        await clickAndWait(page, page.getByRole('button', { name: 'Add', exact: true }));

        await waitUntilLoaded(page);

        await clickAndWait(page, page.getByRole('button', { name: ' Valid Response' }));
        await page.keyboard.type(checkboxOption1);
        await page.keyboard.press('Enter');

        const saveTextElement = page.locator(
            `[class*="left flex-container-row"]:has(:text("${mandatoryText}"))`,
        );

        //--------------------------------
        // RULE 1: Equals
        //--------------------------------
        await clickAndWait(page, page.getByText('Rules'));
        await clickAndWait(page, page.locator('[aria-controls="mandatory-when_listbox"]').first());
        await clickAndWait(
            page,
            page.getByRole('option', { name: '​ Mandatory when expression...' }).locator('span'),
        );
        await clickAndWait(
            page,
            page.locator('span').filter({ hasText: `Fields (${screenTemplateGroup})` }),
        );
        await fillAndWait(page, page.locator('#flyout-textarea'), fieldId);



            await clickAndWait(
                page,
                page.locator('.rule-field', { hasText: 'Operators' }),
            );
        await clickAndWait(
            page,
            page.locator('.rule-field', { hasText: 'Equals' }),
        );

        await clickAndWait(page, page.getByRole('button', { name: 'Use Operator' }));

        await page.keyboard.type(inputValue);
        await clickAndWait(page, page.getByRole('button', { name: 'Select', exact: true }));
        await clickAndWait(page, page.getByRole('button', { name: 'Save' }));

            await waitUntilLoaded(page);

        await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
        await waitUntilLoaded(page);

        //await fillAndWait(page, page.getByRole('spinbutton'), inputValue);

        //await page.locator('.k-numerictextbox.k-input.numeric-textbox-with-spinner.editfield.k-input-outline.k-hover > input').first().click();





        const previewDialog = page.getByRole('dialog', {
            name: 'New Screen - Internal (',
        });

        await expect(previewDialog).toBeVisible();

        const numberInput = previewDialog.getByRole('spinbutton');

        await numberInput.fill(inputValue);

        await expect(
            previewDialog.getByText('Checkbox:', { exact: true })
        ).toBeVisible();

        await expect(
            previewDialog.getByRole('checkbox', { name: 'yes' })
        ).toBeVisible();





        //--------------------------------
        // RULE 2: Less Than
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Close' }));
        await clickAndWait(page, page.locator(':text("Checkbox:")').first(), { force: true });
        await clickAndWait(page, page.getByText('Rules'));
        await clickAndWait(page, page.getByRole('button', { name: '' }));
        await clickAndWait(page, page.getByRole('button', { name: 'Clear Expression' }));

        await fillAndWait(page, page.locator('#flyout-textarea'), fieldId);

            await clickAndWait(
                page,
                page.locator('.rule-field', { hasText: 'Operators' }),
            );
        //await clickAndWait(page, page.getByText('Less than'));
            await clickAndWait(
                page,
                page.getByText('Less than', { exact: true })
            );
        await clickAndWait(page, page.getByRole('button', { name: 'Use Operator' }));

        await page.keyboard.type(lessThenValue);
        await clickAndWait(page, page.getByRole('button', { name: 'Select', exact: true }));
        await clickAndWait(page, page.getByRole('button', { name: 'Save' }));

        //--------------------------------
        // RULE 3: Logical OR
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
        await waitUntilLoaded(page);

        //await fillAndWait(page, page.getByRole('spinbutton'), lessThenValue);

        await fillAndWait(
            page,
            previewDialog.getByRole('spinbutton').first(),
            lessThenValue
        );


        await expect(
            saveTextElement.locator('[class*="required-asterisk"]'),
        ).toBeVisible();

        await page.keyboard.press('Backspace');
        await page.keyboard.press('Enter');

        await expect(
            saveTextElement.locator('[class*="required-asterisk"]'),
        ).not.toBeVisible();

        await clickAndWait(
            page,
            page
                .locator(
                    '[id="record-splitter"] [class*="formField"]:has-text("Team") >> [aria-label*="combobox"]',
                ),
        );
        await clickAndWait(page, page.getByText('Case Team'));

        await expect(
            saveTextElement.locator('[class*="required-asterisk"]'),
        ).toBeVisible();

        //--------------------------------
        // RULE 4: Logical AND
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Close' }));
        await waitUntilLoaded(page);

        await clickAndWait(page, page.locator(':text("Checkbox:")').first(), { force: true });
        await clickAndWait(page, page.getByText('Rules'));
        await clickAndWait(page, page.getByRole('button', { name: '' }));
        await clickAndWait(page, page.getByRole('button', { name: 'Clear Expression' }));

        await fillAndWait(page, page.locator('#flyout-textarea'), fieldId);
        await page.keyboard.type(`= ${lessThenValue} `);

            await clickAndWait(
                page,
                page.locator('.rule-field', { hasText: 'Operators' }),
            );
        await clickAndWait(page, page.getByText('Logical And'));
        await clickAndWait(page, page.getByRole('button', { name: 'Use Operator' }));

        await fillAndWait(page, page.getByPlaceholder('Search...'), 'team');
        await clickAndWait(page, page.locator('#search-value-button'));
        await clickAndWait(page, page.getByText('(auth_team_reference_id)'));
        await clickAndWait(page, page.getByRole('button', { name: 'Use Field (Code)' }));

        await page.keyboard.type(' = ');
        await clickAndWait(page, page.getByText('Case Team'));
        await clickAndWait(page, page.getByRole('button', { name: 'Insert Code Value' }));
        await clickAndWait(page, page.getByRole('button', { name: 'Select', exact: true }));
        await clickAndWait(page, page.getByRole('button', { name: 'Save' }));

        await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
        await waitUntilLoaded(page);

        await fillAndWait(page, page.getByRole('spinbutton'), lessThenValue);

        await expect(
            saveTextElement.locator('[class*="required-asterisk"]'),
        ).not.toBeVisible();

        await clickAndWait(
            page,
            page
                .locator(
                    '[id="record-splitter"] [class*="formField"]:has-text("Team") >> [aria-label*="combobox"]',
                ),
        );
        await clickAndWait(page, page.getByText('Case Team'));

        await expect(
            saveTextElement.locator('[class*="required-asterisk"]'),
        ).toBeVisible();

    },
);


 */



















import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Helpers
------------------------------------------- */
const ACTION_PAUSE_MS = 350;

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
let saveTextElement;
let customScreenName;

/* -------------------------------------------
   Test Suite
------------------------------------------- */
test.describe(
    'Rules – Mandatory when expression – Operators (Equals, Less Than, Logical AND / OR)',
    () => {

        test(
            'Rules – Mandatory when expression – Equals + Less Than + Logical AND + Logical OR',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const screenTemplateGroup = 'Authorization - RF';
                const defaultTemplate = `${screenTemplateGroup} - Default`;
                const screenName = `${defaultTemplate} - Copy`;
                const prefix = 'MandExprOpEq';
                customScreenName = `${prefix}${Date.now()}`;

                const loginID = 'OperatorsEquals';
                const inputValue = '3.00';
                const lessThanValue = '4.00';
                const mandatoryText = 'Checkbox:';
                const checkboxOption1 = 'yes';

               // ({ page } = await logIn({ loginID }));

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;





                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url });



                /* Clean up existing copies */
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
                    onScreen: true,
                    dontClose: true,
                });

                /* Create new screen template copy */
                await copyDefaultScreenTemplate(page, {
                    defaultTemplate,
                    screenTemplateGroup,
                    customScreenName,
                    dontClose: true,
                    onScreen: true,
                });

                //--------------------------------
                // Act – Add Number field
                //--------------------------------
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
                    page.getByRole('option', { name: '​  Number' }).locator('div'),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Add', exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                await waitUntilLoaded(page);

                /* Capture Number fieldId */
                await page
                    .locator('[data-type="Number"] >> :text("Number")')
                    .last()
                    .click({ force: true });

                const fieldId = await page.locator('.promptKey').inputValue();

                //--------------------------------
                // Act – Add Checkbox field
                //--------------------------------
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
                    page.getByRole('option', { name: '​  Checkbox' }).locator('div'),
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
                // Act – Equals operator
                //--------------------------------
                await clickAndWait(
                    page,
                    page.locator('[role="tab"] :text("Rules")'),
                );

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="mandatory-when_listbox"]').first(),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: '​ Mandatory when expression...',
                        })
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
                    page.locator('#flyout-textarea'),
                    fieldId,
                );

                await clickAndWait(page, page.getByText('Operators', { exact: true }));
                await clickAndWait(page, page.getByText('Equals', { exact: true }));
                await clickAndWait(page, page.getByRole('button', { name: 'Use Operator' }));

                await page.keyboard.type(inputValue);

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Select', exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                //--------------------------------
                // Assert – Equals
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Preview' }),
                );

                await waitUntilLoaded(page);

                await page
                    .getByRole('dialog', { name: 'New Screen - Internal (' })
                    .getByRole('spinbutton')
                    .click({ force: true });

                await page.keyboard.type(inputValue);
                await page.keyboard.press('Enter');

                saveTextElement = page.locator(
                    `[class*="left flex-container-row"]:has(:text("${mandatoryText}"))`,
                );

                await expect(
                    saveTextElement.locator('[class*="required-asterisk"]'),
                ).toBeVisible();

                //--------------------------------
                // Assert – Increment breaks Equals
                //--------------------------------
                await page
                    .getByRole('dialog', { name: 'New Screen - Internal (' })
                    .getByLabel('Increase value')
                    .click();

                await page.keyboard.press('Enter');

                await expect(
                    saveTextElement.locator('[class*="required-asterisk"]'),
                ).not.toBeVisible();

                //--------------------------------
                // Act – Less Than operator
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                await waitUntilLoaded(page);

                await page.locator(':text("Checkbox:")').first().click({ force: true });

                await clickAndWait(page, page.getByText('Rules', { exact: true }));
                await clickAndWait(page, page.getByRole('button', { name: '' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Clear Expression' }));

                await fillAndWait(
                    page,
                    page.locator('#flyout-textarea'),
                    fieldId,
                );

                await clickAndWait(page, page.getByText('Operators', { exact: true }));
                await clickAndWait(page, page.getByText('Less than', { exact: true }));
                await clickAndWait(page, page.getByRole('button', { name: 'Use Operator' }));

                await page.keyboard.type(lessThanValue);

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Select', exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                //--------------------------------
                // Assert – Less Than
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Preview' }),
                );

                await waitUntilLoaded(page);

                await page
                    .getByRole('dialog', { name: '​ New Screen - Internal (' })
                    .getByRole('spinbutton')
                    .fill(lessThanValue);

                await page.keyboard.press('Enter');

                /*
                await expect(
                    saveTextElement.locator('[class*="required-asterisk"]'),
                ).not.toBeVisible();

                 */


            },
        );
    },
);


