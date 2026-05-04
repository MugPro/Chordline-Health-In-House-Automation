import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after actions
------------------------------------------- */
const ACTION_PAUSE_MS = 100;

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

test.describe('Rules - Notify On Change (Always Notify)', () => {
    test('Notification appears every time field value changes', async () => {

        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = 'RuleNotifyOnChangeAlwaysNot';
        const screenTemplateGroup = 'Work Log';
        const defaultTemplate = 'Work Log - Default';
        const screenName = 'NotifyOnChangeAlways';
        const screenTemplateCopyName = `${screenName}${Date.now()}`;
        const fieldText = 'Should always notify';
        const resp1 = 'Yes';
        const resp2 = 'No';

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });


        await waitUntilLoaded(page);

        // -- Cleanup: Start --
        await cleanupScreenTemplateCopy(page, {
            screenTemplateGroup,
            defaultTemplate,
            screenName,
            dontClose: true,
        });

        await cleanupScreenTemplateCopy(page, {
            screenTemplateGroup,
            defaultTemplate,
            screenName: 'Work Log - Default - Copy',
            onScreen: true,
            dontClose: true,
        });
        // -- Cleanup: End --

        // Copy default template
        await copyDefaultScreenTemplate(page, {
            screenTemplateGroup,
            defaultTemplate,
            onScreen: true,
            dontClose: true,
        });

        // Rename screen
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
                '[data-role="staticlist"] [role="option"]:has-text("Checkbox"):visible',
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
                '[data-role="staticlist"] [role="option"]:has-text("Field (Lookup): Completed By")',
            ),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Add', exact: true }),
        );

        //--------------------------------
        // Act – Field editor setup
        //--------------------------------
        await fillAndWait(
            page,
            page.locator('#question-text'),
            fieldText,
        );

        // Add Valid Response: Yes
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

        // Add Valid Response: No
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
        // Act – Rules tab
        //--------------------------------
        await clickAndWait(page, page.getByText('Rules'));

        await clickAndWait(
            page,
            page.getByText('Never notify').first(),
        );

        await clickAndWait(
            page,
            page
                .getByRole('option', {
                    name: '​ Always notify when this field\'s value changes',
                    exact: true,
                })
                .locator('span'),
        );

        await fillAndWait(
            page,
            page.locator('#notifyOnEntry-rule-element[type="text"]'),
            `This is from ${screenTemplateCopyName}`,
        );

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

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert – Preview opened
        //--------------------------------
        await expect(
            page.locator(
                'body #modal-window_wnd_title:text("New Screen - Internal (PREVIEW)")',
            ),
        ).toBeVisible();

        //--------------------------------
        // Assert – Changing values triggers notification
        //--------------------------------
        await page.getByRole('checkbox', { name: 'Yes' }).check();

        await expect(page.getByText('Notification', { exact: true }))
            .toBeVisible();

        await expect(
            page.getByText(`This is from ${screenTemplateCopyName}`),
        ).toBeVisible();

        await expect(
            page.getByLabel('Notification').getByText(fieldText),
        ).toBeVisible();

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Okay' }),
        );

        // Change value again
        await page.getByRole('checkbox', { name: 'No' }).check();

        await expect(page.getByText('Notification', { exact: true }))
            .toBeVisible();

        await expect(
            page.getByText(`This is from ${screenTemplateCopyName}`),
        ).toBeVisible();

        await expect(
            page.getByLabel('Notification').getByText(fieldText),
        ).toBeVisible();

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Okay' }),
        );


    });
});
