import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('RulesAlwaysMandatory', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `AlwaysMandatory`;
    const screenTemplateGroup = `Authorization - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const screenName = `${defaultTemplate} - Copy`;
    const mandatoryRadioButton = `Radio Button:`;
    const url = process.env.DEFAULT_URL_2;

    const { page } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    // Clean up existing copy
    await helpers.cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
    });

    // Create fresh copy
    await helpers.copyDefaultScreenTemplate(page, {
        defaultTemplate,
        screenTemplateGroup,
        customScreenName: screenName,
    });

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).first().click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: screenName }).click();
    await page.getByRole(`button`, { name: `` }).click();

    // Add new Radio Button field
    await page.getByRole(`button`, { name: ` Field` }).first().click();

    await page
        .getByRole(`combobox`)
        .filter({ hasText: `Radio ButtonRadio ButtonDrop` })
        .getByLabel(`select`)
        .click();

    await page
        .getByRole(`option`, { name: ` Radio Button` })
        .locator(`div`)
        .click();

    await page.getByRole(`button`, { name: `Add`, exact: true }).click();

    // Open Rules tab
    await page.locator(`[role="tab"] :text("Rules")`).click();

    // Change from Never mandatory → Always mandatory
    await page.getByText(`Never mandatory`).first().click();

    await page
        .getByRole(`option`, { name: `Always mandatory` })
        .locator(`span`)
        .click();

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    const saveRadioboxElement = page.locator(
        `[class*="left flex-container-row"]:has(:text("${mandatoryRadioButton}"))`,
    );

    //--------------------------------
    // Assert
    //--------------------------------

    // Verify required asterisk is visible
    await expect(
        saveRadioboxElement.locator(`[class*="required-asterisk"]`)
    ).toBeVisible({ timeout: 3000 });

    // Screenshot comparison
    await expect(
        page.getByText(`Radio Button:`, { exact: true })
    ).toHaveScreenshot(
        'always_mandatory_radio_button.png',
        { maxDiffPixelRatio: 0.5 }
    );

    //--------------------------------
    // Clean-up
    //--------------------------------

    // Close Preview
    try {
        await page.getByRole(`button`, { name: ` Close` }).click();
    } catch {}

    // Close Edit Screen modal safely
    const editModal = page.getByLabel(`Edit Screen - Internal`);
    if (await editModal.count() > 0) {
        const closeBtn = editModal.getByRole(`button`, { name: `Close`, exact: true });
        if (await closeBtn.count() > 0) {
            await closeBtn.first().click();
        }
    }

    /*
    // Final cleanup
    await helpers.cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
    });

     */
});
