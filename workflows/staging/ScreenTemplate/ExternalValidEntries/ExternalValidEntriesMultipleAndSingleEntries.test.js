/*


import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';




const FILL_CLICK_PAUSE_MS = 400;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

test.describe(
    'External – Valid Entries (Multiple and Single)',
    () => {
        test('External screen supports single and multiple Valid Entries correctly', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `ValidEntries`;
            const screenTemplateGroup = `Case`;
            const defaultTemplate = `${screenTemplateGroup} - Default - External`;
            const screenName = `${defaultTemplate} - Copy`;
            const customScreenName = `${loginID}${Date.now()}`;

            const validEntries = ['Closed', 'Identified', 'Open', 'Reopened'];
            const entryCount = faker.number.int({ min: 2, max: 4 });
            const randomEntries = faker.helpers.arrayElements(validEntries, entryCount);
            const randomEntry = faker.helpers.arrayElement(validEntries);

            const { page } = await logIn({ loginID });
            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre-test)
            //--------------------------------
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    external: true,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName: loginID,
                    screenTemplateGroup,
                    defaultTemplate,
                    external: true,
                    dontClose: true,
                    onScreen: true,
                });
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupScreenTemplateCopy',
                    errorMsg: e.message,
                });
            }

            //--------------------------------
            // Create copy of default template
            //--------------------------------
            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                customScreenName,
                external: true,
                onScreen: true,
                dontClose: true,
            });

            //--------------------------------
            // Act – MULTIPLE valid entries
            //--------------------------------
            // Select "* Status" field
            await clickAndWait(
                page,
                page.locator('#case_status_reference_id_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            // Clear any existing valid entries
            await clickAndWait(
                page,
                page
                .locator(
                    `[data-bind="visible:lookupValidEntriesSupported"] [title="clear"]`),
                );


            await waitUntilLoaded(page);

            // Add multiple valid entries
            for (const entry of randomEntries) {
                await clickAndWait(
                    page,
                    page.locator('#validentries-rule-element_taglist + input'),
                );
                await clickAndWait(
                    page,
                    page.getByRole('option', { name: entry, exact: true }),
                );
            }

            // Set default value
            await page.locator('input[name="fieldDefault_input"]').clear();
            await page
                .locator('input[name="fieldDefault_input"]')
                .fill(randomEntries[0]);

            await clickAndWait(
                page,
                page
                    .locator('#default-rule-element_listbox')
                    .getByRole('option', { name: randomEntries[0], exact: true }),
            );

            await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – MULTIPLE valid entries
            //--------------------------------
            await expect(
                page.locator(
                    '#modal-window_wnd_title:has-text("New Screen - External")',
                ),
            ).toBeVisible();

            // Open dropdown
            await page
                .locator(
                    `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [role="button"]`,
                )
                .first()
                .click();

            await page
                .locator(
                    `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [type="button"]`,
                )
                .click();

            await expect(
                page.locator('#case_status_reference_id-autocomplete-list [role="option"]'),
            ).toHaveCount(randomEntries.length);

            for (const entry of randomEntries) {
                await expect(
                    page.locator(
                        `#case_status_reference_id-autocomplete-list [role="option"] span:text-is("${entry}")`,
                    ),
                ).toBeVisible();
            }


            await waitUntilLoaded(page);

            //--------------------------------
            // Act – SINGLE valid entry
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

            await clickAndWait(
                page,
                page.locator('#case_status_reference_id_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            // Clear existing entries
            try {
                await page.locator('.default-rule-div [role="button"]').first().click({ timeout: 10_000 });
            } catch {
                console.log('Field already empty');
            }

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.locator('#validentries-rule-element_taglist + input'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: randomEntry, exact: true }),
            );

            await page
                .locator('input[name="fieldDefault_input"]')
                .fill(randomEntry);

            await clickAndWait(
                page,
                page
                    .locator('#default-rule-element_listbox')
                    .getByRole('option', { name: randomEntry, exact: true }),
            );

            await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – SINGLE valid entry
            //--------------------------------
            await page
                .locator(
                    `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [role="button"]`,
                )
                .first()
                .click();

            await page
                .locator(
                    `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [type="button"]`,
                )
                .click();

            await waitUntilLoaded(page);

            await expect(
                page.locator('#case_status_reference_id-autocomplete-list [role="option"]'),
            ).toHaveCount(1);

            await expect(
                page.locator(
                    `#case_status_reference_id-autocomplete-list [role="option"] span:text-is("${randomEntry}")`,
                ),
            ).toBeVisible();

            //--------------------------------
            // Cleanup
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

            await clickAndWait(
                page,
                page
                    .getByLabel('New Screen - External')
                    .getByText('Close'),
            );


        });
    },
);

 */






























