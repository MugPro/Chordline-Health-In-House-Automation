/*

import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';


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

test.describe('Rules – Computed When (Field and Variable)', () => {
    test('Computed When works with field and variable expressions', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const screenTemplateGroup = 'Authorization - BH IP';
        const defaultTemplate = 'Authorization - IP - BH - Default';
        const screenName = `${defaultTemplate} - Copy`;
        const loginID = 'ComputedWhenField';

        const computedNumber = '0.01';
        const team = 'Compliance Team';
        const firstName = 'QAWAntone';
        const lastName = 'Abbott';
        const patientName = `${lastName}, ${firstName}`;

        const { page } = await logIn({ loginID });
        await waitUntilLoaded(page);

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
        // ACT 1 — Computed when FIELD
        //--------------------------------
        await clickAndWait(page, page.getByText('Tools'));
        await clickAndWait(page, page.getByText('Screen Templates'));
        await clickAndWait(page, page.getByText(screenTemplateGroup));

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
            page.getByRole('button', { name: ' Field' }).first(),
        );

        await clickAndWait(
            page,
            page.getByText('Radio Button').nth(1),
        );

        await clickAndWait(
            page,
            page.getByRole('option', { name: ' Number' }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        await clickAndWait(
            page,
            page.locator('#q_1_overlay'),
        );

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.locator('[aria-controls="rules-tab-content"]'),
        );

        await clickAndWait(
            page,
            page.getByText('Never computed').first(),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', { name: 'Computed when expression...' })
                .locator('span'),
        );

        // Build expression using FIELD
        await fillAndWait(
            page,
            page
                .getByRole('dialog', { name: 'Set Computed Condition for:' })
                .getByPlaceholder('Search...'),
            'Team',
        );

        await clickAndWait(page, page.locator('#search-value-button'));
        await clickAndWait(page, page.getByText('Team (auth_team_reference_id)'));
        await clickAndWait(page, page.getByRole('button', { name: 'Use Field (Code)' }));

        await page.keyboard.type('=');

        await clickAndWait(
            page,
            page.getByRole('combobox', { name: 'Select...' }),
        );

        await page.keyboard.type(team);
        await clickAndWait(page, page.getByRole('option', { name: team }));

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

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Preview' }),
        );

        await waitUntilLoaded(page);

        //--------------------------------
        // ASSERT 1 — Field-based condition
        //--------------------------------
        await expect(
            page
                .getByRole('dialog', { name: 'Edit Screen - Internal (' })
                .getByRole('spinbutton'),
        ).toHaveValue('');

        await clickAndWait(
            page,
            page.locator('.input [name="auth_team_reference_id_input"]'),
        );

        await page.keyboard.type(team);
        await clickAndWait(page, page.getByText(team));

        await expect(
            page.locator(
                '[class*="input"] span [class*="numeric-textbox-with-spinner"] >> nth=0',
            ),
        ).toHaveValue(computedNumber);

        //--------------------------------
        // ACT 2 — Computed when VARIABLE
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Close' }),
        );







        const numberOverlay = page
            .locator('[id^="auth_custom_field_"][id$="_overlay"]')
            .last();

        await numberOverlay.waitFor({ state: 'visible' });
        await clickAndWait(page, numberOverlay);









        await clickAndWait(
            page,
            page.locator('[aria-controls="rules-tab-content"]'),
        );

        await clickAndWait(
            page,
            page.locator('[id=condition-rule-expression]'),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Clear Expression' }),
        );

        await clickAndWait(page, page.getByText('Variables'));
        await clickAndWait(
            page,
            page.locator(':text-is("Member\'s First Name")').first(),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Use Variable' }),
        );

        await page.keyboard.type('= "Richard"');

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Select', exact: true }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Save' }),
        );

        //--------------------------------
        // Navigate to real Authorization
        //--------------------------------
        await clickAndWait(
            page,
            page
                .getByLabel('Edit Screen - Internal')
                .getByText('Close', { exact: true }),
        );

        try {
            await clickAndWait(
                page,
                page.getByRole('gridcell', { name: screenName }),
            );
        } catch {
            await clickAndWait(
                page,
                page
                    .getByLabel('Edit Screen - Internal')
                    .getByText('Close', { exact: true }),
            );
            await clickAndWait(
                page,
                page.getByRole('gridcell', { name: screenName }),
            );
        }

        await clickAndWait(
            page,
            page
                .getByRole('row', { name: '   Authorization - IP - BH' })
                .getByRole('checkbox'),
        );

        await clickAndWait(page, page.getByText('Close', { exact: true }));
        await clickAndWait(page, page.getByRole('tab', { name: 'Members' }).locator('span'));

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Search...' }),
            patientName,
        );

        await page.keyboard.press('Enter');
        await page.getByRole('gridcell', { name: patientName }).dblclick();

        await clickAndWait(page, page.locator('#authorizations-menu'));
        await clickAndWait(
            page,
            page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }),
        );

        await clickAndWait(page, page.getByText('BH Inpatient', { exact: true }));

        //--------------------------------
        // ASSERT 2 — Variable-based condition
        //--------------------------------
        await expect(
            page.locator(
                '[class*="outerfielddiv"]:has-text("Number:") input:visible',
            ),
        ).toBeEmpty();

        await clickAndWait(page, page.getByText('Member Detail', { exact: true }).first());

        await expect(page.getByText(firstName, { exact: true })).toBeVisible();
        await expect(page.getByText(lastName, { exact: true })).toBeVisible();


    });
});



 */

























