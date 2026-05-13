
/*

import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';


const ACTION_PAUSE_MS = 350;

const pause = (page, ms = ACTION_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = ACTION_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};


test.describe(
    'Rules – Mandatory when expression – Variables – Current User',
    () => {

        test(
            'Mandatory when – Current User – Full Name, Login Name, and User ID',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'QAWRulesMandatoryWhenVariables';
                const fullName = `${loginID} Qaw`;
                const screenTemplateGroup = 'Authorization - RF';
                const defaultTemplate = `${screenTemplateGroup} - Default`;
                const screenName = `${defaultTemplate} - Copy`;
                const checkboxOption1 = 'yes';
                const customScreenName = `${loginID}${Date.now()}`;

                const { page } = await logIn({
                    loginID,
                    password: process.env.DEFAULT_PASS_JUNE_2025,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName: customScreenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    dontClose: true,
                    onScreen: true,
                });

                await copyDefaultScreenTemplate(page, {
                    defaultTemplate,
                    screenTemplateGroup,
                    customScreenName,
                    onScreen: true,
                    dontClose: true,
                });





                    // Close
                    try {
                            await page
                                .getByLabel(`New Screen - Internal`)
                                .getByText(`Close`, { exact: true })
                                .click();
                            await expect(
                                page.getByLabel(`New Screen - Internal`),
                            ).not.toBeVisible();
                    } catch {
                            await page
                                .getByLabel(`New Screen - Internal`)
                                .getByText(`Close`, { exact: true })
                                .click();
                            await expect(
                                page.getByLabel(`New Screen - Internal`),
                            ).not.toBeVisible();
                    }
                    // Search for copy
                    await waitUntilLoaded(page);









                await page
                    .getByRole('tabpanel', { name: 'Internal' })
                    .getByPlaceholder('Search...')
                    .fill(customScreenName);

                await page.keyboard.press('Enter');

                await clickAndWait(
                    page,
                    page.getByRole('gridcell', { name: customScreenName }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: '' }),
                );

                //--------------------------------
                // Add Number field – default GetCurrentUserId()
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

                await page
                    .locator('[data-type="Number"] >> :text("Number")')
                    .last()
                    .click({ force: true });

                const fieldId = await page.locator('.promptKey').inputValue();

                await page.locator('#question-text').fill('User ID');

                await clickAndWait(
                    page,
                    page.locator('[role="tab"] :text("Rules")'),
                );

                await clickAndWait(
                    page,
                    page.locator('.is-default-rule [aria-label="select"]'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: 'Default once on new records',
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        'button[title="Click here to set a value with an expression."]:visible',
                    ),
                );

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).pressSequentially('GetCurrentUserId()', { delay: 250 });

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Select', exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                //--------------------------------
                // Capture User ID from preview
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Preview' }),
                );

                await waitUntilLoaded(page);

                const userID = await page
                    .locator(
                        '[role="dialog"] [class*="formField"]:has-text("User ID:") input',
                    )
                    .inputValue();

                await clickAndWait(
                    page,
                    page
                        .locator('[role="dialog"] button:text-is("Close")')
                        .first(),
                );

                //--------------------------------
                // Add Checkbox field
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
                    page.getByRole('option', { name: ' Checkbox' }).locator('div'),
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
                // Mandatory when – Current User Full Name
                //--------------------------------
                await clickAndWait(page, page.locator('[role="tab"] :text("Rules")'));

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="mandatory-when_listbox"]').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', {
                        name: '​ Mandatory when expression...',
                    }),
                );

                await clickAndWait(page, page.getByText('Variables', { exact: true }));

                await page
                    .locator('span:has-text("Current User")')
                    .first()
                    .click();

                await clickAndWait(
                    page,
                    page.locator('button:text-is("Use Full Name")'),
                );

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).pressSequentially(` = "${fullName}"`, { delay: 250 });

                await clickAndWait(page, page.getByRole('button', { name: 'Select' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));

                //--------------------------------
                // Assert – Full Name
                //--------------------------------
                const checkboxLabel = page.locator(
                    '[role="dialog"] [class*="required-asterisk"] ~ div:has-text("Checkbox")',
                );

                await expect(checkboxLabel).toBeVisible();
                await expect(checkboxLabel).toHaveCSS(
                    'color',
                    'rgb(255, 0, 0)',
                );

                //--------------------------------
                // Mandatory when – Current User Login Name
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                await page.locator('[data-type="Checkbox"]').click();

                await clickAndWait(page, page.locator('[role="tab"] :text("Rules")'));
                await clickAndWait(page, page.locator('.condition-expression'));

                await clickAndWait(page, page.getByText('Variables', { exact: true }));
                await page.locator('span:has-text("Current User")').first().click();

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).clear();

                await clickAndWait(
                    page,
                    page.locator('button:text-is("Use Login Name")'),
                );

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).pressSequentially(` = ${loginID}`, { delay: 250 });

                await clickAndWait(page, page.getByRole('button', { name: 'Select' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));

                //--------------------------------
                // Assert – Login Name
                //--------------------------------
                await expect(checkboxLabel).toBeVisible();


            },
        );
    },
);


 */
















