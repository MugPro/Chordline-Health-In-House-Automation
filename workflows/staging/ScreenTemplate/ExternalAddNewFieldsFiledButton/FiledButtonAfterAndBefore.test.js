
import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 400;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

test.describe(
    'Field Button – Add Field After and Before (Single Test)',
    () => {
        test('Radio Button can be inserted AFTER and BEFORE Notice Type', async () => {

            //--------------------------------
            // Arrange:
            //--------------------------------
            // Set constants
            const screenTemplateGroup = `Compliance Notice - Grievance`;
            const defaultTemplate = `${screenTemplateGroup} - Default`;
            const screenName = `${defaultTemplate} - Copy`;
            const loginID = `FieldButtonBefore`;

           // const { page } = await logIn({ loginID });

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                url });



            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre-test)
            //--------------------------------
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
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
                screenName,
            });

            //--------------------------------
            // Navigate to Screen Templates
            //--------------------------------
            await clickAndWait(page, page.getByText('Tools'));
            await clickAndWait(page, page.getByText('Screen Templates').first());
            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByText(screenTemplateGroup));
            await clickAndWait(
                page,
                page.getByRole('gridcell', { name: screenName }),
            );














// Click the "" button
await page.getByRole(`button`, { name: `` }).click();

// Click the " Field" button
await page.getByRole(`button`, { name: ` Field` }).click();

// Click the "Before" radio
await page.getByRole(`radio`, { name: `Before` }).click();

// Click the "Add" button
await page.getByRole(`button`, { name: `Add`, exact: true }).click();

// Click the "Save" button
await page.getByRole(`button`, { name: `Save` }).click();

// Click the "Preview" button
await page.getByRole(`button`, { name: `Preview` }).click();

            await waitUntilLoaded(page);

// Get all label elements in the form section content
const labels = await page
    .locator(".formSectionContent .label")
    .allInnerTexts();

// Save radio button lable
const radioIndex = labels.findIndex((label) =>
    label.includes("Radio Button:"),
);

// Save noticeTypeLabel  lable
const noticeTypeIndex = labels.findIndex((label) =>
    label.includes("Notice Type:"),
);
//--------------------------------
// Assert:
//--------------------------------
// Assert the "Radio Button:" label is visible
await expect(page.getByText("Radio Button:").first()).toBeVisible();

// Assert the "Notice Type:" label is visible
await expect(page.getByText("Notice Type:").first()).toBeVisible();

// Assert that both labels are present
expect(radioIndex).not.toBe(-1);
expect(noticeTypeIndex).not.toBe(-1);

// Assert that "Radio Button:" appears before "Notice Type:"
expect(radioIndex).toBeLessThan(noticeTypeIndex);

    // Arrange:
    //--------------------------------
    // Click the " Close" button
    await page.getByRole(`button`, { name: ` Close` }).click();

    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Radio button` lable
    await page.locator(`.undefined`).first().click();

    // Click the Trashcan button for the previously created radio button
    await page
        .locator(
            `div[class="formSectionContent clearboth"]:has-text("Radio Button:") button[title="Remove"]:visible`,
        )
        .click();

    // Click the " Field" button
    await page.getByRole(`button`, { name: ` Field` }).click();

    // Click the "After" text
    await page.getByText(`After`).click();

    // Click the "Add" button
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();

    // Click the "Save" button
    await page.getByRole(`button`, { name: `Save` }).click();

    await waitUntilLoaded(page);

    // Click the "Preview" button
    await page.getByRole(`button`, { name: `Preview` }).click();

            await waitUntilLoaded(page);

    // Get all label elements in the form section content
    const labels2 = await page
        .locator(".formSectionContent .label")
        .allInnerTexts();

    // Save radio button lable
    const radioIndex2 = labels2.findIndex((label) =>
        label.includes("Radio Button:"),
    );

    // Save noticeTypeLabel  lable
    const noticeTypeIndex2 = labels2.findIndex((label) =>
        label.includes("Notice Type:"),
    );
    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert the "Radio Button:" label is visible
    await expect(page.getByText("Radio Button:").first()).toBeVisible();

    // Assert the "Notice Type:" label is visible
    await expect(page.getByText("Notice Type:").first()).toBeVisible();

    // Assert that both labels are present
    expect(radioIndex2).not.toBe(-1);
    expect(noticeTypeIndex2).not.toBe(-1);

    // Assert that "Radio Button:" appears before "Notice Type:"
    expect(noticeTypeIndex2).toBeLessThan(radioIndex2);

    // Clean up: delete the template copy
    // Click the "​ Edit Screen - Internal (" dialog
    await page
        .getByRole(`dialog`, { name: `​ Edit Screen - Internal (` })
        .getByLabel(`Close`)
        .click();

            await waitUntilLoaded(page);

    // Click the "Edit Screen - Internal" text
    await page
        .getByLabel(`Edit Screen - Internal`)
        .getByText(`Close`, { exact: true })
        .click();

    await waitUntilLoaded(page);

    // Click the "Close" text
    await page.getByText(`Close`, { exact: true }).click();

    // delete the template copy
    await cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
    });
});
},
);