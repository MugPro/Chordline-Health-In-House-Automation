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

/* -------------------------------------------
   Test Suite
------------------------------------------- */
test.describe(
    'Rules – Not read-only when – Field and Variable',
    () => {

        test(
            'Not read-only when – Outcome field and Member variable',
            async () => {

                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = 'RulesNotReadOnlyWhen';
                const screenTemplateGroup = 'Touch Phone Call';
                const defaultTemplate = 'Touch Phone Call - Default';
                const screenName = 'NotReadOnlyWhen';
                const screenTemplateCopyName = `${screenName}${Date.now()}`;
                const fieldText =
                    'Not read only when a condition outcome is completed';
                const resp1 = 'Yes';
                const resp2 = 'No';

                const memberLastName = 'Adams';
                const memberFirstName = 'Amanda';
                const memberLastName1 = 'Johnson';
                const memberFirstName1 = 'John';

                //const { page } = await logIn({ loginID });

                const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
                const url = env.DEFAULT_URL;





                // Sign in to the app
                const { page, context, browser } = await logIn3({ loginID, password,
                    url });



                    await waitUntilLoaded(page);

                //--------------------------------
                // Cleanup existing copies
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
                    screenName: 'Touch Phone Call - Default - Copy',
                    onScreen: true,
                    dontClose: true,
                });

                //--------------------------------
                // Create new screen template copy
                //--------------------------------
                await copyDefaultScreenTemplate(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    onScreen: true,
                    dontClose: true,
                });

                await page
                    .getByRole('textbox', { name: 'Screen Name:' })
                    .fill(screenTemplateCopyName);

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Add Checkbox Field
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Field' }).first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('radio', { name: 'New Custom field' }),
                );

                    //await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.locator('[aria-controls="fieldTypes_listbox"]'),
                );

                await clickAndWait(
                    page,
                    page.locator(
                        '[data-role="staticlist"] [role="option"]:has-text("Checkbox")',
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
                        '[data-role="staticlist"] [role="option"]:has-text("Field (Lookup): Touch Focus")',
                    ),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Add', exact: true }),
                );

                    //await waitUntilLoaded(page);

                //--------------------------------
                // Field Editor
                //--------------------------------
                await page.locator('#question-text').fill(fieldText);

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Valid Response' }),
                );
                await page
                    .getByRole('tabpanel', { name: 'Field Editor' })
                    .getByRole('textbox')
                    .nth(1)
                    .fill(resp1);

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Valid Response' }),
                );
                await page
                    .getByRole('tabpanel', { name: 'Field Editor' })
                    .getByRole('textbox')
                    .nth(2)
                    .fill(resp2);



                    await waitUntilLoaded(page);

                //--------------------------------
                // Rules – Not read-only when (Outcome)
                //--------------------------------
                await clickAndWait(page, page.getByText('Rules', { exact: true }));

                    await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByText('Never read-only').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', {
                        name: '​ Not read-only when...',
                        exact: true,
                    }),
                );

                await clickAndWait(
                    page,
                    page.getByText('Checkbox (this question)').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: '​ Outcome' }),
                );

                   // await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page
                        .getByRole('tabpanel', { name: 'Rules' })
                        .getByLabel('expand combobox'),
                );

                    //await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: '​ Completed' }),
                );

                //--------------------------------
                // Preview & Assert – Outcome Pending
                //--------------------------------
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Preview' }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Yes' }),
                );

                await waitUntilLoaded(page);

                await expect(
                    page.getByRole('checkbox', { name: 'Yes' }),
                ).toBeDisabled();
                await expect(
                    page.getByRole('checkbox', { name: 'No' }),
                ).toBeDisabled();

                    //await waitUntilLoaded(page);


                    /*
                //--------------------------------
                // Set Outcome = Completed
                //--------------------------------
                await page
                    .locator(
                        '[data-bind*="fields.tuch_outcome_id"] [role="button"]',
                    )
                    .first()
                    .click();

                await page
                    .locator('.input [name="tuch_outcome_id_input"]')
                    .fill('Completed');

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: '​ Completed' }),
                );

                     */







               await page.getByRole('button', { name: '...' }).nth(1).click();
                await page.getByRole('gridcell', { name: 'Completed' }).click();
                await page.getByRole('button', { name: 'Select', exact: true }).click();






                    await waitUntilLoaded(page);

                await expect(
                    page.getByRole('checkbox', { name: 'Yes' }),
                ).toBeEnabled();
                await expect(
                    page.getByRole('checkbox', { name: 'No' }),
                ).toBeEnabled();

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );


                    await waitUntilLoaded(page);



                // Click the new field we created to focus it
                await page
                    .locator(
                        `[id*="fields.tuch_custom_field_"][id*=".otherResponse_overlay"]`,
                    )
                    .click({ timeout: 2000 });