/*
import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';


const ACTION_PAUSE_MS = 350;

const pause = (page, ms = ACTION_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = ACTION_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};


test.describe(
    'Rules – Mandatory when expression – Variables – Current User',
    () => {

        test(
            'Mandatory when – Current User – Full Name, Login Name, and User ID',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'QAWRulesMandatoryWhenVariables';
                const fullName = `${loginID} Qaw`;
                const screenTemplateGroup = 'Authorization - RF';
                const defaultTemplate = `${screenTemplateGroup} - Default`;
                const screenName = `${defaultTemplate} - Copy`;
                const checkboxOption1 = 'yes';
                const customScreenName = `${loginID}${Date.now()}`;

                const { page } = await logIn({
                    loginID});

                await waitUntilLoaded(page);

                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName: customScreenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    dontClose: true,
                    onScreen: true,
                });

                await copyDefaultScreenTemplate(page, {
                    defaultTemplate,
                    screenTemplateGroup,
                    customScreenName,
                    onScreen: true,
                    dontClose: true,
                });





                // Close
                try {
                    await page
                        .getByLabel(`New Screen - Internal`)
                        .getByText(`Close`, { exact: true })
                        .click();
                    await expect(
                        page.getByLabel(`New Screen - Internal`),
                    ).not.toBeVisible();
                } catch {
                    await page
                        .getByLabel(`New Screen - Internal`)
                        .getByText(`Close`, { exact: true })
                        .click();
                    await expect(
                        page.getByLabel(`New Screen - Internal`),
                    ).not.toBeVisible();
                }
                // Search for copy
                await waitUntilLoaded(page);









                await page
                    .getByRole('tabpanel', { name: 'Internal' })
                    .getByPlaceholder('Search...')
                    .fill(customScreenName);

                await page.keyboard.press('Enter');

                await clickAndWait(
                    page,
                    page.getByRole('gridcell', { name: customScreenName }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: '' }),
                );

                //--------------------------------
                // Add Number field – default GetCurrentUserId()
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

                await page
                    .locator('[data-type="Number"] >> :text("Number")')
                    .last()
                    .click({ force: true });

                const fieldId = await page.locator('.promptKey').inputValue();

                await page.locator('#question-text').fill('User ID');

                await clickAndWait(
                    page,
                    page.locator('[role="tab"] :text("Rules")'),
                );

                await clickAndWait(
                    page,
                    page.locator('.is-default-rule [aria-label="select"]'),
                );

                await clickAndWait(
                    page,
                    page
                        .getByRole('option', {
                            name: 'Default once on new records',
                        })
                        .locator('span'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        'button[title="Click here to set a value with an expression."]:visible',
                    ),
                );

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).pressSequentially('GetCurrentUserId()', { delay: 250 });

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Select', exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                //--------------------------------
                // Capture User ID from preview
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Preview' }),
                );

                await waitUntilLoaded(page);

                const userID = await page
                    .getByRole('dialog', { name: /New Screen - Internal/ })
                    .locator(`#${fieldId}`)
                    .inputValue();

                await clickAndWait(
                    page,
                    page
                        .locator('[role="dialog"] button:text-is("Close")')
                        .first(),
                );

                //--------------------------------
                // Add Checkbox field
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
                    page.getByRole('option', { name: ' Checkbox' }).locator('div'),
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
                // Mandatory when – Current User Full Name
                //--------------------------------
                await clickAndWait(page, page.locator('[role="tab"] :text("Rules")'));

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="mandatory-when_listbox"]').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', {
                        name: '​ Mandatory when expression...',
                    }),
                );

                await clickAndWait(page, page.getByText('Variables', { exact: true }));

                await page
                    .locator('span:has-text("Current User")')
                    .first()
                    .click();

                await clickAndWait(
                    page,
                    page.locator('button:text-is("Use Full Name")'),
                );

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).pressSequentially(` = "${fullName}"`, { delay: 250 });

                await clickAndWait(page, page.getByRole('button', { name: 'Select' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));

                //--------------------------------
                // Assert – Full Name
                //--------------------------------
                const checkboxLabel = page.locator(
                    '[role="dialog"] [class*="required-asterisk"] ~ div:has-text("Checkbox")',
                );

                await expect(checkboxLabel).toBeVisible();
                await expect(checkboxLabel).toHaveCSS(
                    'color',
                    'rgb(255, 0, 0)',
                );

                //--------------------------------
                // Mandatory when – Current User Login Name
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                await page.locator('[data-type="Checkbox"]').click();

                await clickAndWait(page, page.locator('[role="tab"] :text("Rules")'));
                await clickAndWait(page, page.locator('.condition-expression'));

                await clickAndWait(page, page.getByText('Variables', { exact: true }));
                await page.locator('span:has-text("Current User")').first().click();

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).clear();

                await clickAndWait(
                    page,
                    page.locator('button:text-is("Use Login Name")'),
                );

                await page.locator(
                    '[role="dialog"] textarea[data-placeholder]',
                ).pressSequentially(` = ${loginID}`, { delay: 250 });

                await clickAndWait(page, page.getByRole('button', { name: 'Select' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
                await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));

                //--------------------------------
                // Assert – Login Name
                //--------------------------------
                await expect(checkboxLabel).toBeVisible();


            },
        );
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


const confirmUnsavedChangesIfPresent = async (page) => {
    const warning = page.getByText('Warning');

    if (await warning.isVisible()) {
        await expect(
            page.getByText('You have unsaved changes,'),
        ).toBeVisible();

        await page.getByRole('button', { name: 'Yes' }).click();
    }
};



test.describe(
    'Rules – Mandatory when expression – Variables – Current User',
    () => {

        test(
            'Mandatory when – Current User – Full Name, Login Name, and User ID',
            async () => {

//--------------------------------
// Arrange:
//--------------------------------
// Set constants
const loginID = `QAWRulesMandatoryWhenVariables`;
const fullName = `${loginID} Qaw`;
const screenTemplateGroup = `Authorization - RF`;
// const screenTemplateGroup = `Mandatory When Exp Vars`;
const defaultTemplate = `${screenTemplateGroup} - Default`;
const screenName = `${defaultTemplate} - Copy`;
const checkboxOption1 = `yes`;
const customScreenName = `${loginID}${Date.now()}`;

// Sign in to the app
//const { page } = await logIn({ loginID });

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;



/*
                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url });

 */



                // Sign in to the app
                const { page, context, browser } = await logIn({ loginID, password,
                    url });