/*
import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
} from '../../../../helpers/Node20Helpers.js';




test.describe('Rules – Computed When (Field and Variable)', () => {
    test('Computed When works with field and variable expressions', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        //--------------------------------
        // Arrange:
        //--------------------------------
        // Set constants
        const screenTemplateGroup = `Authorization - BH IP`;
        const defaultTemplate = `Authorization - IP - BH - Default`;
        const screenName = `${defaultTemplate} - Copy`;
        const loginID = `ComputedWhenField`;
        const computedNumber = `0.01`;
        const team = `Compliance Team`;
        const firstName = `QAWAntone`;
        const lastName = `Abbott`;
        const patientName = `${lastName}, ${firstName}`;

        // Sign in to the app
        const { page } = await logIn({ loginID });

        // Clean up: delete the template copy
        await cleanupScreenTemplateCopy(page, {
            screenName,
            screenTemplateGroup,
            defaultTemplate,
        });

        // Create a copy of the default template
        await copyDefaultScreenTemplate(page, {
            defaultTemplate,
            screenTemplateGroup,
            screenName,
        });

        //--------------------------------
        // Act:
        //--------------------------------
        // Click the "Tools" text
        await page.getByText(`Tools`).click();

        // Click the "Screen Templates" text
        await page.getByText(`Screen Templates`).click();

        // Click the "Authorization Service - RF" text
        await page.getByText(screenTemplateGroup).click();

        // Click the "Authorization - IP - BH - Default - Copy" gridcell
        await page.getByRole(`gridcell`, { name: screenName }).click();

        // Click the "Edit" button
        await page.getByRole(`button`, { name: `` }).click();

        // Click the " Field" button
        await page.getByRole(`button`, { name: ` Field` }).first().click();

        // Click the "Radio Button" text
        await page.getByText(`Radio Button`).nth(1).click();

        // Click the " Number" option
        await page.getByRole(`option`, { name: ` Number` }).click();

        // Click the "Add" button
        await page.getByRole(`button`, { name: `Add`, exact: true }).click();

        // Click `Number` input
        await page.locator(`#q_1_overlay`).click();

        // Wait page load
        await waitUntilLoaded(page);

        // Click the `Rules` tab
        await page
            .locator(`[aria-controls="rules-tab-content"]`)
            .click({ force: true });

        // Click `Never Compute` input
        await page.getByText(`Never computed`).first().click();

        // Click the "Computed when expression..." option
        await page
            .getByRole(`option`, { name: `Computed when expression...` })
            .locator(`span`)
            .click();

        // Fill the "Set Computed Condition for:" dialog with
        await page
            .getByRole(`dialog`, { name: `Set Computed Condition for:` })
            .getByPlaceholder(`Search...`)
            .fill(`Team`);

        // Click `Search` button
        await page.locator(`#search-value-button`).click();

        await waitUntilLoaded(page);

        // Click the "Team (auth_team_reference_id)" text
        await page.getByText(`Team (auth_team_reference_id)`).click();

        await waitUntilLoaded(page);

        // Click the "Use Field (Code)" button
        await page.getByRole(`button`, { name: `Use Field (Code)` }).click();

        // Type-in `=`
        await page.keyboard.type(`=`);

        await waitUntilLoaded(page);

        // Click the "Select..." combobox
        await page.getByRole(`combobox`, { name: `Select...` }).click();

        // Type in `Retro` into input field
        await page.keyboard.type(team);

        // Click the "Retro" option
        await page.getByRole(`option`, { name: team }).click();

        // Click the "Insert Code Value" button
        await page.getByRole(`button`, { name: `Insert Code Value` }).click();

        // Click the "Select" button
        await page.getByRole(`button`, { name: `Select`, exact: true }).click();

        // Increment Computed Value
        await page
            .getByLabel(`Rules`)
            .getByRole(`button`, { name: `Increase value` })
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
        // Assert the Number input in the Service section is empty
        await expect(
            page
                .getByRole(`dialog`, { name: `Edit Screen - Internal (` })
                .getByRole(`spinbutton`),
        ).toHaveValue("");

        await waitUntilLoaded(page);

        // Click the "Edit Screen - Internal (" dialog
        await page
            .locator(`.input [name="auth_team_reference_id_input"]`)
            .click();

        await waitUntilLoaded(page);

        // Type-in retro
        await page.keyboard.type(team);

        // Click the "Retro" text
        await page.getByText(team).click();

        await waitUntilLoaded(page);

        // Assert the Number input in the Service section is empty
        await expect(
            page.locator(
                `[class*="input"] span [class*="numeric-textbox-with-spinner"] >> nth=0`,
            ),
        ).toHaveValue(computedNumber);

        //--------------------------------
            // Arrange:
            //--------------------------------
            // Click the " Close" button
            await page.getByRole(`button`, { name: ` Close` }).click();

            await waitUntilLoaded(page);

            //--------------------------------
            // Act:
            //--------------------------------
            // Click computed when expression
            await page.locator(`:text("Number")`).last().click({ force: true });

        await waitUntilLoaded(page);

            // Click the `Rules` tab
            await page
                .locator(`[aria-controls="rules-tab-content"]`)
                .click({ force: true });

            // Click `Computed when expression FX` button
            await page.locator(`[id=condition-rule-expression]`).click();

            // Click the "Clear Expression" button
            await page.getByRole(`button`, { name: `Clear Expression` }).click();

            // Click the "Variables" text
            await page.getByText(`Variables`).click();

            // Click the "Member`s first name" treeitem
            await page.locator(`:text-is("Member's First Name")`).first().click();

            // Click the "Use Variable" button
            await page.getByRole(`button`, { name: `Use Variable` }).click();

            // Type in `=` into text area
            await page.keyboard.type(`= "Richard"`);

            // Click the "Select" button
            await page.getByRole(`button`, { name: `Select`, exact: true }).click();

            // Click the "Save" button
            await page.getByRole(`button`, { name: `Save` }).click();

            await waitUntilLoaded(page);

            // Click the "Edit Screen - Internal" text
            await page
                .getByLabel(`Edit Screen - Internal`)
                .getByText(`Close`, { exact: true })
                .click();

        await waitUntilLoaded(page);

            try {
                await page.getByRole(`gridcell`, { name: screenName }).click();
                await waitUntilLoaded(page);

            } catch {
                await page
                    .getByLabel(`Edit Screen - Internal`)
                    .getByText(`Close`, { exact: true })
                    .click();
                await waitUntilLoaded(page);
                await page.getByRole(`gridcell`, { name: screenName }).click();
                await waitUntilLoaded(page);
            }

            // Click the "   Authorization - IP - BH" row
            await page
                .getByRole(`row`, { name: `   Authorization - IP - BH` })
                .getByRole(`checkbox`)
                .click();

            await waitUntilLoaded(page);

            // Click the "Close" text
            await page.getByText(`Close`, { exact: true }).click();

            await waitUntilLoaded(page);

            // Click the "Members" tab
            await page.getByRole(`tab`, { name: `Members` }).locator(`span`).click();

            await waitUntilLoaded(page);

            // Click the patient gridcell
            await page.getByRole(`textbox`, { name: `Search...` }).fill(patientName);
            await page.keyboard.press("Enter");
            await page.getByRole(`gridcell`, { name: patientName }).dblclick();

        await waitUntilLoaded(page);

            // Click `Authorizations` tab
            await page.locator(`[id="authorizations-menu"]`).click();

            // Click `Authorization` button
            await page
                .getByRole(`button`)
                .filter({ hasText: `Authorization Inpatient` })
                .click();

            // Click the "BH Inpatient" text
            await page.getByText(`BH Inpatient`, { exact: true }).click();

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the number input is visible and has value 0.01
            await expect(page.locator(`[class*="outerfielddiv"]:has-text("Number:") input:visible`)).toBeEmpty()

            // Click the "Member Detail" text
            await page.getByText(`Member Detail`, { exact: true }).first().click();

            // Assert that the patient first name is correct
            await expect(page.getByText(firstName, { exact: true })).toBeVisible();

            // Assert that the patient last name is correct
            await expect(page.getByText(lastName, { exact: true })).toBeVisible();


        });
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




test.describe('Rules – Computed When (Field and Variable)', () => {
        test('Computed When works with field and variable expressions', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            //--------------------------------
            // Arrange:
            //--------------------------------
            // Set constants
            const screenTemplateGroup = `Authorization - BH IP`;
            const defaultTemplate = `Authorization - IP - BH - Default`;
            const screenName = `${defaultTemplate} - Copy`;
            const loginID = `ComputedWhenField`;
            const computedNumber = `0.01`;
            const team = `Compliance Team`;
            const firstName = `QAWAntone`;
            const lastName = `Abbott`;
            const patientName = `${lastName}, ${firstName}`;

            // Sign in to the app
            //const { page } = await logIn({ loginID, slowMo: 1000 });

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                url, slowMo: 1000 });



            // Clean up: delete the template copy
            await cleanupScreenTemplateCopy(page, {
                screenName,
                screenTemplateGroup,
                defaultTemplate,
            });

            // Create a copy of the default template
            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                screenName,
            });

            //--------------------------------
            // Act:
            //--------------------------------
            // Click the "Tools" text
            await page.getByText(`Tools`).click();

            // Click the "Screen Templates" text
            await page.getByText(`Screen Templates`).click();

            // Click the "Authorization Service - RF" text
            await page.getByText(screenTemplateGroup).click();

            // Click the "Authorization - IP - BH - Default - Copy" gridcell
            await page.getByRole(`gridcell`, { name: screenName }).click();

            // Click the "Edit" button
            await page.getByRole(`button`, { name: `` }).click();

            // Click the " Field" button
            await page.getByRole(`button`, { name: ` Field` }).first().click();

            // Click the "Radio Button" text
            await page.getByText(`Radio Button`).nth(1).click();

            // Click the " Number" option
            await page.getByRole(`option`, { name: ` Number` }).click();

            // Click the "Add" button
            await page.getByRole(`button`, { name: `Add`, exact: true }).click();

            // Click `Number` input
            await page.locator(`#q_1_overlay`).click();

            // Wait page load
            //await waitUntilLoaded(page);

            // Click the `Rules` tab
            await page
                .locator(`[aria-controls="rules-tab-content"]`)
                .click({ force: true });

            // Click `Never Compute` input
            await page.getByText(`Never computed`).first().click();

            // Click the "Computed when expression..." option
            await page
                .getByRole(`option`, { name: `Computed when expression...` })
                .locator(`span`)
                .click();

            // Fill the "Set Computed Condition for:" dialog with
            await page
                .getByRole(`dialog`, { name: `Set Computed Condition for:` })
                .getByPlaceholder(`Search...`)
                .fill(`Team`);

            // Click `Search` button
            await page.locator(`#search-value-button`).click();

            //await waitUntilLoaded(page);

            // Click the "Team (auth_team_reference_id)" text
            await page.getByText(`Team (auth_team_reference_id)`).click();

            //await waitUntilLoaded(page);

            // Click the "Use Field (Code)" button
            await page.getByRole(`button`, { name: `Use Field (Code)` }).click();

            // Type-in `=`
            await page.keyboard.type(`=`);

            //await waitUntilLoaded(page);

            // Click the "Select..." combobox
            await page.getByRole(`combobox`, { name: `Select...` }).click();

            // Type in `Retro` into input field
            await page.keyboard.type(team);

            // Click the "Retro" option
            await page.getByRole(`option`, { name: team }).click();

            // Click the "Insert Code Value" button
            await page.getByRole(`button`, { name: `Insert Code Value` }).click();

            // Click the "Select" button
            await page.getByRole(`button`, { name: `Select`, exact: true }).click();

            // Increment Computed Value
            await page
                .getByLabel(`Rules`)
                .getByRole(`button`, { name: `Increase value` })
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
            // Assert the Number input in the Service section is empty
            await expect(
                page
                    .getByRole(`dialog`, { name: `Edit Screen - Internal (` })
                    .getByRole(`spinbutton`),
            ).toHaveValue("");

           // await waitUntilLoaded(page);

            // Click the "Edit Screen - Internal (" dialog
            await page
                .locator(`.input [name="auth_team_reference_id_input"]`)
                .click();

            //await waitUntilLoaded(page);

            // Type-in retro
            await page.keyboard.type(team);

            // Click the "Retro" text
            await page.getByText(team).click();

           // await waitUntilLoaded(page);

            // Assert the Number input in the Service section is empty
            await expect(
                page.locator(
                    `[class*="input"] span [class*="numeric-textbox-with-spinner"] >> nth=0`,
                ),
            ).toHaveValue(computedNumber);

            //--------------------------------
            // Arrange:
            //--------------------------------
            // Click the " Close" button
            await page.getByRole(`button`, { name: ` Close` }).click();

            await waitUntilLoaded(page);

            //--------------------------------
            // Act:
            //--------------------------------
            // Click computed when expression
            await page.locator(`:text("Number")`).last().click({ force: true });

            //await waitUntilLoaded(page);

            // Click the `Rules` tab
            await page
                .locator(`[aria-controls="rules-tab-content"]`)
                .click({ force: true });

            // Click `Computed when expression FX` button
            await page.locator(`[id=condition-rule-expression]`).click();

            // Click the "Clear Expression" button
            await page.getByRole(`button`, { name: `Clear Expression` }).click();

            // Click the "Variables" text
            await page.getByText(`Variables`).click();

            // Click the "Member`s first name" treeitem
            await page.locator(`:text-is("Member's First Name")`).first().click();

            // Click the "Use Variable" button
            await page.getByRole(`button`, { name: `Use Variable` }).click();

            // Type in `=` into text area
            await page.keyboard.type(`= "Richard"`);

            // Click the "Select" button
            await page.getByRole(`button`, { name: `Select`, exact: true }).click();

            // Click the "Save" button
            await page.getByRole(`button`, { name: `Save` }).click();

            await waitUntilLoaded(page);

            /*
            // Click the "Edit Screen - Internal" text
            await page
                .getByLabel(`Edit Screen - Internal`)
                .getByText(`Close`, { exact: true })
                .click();

            await waitUntilLoaded(page);

             */

            /*
            try {
                await page.getByRole(`gridcell`, { name: screenName }).click();
               // await waitUntilLoaded(page);

            } catch {
                await page
                    .getByLabel(`Edit Screen - Internal`)
                    .getByText(`Close`, { exact: true })
                    .click();
                await waitUntilLoaded(page);
                await page.getByRole(`gridcell`, { name: screenName }).click();
               // await waitUntilLoaded(page);
            }

             */



            await page.getByRole('dialog', { name: 'Edit Screen - Internal' }).getByLabel('Close').click();


            await waitUntilLoaded(page);
            await page.getByRole(`gridcell`, { name: screenName }).click();
            //await waitUntilLoaded(page);






            // Click the "   Authorization - IP - BH" row
            await page
                .getByRole(`row`, { name: `   Authorization - IP - BH` })
                .getByRole(`checkbox`)
                .click();

           // await waitUntilLoaded(page);

            // Click the "Close" text
            await page.getByText(`Close`, { exact: true }).click();

            await waitUntilLoaded(page);

            // Click the "Members" tab
            await page.getByRole(`tab`, { name: `Members` }).locator(`span`).click();

           // await waitUntilLoaded(page);

            // Click the patient gridcell
            await page.getByRole(`textbox`, { name: `Search...` }).fill(patientName);
            await page.keyboard.press("Enter");
            await page.getByRole(`gridcell`, { name: patientName }).dblclick();

           // await waitUntilLoaded(page);

            // Click `Authorizations` tab
            await page.locator(`[id="authorizations-menu"]`).click();

            // Click `Authorization` button
            await page
                .getByRole(`button`)
                .filter({ hasText: `Authorization Inpatient` })
                .click();

            // Click the "BH Inpatient" text
            await page.getByText(`BH Inpatient`, { exact: true }).click();

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the number input is visible and has value 0.01
            await expect(page.locator(`[class*="outerfielddiv"]:has-text("Number:") input:visible`)).toBeEmpty()

            // Click the "Member Detail" text
            await page.getByText(`Member Detail`, { exact: true }).first().click();

            // Assert that the patient first name is correct
            await expect(page.getByText(firstName, { exact: true })).toBeVisible();

            // Assert that the patient last name is correct
            await expect(page.getByText(lastName, { exact: true })).toBeVisible();


        });
    },
);