/*
                //--------------------------------
                // Rules – Not read-only when (Variable)
                //--------------------------------
                await page
                    .locator('[id*="fields.tuch_custom_field_"]')
                    .click();

 */


                await waitUntilLoaded(page);

                await clickAndWait(page, page.getByText('Rules', { exact: true }));

                    //await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByText('Read-only when...').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', {
                        name: 'Not read-only when...',
                    }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('radio', { name: 'Variable' }),
                );

                await clickAndWait(
                    page,
                    page.getByText('Select a variable...').first(),
                );

                await clickAndWait(
                    page,
                    page.getByRole('option', {
                        name: "​ Member's Birth Gender",
                    }),
                );


                    //await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page
                        .getByRole('tabpanel', { name: 'Rules' })
                        .getByLabel('expand combobox'),
                );


                    //await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByRole('option', { name: '​ Male', exact: true }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                await waitUntilLoaded(page);

                // Click the "Close" button
                await page
                    .getByLabel(`New Screen - Internal`)
                    .getByText(`Close`, { exact: true })
                    .click();


                await waitUntilLoaded(page);



                // Set the {screenTemplateCopyName1} to active
                await page
                    .locator(
                        `[role="row"]:has(:text-is("${screenTemplateCopyName}")) input`,
                        { exact: true },
                    )
                    .first()
                    .click();


                await waitUntilLoaded(page);



                await page.getByText(`Close`, { exact: true }).click();

                //await page.locator(`#close`).last().click();

                await waitUntilLoaded(page);

                await page
                    .getByRole('tab', { name: 'Touch/Contact/Notice' })
                    .locator('span')
                    .click();



                await waitUntilLoaded(page);

                await page
                    .getByRole('textbox', { name: 'Search...' })
                    .fill(`${memberLastName}, ${memberFirstName}`);
                await page.keyboard.press('Enter');













                // Double click on the member to open member details
                await page
                    .getByRole(`gridcell`, {
                        name: `${memberLastName}, ${memberFirstName}`,
                    })
                    .first()
                    .dblclick();
                await waitUntilLoaded(page);

                // Click the "Edit" button
                await page
                    .getByLabel(`Touch - Phone Call #`)
                    .getByRole(`button`, { name: ` Edit` })
                    .click();


                await waitUntilLoaded(page);

                //--------------------------------
                // Assert:
                //--------------------------------
                // Assert the "Not read only when" member's gender is male that the checkboxes are disabled
                await expect(page.getByRole(`checkbox`, { name: `Yes` })).toBeDisabled();
                await expect(page.getByRole(`checkbox`, { name: `No` })).toBeDisabled();

                // Close the "Touch - Phone Call" pop up
                await page.getByRole(`button`, { name: ` Close` }).click();

                // Click the "Home" tab
                await page.getByText(`Home`, { exact: true }).click();

                // Search for member
                await page
                    .getByRole(`textbox`, { name: `Search...` })
                    .fill(`${memberLastName1}, ${memberFirstName1}`);
                await page.keyboard.press("Enter");
                await waitUntilLoaded(page);

                // Double click on the member to open member details
                await page
                    .getByRole(`gridcell`, {
                        name: `${memberLastName1}, ${memberFirstName1}`,
                    })
                    .first()
                    .dblclick();
                await waitUntilLoaded(page);

                // Click the "Edit" button
                await page
                    .getByLabel(`Touch - Phone Call #`)
                    .getByRole(`button`, { name: ` Edit` })
                    .click();

                // Assert the "Not read only when" member's gender is Male that the checkboxes are enabled
                await expect(page.getByRole(`checkbox`, { name: `Yes` })).toBeEnabled();
                await expect(page.getByRole(`checkbox`, { name: `No` })).toBeEnabled();














                /*

                await waitUntilLoaded(page);

                await page
                    .getByRole('tab', { name: 'Touch/Contact/Notice' })
                    .locator('span')
                    .click();


                    await waitUntilLoaded(page);

                await page
                    .getByRole('textbox', { name: 'Search...' })
                    .fill(`${memberLastName}, ${memberFirstName}`);
                await page.keyboard.press('Enter');


                    await waitUntilLoaded(page);

                await page
                    .getByRole('gridcell', {
                        name: `${memberLastName}, ${memberFirstName}`,
                    })
                    .first()
                    .dblclick();


                    await waitUntilLoaded(page);

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: ' Edit' }),
                );


                    await waitUntilLoaded(page);

                await expect(
                    page.getByRole('checkbox', { name: 'Yes' }),
                ).toBeDisabled();
                await expect(
                    page.getByRole('checkbox', { name: 'No' }),
                ).toBeDisabled();

                //--------------------------------
                // Validate Member – Female
                //--------------------------------
                await page.getByText(`Close`, { exact: true }).click();


                    await waitUntilLoaded(page);



                // Set the {screenTemplateCopyName1} to active
                await page
                    .locator(
                        `[role="row"]:has(:text-is("${screenTemplateCopyName}")) input`,
                        { exact: true },
                    )
                    .first()
                    .click();
                await waitUntilLoaded(page);

                // Close the "Screen Templates" modal
                await page.getByText(`Close`, { exact: true }).click();

                // Click the "Touch/Contact/Notice" tab
                await page
                    .getByRole(`tab`, { name: `Touch/Contact/Notice` })
                    .locator(`span`)
                    .click();
                await waitUntilLoaded(page);

                // Click the "Type" filter
                await expect(async () => {
                    await page
                        .getByTitle(`Type filter column settings`, { exact: true })
                        .click();
                    await page
                        .getByRole(`textbox`, { name: `Value` })
                        .fill(`Phone Call`, { timeout: 3000 });
                }).toPass({ timeout: 30 * 1000 });

                // Click the "Filter" button
                await page.getByRole(`button`, { name: ` Filter` }).click();

                // Search for member
                await page
                    .getByRole(`textbox`, { name: `Search...` })
                    .fill(`${memberLastName}, ${memberFirstName}`);
                await page.keyboard.press("Enter");
                await waitUntilLoaded(page);

                // Double click on the member to open member details
                await page
                    .getByRole(`gridcell`, {
                        name: `${memberLastName}, ${memberFirstName}`,
                    })
                    .first()
                    .dblclick();
                await waitUntilLoaded(page);

                // Click the "Edit" button
                await page
                    .getByLabel(`Touch - Phone Call #`)
                    .getByRole(`button`, { name: ` Edit` })
                    .click();

                //--------------------------------
                // Assert:
                //--------------------------------
                // Assert the "Not read only when" member's gender is male that the checkboxes are disabled
                await expect(page.getByRole(`checkbox`, { name: `Yes` })).toBeDisabled();
                await expect(page.getByRole(`checkbox`, { name: `No` })).toBeDisabled();

                // Close the "Touch - Phone Call" pop up
                await page.getByRole(`button`, { name: ` Close` }).click();

                // Click the "Home" tab
                await page.getByText(`Home`, { exact: true }).click();

                // Search for member
                await page
                    .getByRole(`textbox`, { name: `Search...` })
                    .fill(`${memberLastName1}, ${memberFirstName1}`);
                await page.keyboard.press("Enter");
                await waitUntilLoaded(page);

                // Double click on the member to open member details
                await page
                    .getByRole(`gridcell`, {
                        name: `${memberLastName1}, ${memberFirstName1}`,
                    })
                    .first()
                    .dblclick();
                await waitUntilLoaded(page);

                // Click the "Edit" button
                await page
                    .getByLabel(`Touch - Phone Call #`)
                    .getByRole(`button`, { name: ` Edit` })
                    .click();

                // Assert the "Not read only when" member's gender is Male that the checkboxes are enabled
                await expect(page.getByRole(`checkbox`, { name: `Yes` })).toBeEnabled();
                await expect(page.getByRole(`checkbox`, { name: `No` })).toBeEnabled();

                 */


            });
    },
);