// Clean up: delete the template copy
await cleanupScreenTemplateCopy(page, {
    screenName,
    screenTemplateGroup,
    defaultTemplate,
    dontClose: true,
});

// Clean up: delete the template copy
await cleanupScreenTemplateCopy(page, {
    screenName: customScreenName,
    screenTemplateGroup,
    defaultTemplate,
    dontClose: true,
    onScreen: true,
});

// Create a copy of the default template
await copyDefaultScreenTemplate(page, {
    defaultTemplate,
    screenTemplateGroup,
    customScreenName,
    onScreen: true,
    dontClose: true,
});

// Close
try {
    await page
        .getByLabel(`New Screen - Internal`)
        .getByText(`Close`, { exact: true })
        .click();
    await expect(
        page.getByLabel(`New Screen - Internal`),
    ).not.toBeVisible();
} catch {
    await page
        .getByLabel(`New Screen - Internal`)
        .getByText(`Close`, { exact: true })
        .click();
    await expect(
        page.getByLabel(`New Screen - Internal`),
    ).not.toBeVisible();
}
// Search for copy
await waitUntilLoaded(page);
await page
    .getByRole(`tabpanel`, { name: `Internal` })
    .getByPlaceholder(`Search...`)
    .fill(customScreenName);
await page.keyboard.press("Enter");

