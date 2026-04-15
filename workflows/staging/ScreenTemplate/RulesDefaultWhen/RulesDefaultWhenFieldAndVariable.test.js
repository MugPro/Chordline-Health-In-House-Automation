import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate,
    reportCleanupFailed,
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


const dbclickAndWait = async (page, locator, ms = ACTION_PAUSE_MS) => {
    await locator.dblclick();
    await pause(page, ms);
};

/* -------------------------------------------
   Shared state between tests
------------------------------------------- */
let page;
let screenTemplateGroup;
let defaultTemplate;
let screenName;
let screenTemplateCopyName;
let defaultVal;

test.describe('Rules – Default when (Field and Variable)', () => {

    test('Rules - Default when - field', async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'RulesDefaultWhen';
        screenTemplateGroup = 'Authorization - BH RF';
        defaultTemplate = 'Authorization - RF - BH - Default';
        const copyTemplate = 'Authorization - RF - BH - Default - Copy';
        screenName = 'DefaultWhen';
        screenTemplateCopyName = `${screenName}${Date.now()}`;
        const fieldText = 'Default text when Team is Compliance';
        defaultVal = 'Default Value text';

        ({ page } = await logIn({ loginID, slowMo: 300 }));

        /*
        try {
            await cleanupScreenTemplateCopy(page, {
                screenTemplateGroup,
                defaultTemplate,
                screenName: copyTemplate,
                dontClose: true,
            });

            await cleanupScreenTemplateCopy(page, {
                screenTemplateGroup,
                defaultTemplate,
                screenName,
                onScreen: true,
                dontClose: true,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanupScreenTemplateCopy',
                errorMsg: e.message,
            });
        }

         */

        await copyDefaultScreenTemplate(page, {
            screenTemplateGroup,
            defaultTemplate,
            customScreenName: screenTemplateCopyName,
            //onScreen: true,
            dontClose: true,
        });

        //--------------------------------
        // Act – Create text field
        //--------------------------------
        await expect(async () => {
            await page
                .getByRole('button', { name: ' Field' })
                .first()
                .click({ force: true, delay: 250 });

            await page
                .getByRole('radio', { name: 'New Custom field' })
                .click({ timeout: 3500 });
        }).toPass({ timeout: 30_000 });

        await clickAndWait(
            page,
            page.locator('[aria-controls="fieldTypes_listbox"]'),
        );

        await clickAndWait(
            page,
            page.locator(
                `[data-role="staticlist"] [role="option"] :text-is("Text"):visible`,
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
                `[data-role="staticlist"] [role="option"]:has-text("Field (Lookup): Team")`,
            ),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        //--------------------------------
        // Act – Configure Default When (field)
        //--------------------------------
        await page.locator('#question-text').fill(fieldText);

        await clickAndWait(page, page.getByText('Rules', { exact: true }));

        await clickAndWait(
            page,
            page.getByText('Never default').first(),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', {
                    name: '​ Default when...',
                    exact: true,
                })
                .locator('span'),
        );

        await clickAndWait(
            page,
            page.getByText('Select a field...').first(),
        );

        await clickAndWait(
            page,
            page.getByRole('option', { name: '​ Team' }),
        );

        await clickAndWait(
            page,
            page
                .getByRole('tabpanel', { name: 'Rules' })
                .getByLabel('expand combobox'),
        );

        await clickAndWait(page, page.getByText('Compliance Team'));

        await page
            .locator('#default-rule-element')
            .fill(defaultVal);

        //--------------------------------
        // Act – Preview
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
        // Assert – Default absent initially
        //--------------------------------
        await waitUntilLoaded(page);

        const fieldInput = page
            .getByRole('dialog', {
                name: '​ New Screen - Internal (',
            })
            .locator('[id*="auth_custom_field"]');

        await expect(fieldInput).not.toHaveValue(defaultVal);

        //--------------------------------
        // Act – Select Team
        //--------------------------------
        await expect(async () => {
            await page
                .getByRole('dialog', {
                    name: '​ New Screen - Internal (',
                })
                .getByLabel('expand combobox')
                .nth(2)
                .click();

            await page
                .getByText('Compliance Team')
                .click({ timeout: 3500 });
        }).toPass({ timeout: 30_000 });

        //--------------------------------
        // Assert – Default applied
        //--------------------------------
        await expect(fieldInput).toHaveValue(defaultVal);




        //--------------------------------
        // Arrange
        //--------------------------------
        const memberMale = 'Boehm, QAWDion';
        const memberFemale = 'Bannister, Brenda';

        //--------------------------------
        // Act – Configure variable rule
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Close' }),
        );

        await clickAndWait(
            page,
            page.locator('div[id*="auth_custom_field_"]'),
        );

        await clickAndWait(
            page,
            page.getByText('Rules', { exact: true }),
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
            page
                .getByRole('option', {
                    name: "​ Member's Birth Gender",
                })
                .locator('span'),
        );

        await clickAndWait(
            page,
            page
                .getByRole('tabpanel', { name: 'Rules' })
                .getByLabel('expand combobox'),
        );

        await clickAndWait(
            page,
            page.getByText('Female', { exact: true }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Save' }),
        );

        await waitUntilLoaded(page);

        //--------------------------------
        // Act – Activate template
        //--------------------------------
        try {
            await clickAndWait(
                page,
                page
                .getByLabel('New Screen - Internal')
                .getByText('Close', { exact: true }),

            );

        } catch {
            await clickAndWait(
                page,
                page
                .getByLabel('New Screen - Internal')
                .getByText('Close', { exact: true }),

            );
        }


        await fillAndWait(
            page,
            page
            .getByLabel('Internal')
            .getByRole('textbox', { name: 'Search...' }),
            screenTemplateCopyName

        );

        await clickAndWait(
            page,
            page.locator('#admin-search-button'),
        );

        await clickAndWait(
            page,
            page
            .locator(
                `[role="row"]:has(:text-is("${screenTemplateCopyName}")) input`,
            )
            .first(),

        );

        await clickAndWait(
            page,
            page.getByText('Close', { exact: true }),

        );

        //--------------------------------
        // Assert – Male member (no default)
        //--------------------------------
        await clickAndWait(
            page,
            page
            .getByRole('tab', { name: 'Members' })
            .locator('span'),

        );

        await fillAndWait(
            page,
            page
            .getByRole('textbox', { name: 'Search...' }),
            memberMale
        );


        await page.keyboard.press('Enter');

        await dbclickAndWait(
            page,
            page
            .getByRole('gridcell', { name: memberMale })
            .first(),

        );

        //await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.locator('#authorizations-menu'),

        );

        await page
            .getByRole('button')
            .filter({ hasText: 'Authorization Inpatient' })
            .hover();

        await clickAndWait(
            page,
            page.getByText('BH Referral'),

        );

        await expect(
            page.locator('[id*="auth_custom_field"]'),
        ).not.toHaveValue(defaultVal);

        //--------------------------------
        // Assert – Female member (default present)
        //--------------------------------
       await clickAndWait(
            page,
            page
            .getByRole('button', { name: ' Cancel' }),

        );

        await clickAndWait(
            page,
            page.getByText('Home', { exact: true }),

        );

        await clickAndWait(
            page,
            page.locator('[selectedvalue="active"]'),

        );

        await page.locator('#inactive').check();

        await fillAndWait(
            page,
            page
            .getByRole('textbox', { name: 'Search...' }),
            memberFemale
        );


        await page.keyboard.press('Enter');

        await dbclickAndWait(
            page,
            page
            .getByRole('gridcell', { name: memberFemale })
            .first(),

        );

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.locator('#authorizations-menu:visible'),

        );

        await page
            .getByRole('button')
            .filter({ hasText: 'Authorization Inpatient' })
            .hover();

        await clickAndWait(
            page,
            page
            .getByLabel(memberFemale)
            .getByText('BH Referral'),

        );

        await expect(
            page.locator('[id*="auth_custom_field"]'),
        ).toHaveValue(defaultVal);



        // Cleanup
        //--------------------------------
        await page
            .getByRole('button', { name: ' Cancel' })
            .click();

        try {
            await cleanupScreenTemplateCopy(page, {
                screenTemplateGroup,
                screenName,
                defaultTemplate,
                dontClose: true,
            });

            await cleanupScreenTemplateCopy(page, {

                screenTemplateGroup,
                defaultTemplate,
                screenName: screenTemplateCopyName,
                onScreen: true,
            });
        } catch (e) {
            await reportCleanupFailed({
                dedupKey: 'cleanUpThingsHelper',
                errorMsg: e.message,
            });
        }

        await page.close();
    });
});



/*await page.getByText('Notification').click();
  await expect(page.getByText('Notification')).toBeVisible();
  await expect(page.getByText('This record is locked by')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Okay' })).toBeVisible();
  await page.getByRole('button', { name: 'Okay' }).click();

 */