/*

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';




const FILL_CLICK_PAUSE_MS = 400;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

test.describe(
    'External – Valid Entries (Multiple and Single)',
    () => {
        test('External screen supports single and multiple Valid Entries correctly', async () => {






// Set constants
const loginID = `ValidEntries`;
const screenTemplateGroup = `Case`;
const defaultTemplate = `${screenTemplateGroup} - Default - External`;
const screenName = `${defaultTemplate} - Copy`;
const customScreenName = `${loginID}${Date.now()}`;
const validEntries = ["Closed", "Identified", "Open", "Reopened"];
const randomEntry = faker.helpers.arrayElement(validEntries);

// Sign in to the app
const { page } = await logIn({ loginID });

try {
    await cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
        external: true,
        dontClose: true,
    });
    await cleanupScreenTemplateCopy(page, {
        screenName: loginID,
        screenTemplateGroup,
        defaultTemplate,
        external: true,
        dontClose: true,
        onScreen: true,
    });
} catch (e) {
    await reportCleanupFailed({
        dedupKey: "cleanupScreenTemplateCopy",
        errorMsg: e.message,
    });
}

// Create a copy of the default template
await copyDefaultScreenTemplate(page, {
    defaultTemplate,
    screenTemplateGroup,
    customScreenName,
    external: true,
    onScreen: true,
    dontClose: true,
});

//--------------------------------
// Act:
//--------------------------------
try {
    await page.locator(`#case_status_reference_id_overlay`).click();
    await page.getByText(`Rules`).click();
} catch {
    await page.locator(`#case_status_reference_id_overlay`).click();
    await page.getByText(`Rules`).click();
}

// Click the "Valid Entries"  and select option
await page
    .locator(`[id="validentries-rule-element_taglist"] + input`)
    .click();
await page
    .getByRole(`option`, { name: randomEntry, exact: true })
    .click();

// Fill in the Default value
try {
    await page
        .locator(`.default-rule-div [role="button"]`)
        .first()
        .click({ timeout: 10000 });
} catch {
    console.log("Field already empty");
}
await page.locator(`input[name="fieldDefault_input"]`).fill(randomEntry);
await page
    .locator(`#default-rule-element_listbox`)
    .getByRole(`option`, { name: randomEntry, exact: true })
    .click();

// Click the "Save" button
await page.getByRole(`button`, { name: `Save` }).click();
await waitUntilLoaded(page);

// Click the "Preview" button
await page.getByRole(`button`, { name: `Preview` }).click();
await waitUntilLoaded(page);

//--------------------------------
// Assert:
//--------------------------------
// Assert the preview modal is displayed
await expect(
    page.locator(
        `#modal-window_wnd_title:has-text("New Screen - External")`,
    ),
).toBeVisible();

// Clear out the "* Status field", this should then display the dropdown with options
await page
    .locator(
        `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [role="button"]`,
    )
    .first()
    .click();
await page
    .locator(
        `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [type="button"]`,
    )
    .click();

// Assert there is only 1 Valid entry
await expect(
    page.locator(
        `#case_status_reference_id-autocomplete-list [role="option"]`,
    ),
).toHaveCount(1);

// Assert the randomly select Valid entry is visible
await expect(
    page.locator(
        `#case_status_reference_id-autocomplete-list [role="option"] span:text-is("${randomEntry}")`,
    ),
).toBeVisible();


    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants
            const entryCount = faker.number.int({ min: 2, max: 4 });
            const randomEntries = faker.helpers.arrayElements(validEntries, entryCount);

    // Close the Preview modal
    await page.getByRole(`button`, { name: ` Close` }).click();

    //--------------------------------
    // Act:
    //--------------------------------
    // Under the "Management" section, select the "* Status:" field
    await page.locator(`#case_status_reference_id_overlay`).click();

    // Click the "Rules" tab
    await page.getByText(`Rules`).click();

    // Click the X on the "Valid Entries" modal to clear
    await page
        .locator(
            `[data-bind="visible:lookupValidEntriesSupported"] [title="clear"]`,
        )
        .click();

    // Click the "Valid Entries"  and select option
    for (let entry of randomEntries) {
        await page
            .locator(`[id="validentries-rule-element_taglist"] + input`)
            .click();
        await page.getByRole(`option`, { name: entry, exact: true }).click();
    }

    // Fill in the Default value
    await page.locator(`input[name="fieldDefault_input"]`).clear();
    await page
        .locator(`input[name="fieldDefault_input"]`)
        .fill(randomEntries[0]);
    await page
        .locator(`#default-rule-element_listbox`)
        .getByRole(`option`, { name: randomEntries[0], exact: true })
        .click();

    // Click the "Save" button
    await page.getByRole(`button`, { name: `Save` }).click();
    await waitUntilLoaded(page);

    // Click the "Preview" button
    await page.getByRole(`button`, { name: `Preview` }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert the preview modal is displayed
    await expect(
        page.locator(
            `#modal-window_wnd_title:has-text("New Screen - External")`,
        ),
    ).toBeVisible();

    // Clear out the "* Status field", this should then display the dropdown with options
    await page
        .locator(
            `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [role="button"]`,
        )
        .first()
        .click();
    await page
        .locator(
            `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [type="button"]`,
        )
        .click();

    // Assert there is only same number of Valid entries as selected
    await expect(
        page.locator(
            `#case_status_reference_id-autocomplete-list [role="option"]`,
        ),
    ).toHaveCount(randomEntries.length);

    // Assert the randomly select Valid entries are visible
    for (let entry of randomEntries) {
        await expect(
            page.locator(
                `#case_status_reference_id-autocomplete-list [role="option"] span:text-is("${entry}")`,
            ),
        ).toBeVisible();
    }

    //--------------------------------
    // Cleanup:
    //--------------------------------
    // Close the Preview modal
    await page.getByRole(`button`, { name: ` Close` }).click();

    // Close the "New Screen" screen template page
    await page.getByLabel(`New Screen - External`).getByText(`Close`).click();




});
},
);


 */




