//--------------------------------
// Act:
//--------------------------------
// Click the copied screen name grid cell
await page
    .getByRole(`gridcell`, { name: `${customScreenName}` })
    .click();

// Click the "" button (edit pencil icon)
await page.getByRole(`button`, { name: `` }).click();

// Click the " Field" button
await page.getByRole(`button`, { name: ` Field` }).first().click();

// Click the combobox
await page
    .getByRole(`combobox`)
    .filter({ hasText: `Radio ButtonRadio ButtonDrop` })
    .getByLabel(`select`)
    .click();

// Click the "​  Number" option
await page
    .getByRole(`option`, { name: `​  Number` })
    .locator(`div`)
    .click();

// Click the "Add" button
await page.getByRole(`button`, { name: `Add`, exact: true }).click();

// Click the "Save" button
await page.getByRole(`button`, { name: `Save` }).click();

// Wait page load
await waitUntilLoaded(page);

// Click `Number` input
try {
    await page
        .locator(`[data-type="Number"] >> :text("Number")`)
        .last()
        .click({ force: true });
    await page
        .locator(`[role="tab"] :text("Rules")`)
        .waitFor({ timeout: 4000 });
} catch {
    await page
        .locator(`[data-type="Number"] >> :text("Number")`)
        .last()
        .click({ force: true });
    await page
        .locator(`[role="tab"] :text("Rules")`)
        .waitFor({ timeout: 4000 });
}

// Save `FieldId` value
const fieldId = await page.locator(".promptKey").inputValue();

// Change Field Text
await page.locator(`#question-text`).fill(`User ID`);

// Wait page load
                await waitUntilLoaded(page);

// Click the `Rules` tab
await page.locator(`[role="tab"] :text("Rules")`).click();

                await waitUntilLoaded(page);

// Click "Default" dropdown
await page.locator(`.is-default-rule [aria-label="select"]`).click();

// Select "Default once on new records"
await page
    .getByRole(`option`, { name: `Default once on new records` })
    .locator(`span`)
    .click();

// Click fx button for Default Value
await page
    .locator(
        `button[title="Click here to set a value with an expression."]:visible`,
    )
    .click();

// Add "GetCurrentUserId()" to the textbox
await page
    .locator(
        `[role="dialog"] textarea[data-placeholder="Create an expression that results in a true/false..."]:visible`,
    )
    .pressSequentially(`GetCurrentUserId()`, { delay: 250 });

// Click the "Select" button
await page.getByRole(`button`, { name: `Select`, exact: true }).click();

// Click the "Save" button
await page.getByRole(`button`, { name: `Save` }).click();

await waitUntilLoaded(page);

await confirmUnsavedChangesIfPresent(page);

await waitUntilLoaded(page);

// Click the "Preview" button
await page.getByRole(`button`, { name: `Preview` }).click();

// Wait page load
await waitUntilLoaded(page);

// Save User ID
const userID = await page
    .locator(
        `[role="dialog"] [class*="formField"]:has-text("User ID:") [class="input"] input:visible`,
    )
    .inputValue();

// Close modal
await page
    .locator(
        `[role="dialog"] button:text-is("Close")[tabindex="10000"]:visible`,
    )
    .click();

// Click the " Field" button
await page.getByRole(`button`, { name: ` Field` }).first().click();

// Click the combobox
await page
    .getByRole(`combobox`)
    .filter({ hasText: `Radio ButtonRadio ButtonDrop` })
    .getByLabel(`select`)
    .click();

// Click the "​  Checkbox" option
await page
    .getByRole(`option`, { name: ` Checkbox` })
    .locator(`div`)
    .click();

// Click the "Add" button
await page.getByRole(`button`, { name: `Add`, exact: true }).click();

// Wait for the page to load
await waitUntilLoaded(page);

// Click the " Valid Response" button
await page.getByRole(`button`, { name: ` Valid Response` }).click();

// Fill in the checkbox option
await page.keyboard.type(checkboxOption1);

// Press Enter
await page.keyboard.press(`Enter`);

// Click the `Rules` tab
await page.locator(`[role="tab"] :text("Rules")`).click();

// Click the `Mandatory` input field
await page
    .locator(`[aria-controls="mandatory-when_listbox"]`)
    .first()
    .click();

// Click the "​ Mandatory when expression..." option
await page
    .getByRole(`option`, { name: `​ Mandatory when expression...` })
    .locator(`span`)
    .click();

// Click the screen template group header
await page
    .locator(`span`)
    .filter({ hasText: `Fields (${screenTemplateGroup})` })
    .click();

// Fill the text area field with
await page.locator(`#flyout-textarea`).fill(fieldId);

// Clear textbox
await page
    .locator(
        `[role="dialog"] textarea[data-placeholder="Create an expression that results in a true/false..."]:visible`,
    )
    .clear();

// Add "= <userID>" to the textbox
await page
    .locator(
        `[role="dialog"] textarea[data-placeholder="Create an expression that results in a true/false..."]:visible`,
    )
    .pressSequentially(`GetCurrentUserId() = '${userID.split(".")[0]}'`, {
        delay: 250,
    });

// Click the "Select" button
await page.getByRole(`button`, { name: `Select`, exact: true }).click();

// Click the "Save" button
await page.getByRole(`button`, { name: `Save` }).click();


await waitUntilLoaded(page);

await confirmUnsavedChangesIfPresent(page);

await waitUntilLoaded(page);

// Click the "Preview" button
await page.getByRole(`button`, { name: `Preview` }).click();

// Wait page load
await waitUntilLoaded(page);

//--------------------------------
// Assert:
//--------------------------------
// Assert that "Checkbox" has an asterisk
await expect(
    page.locator(
        `[role="dialog"] [class="formField fieldcol1 rowLast"] [class="required-asterisk"] ~ div:has-text("Checkbox"):visible`,
    ),
).toBeVisible();

// Assert that the "Checkbox" label is red
await expect(
    page.locator(
        `[role="dialog"] [class="formField fieldcol1 rowLast"] [class="required-asterisk"] ~ div:has-text("Checkbox"):visible`,
    ),
).toHaveCSS("color", "rgb(255, 0, 0)", { timeout: 5000 });

// Assert that the checkbox is visible
await expect(
    page.locator(
        `[role="dialog"] div:has-text("Checkbox") [data-field-type="Checkbox"]`,
    ),
).toBeVisible();