import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after actions
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 700;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test.describe(
    'External – Valid Entries (Multiple and Single)',
    () => {
        test('External screen supports single and multiple Valid Entries correctly', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `ValidEntries`;
            const screenTemplateGroup = `Case`;
            const defaultTemplate = `${screenTemplateGroup} - Default - External`;
            const screenName = `${defaultTemplate} - Copy`;
            const customScreenName = `${loginID}${Date.now()}`;

            const validEntries = ['Closed', 'Identified', 'Open', 'Reopened'];
            const randomEntry = faker.helpers.arrayElement(validEntries);

            const { page } = await logIn({ loginID });
            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre-test)
            //--------------------------------
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    external: true,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName: loginID,
                    screenTemplateGroup,
                    defaultTemplate,
                    external: true,
                    dontClose: true,
                    onScreen: true,
                });
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupScreenTemplateCopy',
                    errorMsg: e.message,
                });
            }

            //--------------------------------
            // Create copy of default template
            //--------------------------------
            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                customScreenName,
                external: true,
                onScreen: true,
                dontClose: true,
            });

            //--------------------------------
            // Act – SINGLE valid entry
            //--------------------------------
            try {
                await clickAndWait(
                    page,
                    page.locator('#case_status_reference_id_overlay'),
                );
                await clickAndWait(page, page.getByText('Rules'));
            } catch {
                await clickAndWait(
                    page,
                    page.locator('#case_status_reference_id_overlay'),
                );
                await clickAndWait(page, page.getByText('Rules'));
            }

            await clickAndWait(
                page,
                page.locator('#validentries-rule-element_taglist + input'),
            );

            await clickAndWait(
                page,
                page.getByRole('option', { name: randomEntry, exact: true }),
            );



            /*
            try {
                await clickAndWait(
                    page,
                    page.locator('.default-rule-div [role="button"]').first(),
                );
            } catch {
                console.log('Field already empty');
            }

            await fillAndWait(
                page,
                page.locator('input[name="fieldDefault_input"]'),
                randomEntry,
            );

            await clickAndWait(
                page,
                page
                    .locator('#default-rule-element_listbox')
                    .getByRole('option', { name: randomEntry, exact: true }),
            );

             */





            await page.locator('input[name="fieldDefault_input"]').click();
            await page.locator('input[name="fieldDefault_input"]').fill(randomEntry);
















            await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – SINGLE valid entry
            //--------------------------------
            await expect(
                page.locator(
                    '#modal-window_wnd_title:has-text("New Screen - External")',
                ),
            ).toBeVisible();

            await clickAndWait(
                page,
                page
                    .locator(
                        `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [role="button"]`,
                    )
                    .first(),
            );

            await clickAndWait(
                page,
                page.locator(
                    `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [type="button"]`,
                ),
            );

            await expect(
                page.locator('#case_status_reference_id-autocomplete-list [role="option"]'),
            ).toHaveCount(1);

            await expect(
                page.locator(
                    `#case_status_reference_id-autocomplete-list [role="option"] span:text-is("${randomEntry}")`,
                ),
            ).toBeVisible();

            //--------------------------------
            // Act – MULTIPLE valid entries
            //--------------------------------
            const entryCount = faker.number.int({ min: 2, max: 4 });
            const randomEntries = faker.helpers.arrayElements(validEntries, entryCount);

            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

            await clickAndWait(
                page,
                page.locator('#case_status_reference_id_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            await clickAndWait(
                page,
                page.locator(
                    `[data-bind="visible:lookupValidEntriesSupported"] [title="clear"]`,
                ),
            );

            for (const entry of randomEntries) {
                await clickAndWait(
                    page,
                    page.locator('#validentries-rule-element_taglist + input'),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: entry, exact: true }),
                );
            }

            await page
                .locator('input[name="fieldDefault_input"]')
                .clear();

            await fillAndWait(
                page,
                page.locator('input[name="fieldDefault_input"]'),
                randomEntries[0],
            );

            await clickAndWait(
                page,
                page
                    .locator('#default-rule-element_listbox')
                    .getByRole('option', { name: randomEntries[0], exact: true }),
            );

            await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – MULTIPLE valid entries
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .locator(
                        `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [role="button"]`,
                    )
                    .first(),
            );

            await clickAndWait(
                page,
                page.locator(
                    `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [type="button"]`,
                ),
            );

            await expect(
                page.locator('#case_status_reference_id-autocomplete-list [role="option"]'),
            ).toHaveCount(randomEntries.length);

            for (const entry of randomEntries) {
                await expect(
                    page.locator(
                        `#case_status_reference_id-autocomplete-list [role="option"] span:text-is("${entry}")`,
                    ),
                ).toBeVisible();
            }

            //--------------------------------
            // Cleanup
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));
            await clickAndWait(
                page,
                page
                    .getByLabel('New Screen - External')
                    .getByText('Close'),
            );


        });
    },
);