// Assert that the checkbox option is "Yes"
await expect(
    page.locator(
        `[role="dialog"] div:has-text("Checkbox") [data-field-type="Checkbox"]:has-text("Yes")`,
    ),
).toBeVisible();


    // Close modal
    await page
        .locator(
            `[role="dialog"] button:text-is("Close")[tabindex="10000"]:visible`,
        )
        .click();

    // Click Checkbox field
    await page.locator(`[data-type="Checkbox"]:visible`).click();

    // Click the `Rules` tab
    await page.locator(`[role="tab"] :text("Rules")`).click();

    // Click fx button
    await page.locator(`.condition-expression`).click();

    //--------------------------------
    // Act:
    //--------------------------------
    // Click the "Variables" text
    await page.getByText(`Variables`, { exact: true }).click();

    // Select "Current User"
    await page
        .locator(`span:has(:text-is("Variables")) ~ ul li`)
        .first()
        .waitFor();
    await page
        .locator(
            `span:has(:text-is("Variables")) ~ ul li :text-is("Current User")`,
        )
        .click();

    // Clear textbox
    await page
        .locator(
            `[role="dialog"] textarea[data-placeholder="Create an expression that results in a true/false..."]:visible`,
        )
        .clear();

    // Select "Use Login Name"
    await page
        .locator(`[role="dialog"] button:has-text("Use Login Name")`)
        .click();

    // Add "= <loginID>" to the textbox
    await page
        .locator(
            `[role="dialog"] textarea[data-placeholder="Create an expression that results in a true/false..."]:visible`,
        )
        .pressSequentially(` = ${loginID}`, { delay: 250 });

    // Click "Select" button
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    // Click "Save" button
    await page.getByRole(`button`, { name: `Save` }).click();

    await waitUntilLoaded(page);

    await confirmUnsavedChangesIfPresent(page);

    await waitUntilLoaded(page);

    // Click "Preview" button
    await page.getByRole(`button`, { name: `Preview` }).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert that "Checkbox" has an asterisk
    await expect(
        page.locator(
            `[role="dialog"] [class="formField fieldcol1 rowLast"] [class="required-asterisk"] ~ div:has-text("Checkbox"):visible`,
        ),
    ).toBeVisible();

    // Assert that the "Checkbox" label is red
    await expect(
        page.locator(
            `[role="dialog"] [class="formField fieldcol1 rowLast"] [class="required-asterisk"] ~ div:has-text("Checkbox"):visible`,
        ),
    ).toHaveCSS("color", "rgb(255, 0, 0)", { timeout: 5000 });

    // Assert that the checkbox is visible
    await expect(
        page.locator(
            `[role="dialog"] div:has-text("Checkbox") [data-field-type="Checkbox"]`,
        ),
    ).toBeVisible();

    // Assert that the checkbox option is "Yes"
    await expect(
        page.locator(
            `[role="dialog"] div:has-text("Checkbox") [data-field-type="Checkbox"]:has-text("Yes")`,
        ),
    ).toBeVisible();


    // Close modal
    await page
        .locator(
            `[role="dialog"] button:text-is("Close")[tabindex="10000"]:visible`,
        )
        .click();

    // Click "Checkbox" field
    await page
        .locator(`[data-type="Checkbox"]:has-text("Checkbox"):visible`)
        .click();

    // Navigate to "Rules" tab
    await page.locator(`[role="tab"] :text-is("Rules")`).click();

    //--------------------------------
    // Act:
    //--------------------------------
    // Click function button
    await page.locator(`[id="condition-rule-expression"]`).click();

    // Clear textbox
    await page
        .locator(
            `[role="dialog"] textarea[data-placeholder="Create an expression that results in a true/false..."]:visible`,
        )
        .clear();

    // Navigate to Variables
    await page.getByText(`Variables`, { exact: true }).click();

    // Select "Current User"
    await page
        .locator(`span:has(:text-is("Variables")) ~ ul li`)
        .first()
        .waitFor();
    await page
        .locator(
            `span:has(:text-is("Variables")) ~ ul li :text-is("Current User")`,
        )
        .click();

    // Click "Use Full Name" button
    await page.locator(`button:text-is("Use Full Name")`).click();

    // Add "= <Full Name>" to the textbox
    await page
        .locator(
            `[role="dialog"] textarea[data-placeholder="Create an expression that results in a true/false..."]:visible`,
        )
        .pressSequentially(` = "${fullName}"`, { delay: 250 });

    // Click "Select" button
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    // Click "Save" button
    await page.getByRole(`button`, { name: `Save` }).click();

    await waitUntilLoaded(page);

    await confirmUnsavedChangesIfPresent(page);

    await waitUntilLoaded(page);

    // Click "Preview" button
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert that "Checkbox" has an asterisk
    await expect(
        page.locator(
            `[role="dialog"] [class="formField fieldcol1 rowLast"] [class="required-asterisk"] ~ div:has-text("Checkbox"):visible`,
        ),
    ).toBeVisible();

    // Assert that the "Checkbox" label is red
    await expect(
        page.locator(
            `[role="dialog"] [class="formField fieldcol1 rowLast"] [class="required-asterisk"] ~ div:has-text("Checkbox"):visible`,
        ),
    ).toHaveCSS("color", "rgb(255, 0, 0)", { timeout: 5000 });

    // Assert that the checkbox is visible
    await expect(
        page.locator(
            `[role="dialog"] div:has-text("Checkbox") [data-field-type="Checkbox"]`,
        ),
    ).toBeVisible();

    // Assert that the checkbox option is "Yes"
    await expect(
        page.locator(
            `[role="dialog"] div:has-text("Checkbox") [data-field-type="Checkbox"]:has-text("Yes")`,
        ),
    ).toBeVisible();


});
},
);
